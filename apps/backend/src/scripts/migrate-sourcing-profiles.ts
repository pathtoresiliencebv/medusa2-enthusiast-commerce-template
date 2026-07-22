import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow, updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows";

import { CONVERSION_MODULE } from "../modules/conversion";

const sensitiveKeys = new Set([
  "purchase_price_eur", "source_url", "source_sku", "source_goods_id", "source_product_id",
  "source_checked_at", "margin_policy", "margin_snapshot", "supplier_notes", "internal_notes",
]);
const cleanMetadata = (metadata: Record<string, unknown> = {}) =>
  Object.fromEntries(Object.entries(metadata).filter(([key]) => !sensitiveKeys.has(key)));
const chunks = <T>(items: T[], size = 50) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
};

export default async function migrateSourcingProfiles({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const service = container.resolve(CONVERSION_MODULE) as any;
  const apply = process.env.APPLY === "1";
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "metadata", "variants.id", "variants.sku", "variants.metadata"],
    pagination: { skip: 0, take: 10000 },
  });
  const sourced = products.filter((product: any) => product.metadata?.source_system);
  logger.info(`${sourced.length} bronproducten gevonden; modus=${apply ? "APPLY" : "DRY_RUN"}.`);
  if (!apply) return;

  const defaults = await service.listSourcingCostDefaults({ scope: "global", scope_key: "default" }, { take: 1 });
  if (!defaults.length) await service.createSourcingCostDefaults({
    scope: "global", scope_key: "default", vat_rate: 0.21, payment_rate: 0.019,
    payment_fixed_fee: 0.25, updated_by: "system:migrate-sourcing-profiles",
  });

  const existingProfiles = await service.listSourcingProfiles({}, { take: 10000 });
  const existingByProduct = new Map(existingProfiles.map((profile: any) => [profile.product_id, profile]));
  const creates: any[] = [];
  const updates: any[] = [];
  const productUpdates: any[] = [];
  const variantUpdates: any[] = [];
  const quarantineByProduct = new Map<string, boolean>();
  for (const product of sourced) {
    const metadata = product.metadata || {};
    const sourceProductId = String(metadata.source_goods_id || metadata.source_product_id || "") || null;
    const quarantine = ["346028150", "351776593"].includes(sourceProductId || "");
    const payload = {
      product_id: product.id, source_system: metadata.source_system || null,
      supplier_name: metadata.supplier_name || metadata.source_system || null,
      source_url: metadata.source_url || null,
      source_sku: metadata.source_sku || product.variants?.find((variant: any) => variant.sku)?.sku || null,
      source_product_id: sourceProductId,
      source_categories: metadata.source_categories || (metadata.source_category ? [metadata.source_category] : null),
      currency_code: "EUR", purchase_price: Number(metadata.purchase_price_eur) || null,
      eu_warehouse: Boolean(metadata.source_eu_warehouse),
      source_availability: metadata.source_availability || null,
      source_checked_at: metadata.source_checked_at ? new Date(metadata.source_checked_at) : null,
      confidence: "unknown", image_verified: false,
      shopping_status: quarantine ? "quarantined" : "draft",
      quarantine_reason: quarantine ? "Extreme bronprijs; opnieuw verifiëren voordat dit product verkocht of geadverteerd wordt." : null,
      owner_approved: false, updated_by: "system:migrate-sourcing-profiles",
    };
    const existing: any = existingByProduct.get(product.id);
    if (existing) updates.push({ id: existing.id, ...payload });
    else creates.push(payload);
    quarantineByProduct.set(product.id, quarantine);
    productUpdates.push({ id: product.id, metadata: cleanMetadata(metadata) });
    variantUpdates.push(...(product.variants || []).map((variant: any) => ({ id: variant.id, metadata: cleanMetadata(variant.metadata || {}) })));
  }
  const savedProfiles: any[] = [];
  for (const batch of chunks(creates)) savedProfiles.push(...await service.createSourcingProfiles(batch));
  for (const batch of chunks(updates)) savedProfiles.push(...await service.updateSourcingProfiles(batch));
  const auditPayloads = savedProfiles.map((saved) => ({
    profile_id: saved.id, product_id: saved.product_id, action: "metadata_backfill",
    changes: { migrated_keys: [...sensitiveKeys], quarantined: quarantineByProduct.get(saved.product_id) || false },
    actor_id: "system", actor_email: "system@example.com", reason: "Migratie naar afgeschermde sourcingtabellen",
  }));
  for (const batch of chunks(auditPayloads, 100)) await service.createSourcingAuditLogs(batch);
  for (const batch of chunks(productUpdates)) await updateProductsWorkflow(container).run({ input: { products: batch } });
  for (const batch of chunks(variantUpdates)) await updateProductVariantsWorkflow(container).run({ input: { product_variants: batch } });
  logger.info("Sourcingprofielen gevuld en gevoelige publieke metadata verwijderd.");
}
