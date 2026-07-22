import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { CONVERSION_MODULE } from "../../../../modules/conversion";
import {
  calculateSourcingMargin,
  DEFAULT_GLOBAL_COSTS,
  evaluateShoppingEligibility,
  resolveSourcingCosts,
} from "../../../../modules/conversion/utils/sourcing";
import { requireSourcingOwner } from "../_owner";

const batchSize = 5000;
const defaultLimit = 50;
const maxLimit = 100;
const editableFields = new Set([
  "source_system", "supplier_name", "source_url", "source_sku", "source_product_id",
  "source_categories", "currency_code", "purchase_price", "supplier_shipping",
  "inbound_handling", "import_duties", "outbound_fulfillment", "other_costs",
  "return_reserve_rate", "ad_cost_rate", "warehouse_country", "eu_warehouse",
  "source_availability", "source_checked_at", "image_verified", "internal_notes",
  "confidence", "risk_flags", "public_brand", "public_mpn",
]);

const productCategory = (product: any) =>
  product.categories?.[0]?.handle ||
  product.metadata?.source_category ||
  product.categories?.[0]?.name ||
  "uncategorized";

const googleCategoryByHandle: Record<string, string> = {
  chairs: "443", sofas: "460", tables: "4355", storage: "6356",
  "coffee-tables": "1395", "side-tables": "1549", "console-tables": "1602",
  sideboards: "447", "living-room-furniture": "436", "accent-furniture": "436",
  "dining-room-furniture": "6347", "bedroom-furniture": "6346",
  "home-office-furniture": "6362", "entryway-furniture": "436",
  "bathroom-furniture": "2081", "bathroom-furniture-sets": "500000",
  "kitchen-furniture": "6934", "kitchen-tools-gadgets": "638",
  "kids-furniture": "436", "furniture-replacement-parts": "436",
};

const productTypeByHandle: Record<string, string> = {
  chairs: "Meubels > Woonkamer > Stoelen en fauteuils",
  sofas: "Meubels > Woonkamer > Banken",
  tables: "Meubels > Eetkamer > Eettafels",
  storage: "Meubels > Woonkamer > Kasten en opbergmeubels",
  "coffee-tables": "Meubels > Woonkamer > Salontafels",
  "side-tables": "Meubels > Woonkamer > Bijzettafels",
  "console-tables": "Meubels > Hal > Consoletafels",
  sideboards: "Meubels > Woonkamer > Dressoirs",
};

const positiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

const asNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const profileFallback = (product: any) => ({
  product_id: product.id,
  source_system: product.metadata?.source_system || null,
  supplier_name: product.metadata?.supplier_name || product.metadata?.source_system || null,
  source_url: product.metadata?.source_url || null,
  source_sku: product.metadata?.source_sku || product.variants?.find((v: any) => v.sku)?.sku || null,
  source_product_id: product.metadata?.source_product_id || null,
  source_categories: product.metadata?.source_categories || null,
  currency_code: "EUR",
  purchase_price: asNumber(product.metadata?.purchase_price_eur),
  source_availability: product.metadata?.source_availability || null,
  source_checked_at: product.metadata?.source_checked_at || null,
  eu_warehouse: Boolean(product.metadata?.source_eu_warehouse),
  image_verified: false,
  confidence: "unknown",
  shopping_status: "draft",
  gate_failures: [],
  owner_approved: false,
});

async function loadProducts(query: any) {
  const products: any[] = [];
  for (let skip = 0; ; skip += batchSize) {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "description", "handle", "status", "thumbnail", "images.url",
        "material", "categories.name", "categories.handle", "metadata",
        "variants.id", "variants.title", "variants.sku", "variants.ean", "variants.barcode",
      ],
      pagination: { skip, take: batchSize },
    });
    products.push(...data);
    if (data.length < batchSize) break;
  }
  return products;
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await requireSourcingOwner(req);
  const query = req.scope.resolve("query") as any;
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const [products, profiles, defaults, merchantIssues] = await Promise.all([
    loadProducts(query),
    service.listSourcingProfiles({}, { take: 10000 }),
    service.listSourcingCostDefaults({}, { take: 10000 }),
    service.listMerchantIssues({ resolved_at: null }, { take: 10000 }),
  ]);
  const profileByProduct = new Map(profiles.map((profile: any) => [profile.product_id, profile]));
  const globalDefaults = defaults.find((item: any) => item.scope === "global") || DEFAULT_GLOBAL_COSTS;
  const categoryDefaults = new Map(
    defaults.filter((item: any) => item.scope === "category").map((item: any) => [item.scope_key, item]),
  );
  const issueByProduct = new Map<string, any[]>();
  merchantIssues.forEach((issue: any) => {
    if (!issue.product_id) return;
    issueByProduct.set(issue.product_id, [...(issueByProduct.get(issue.product_id) || []), issue]);
  });
  const sourceProducts = products.filter((product: any) =>
    profileByProduct.has(product.id) || Boolean(product.metadata?.source_system),
  );
  const priceByProduct = new Map(
    sourceProducts.map((product: any) => [
      product.id,
      asNumber(product.metadata?.suggested_retail_price_eur) || 0,
    ]),
  );
  const categoryPrices = new Map<string, number[]>();
  sourceProducts.forEach((product: any) => {
    const price = priceByProduct.get(product.id) || 0;
    if (!price) return;
    const key = productCategory(product);
    categoryPrices.set(key, [...(categoryPrices.get(key) || []), price].sort((a, b) => a - b));
  });
  const duplicateCounts = new Map<string, number>();
  sourceProducts.forEach((product: any) => {
    const key = `${product.title}|${product.thumbnail}|${priceByProduct.get(product.id)}`.toLowerCase();
    duplicateCounts.set(key, (duplicateCounts.get(key) || 0) + 1);
  });

  const rows = sourceProducts.map((product: any) => {
    const profile: any = profileByProduct.get(product.id) || profileFallback(product);
    const category = productCategory(product);
    const prices = categoryPrices.get(category) || [];
    const median = prices.length ? prices[Math.floor(prices.length / 2)] : null;
    const retailPrice = priceByProduct.get(product.id) || 0;
    const costs = resolveSourcingCosts(profile, categoryDefaults.get(category) || {}, globalDefaults);
    const margin = calculateSourcingMargin(retailPrice, costs);
    const issues = issueByProduct.get(product.id) || [];
    const duplicateKey = `${product.title}|${product.thumbnail}|${retailPrice}`.toLowerCase();
    const googleCategory = googleCategoryByHandle[category];
    const productType = productTypeByHandle[category] || `Meubels > ${product.categories?.[0]?.name || category}`;
    const eligibility = evaluateShoppingEligibility({
      published: product.status === "published",
      retailPrice,
      categoryMedian: median,
      sourceCheckedAt: profile.source_checked_at,
      hasSourceAvailability: Boolean(profile.source_availability),
      title: product.title,
      description: product.description,
      productType,
      googleProductCategory: googleCategory,
      hasImage: Boolean(product.thumbnail || product.images?.length),
      imageVerified: Boolean(profile.image_verified),
      duplicate: (duplicateCounts.get(duplicateKey) || 0) > 1,
      hasCriticalMerchantIssue: issues.some((item: any) => ["error", "disapproved"].includes(item.severity)),
      purchasePrice: costs.purchase_price,
    });
    return {
      ...product,
      metadata: undefined,
      sourcing: {
        ...profile,
        category,
        retail_price: retailPrice,
        image_count: product.images?.length || (product.thumbnail ? 1 : 0),
        costs,
        margin,
        eligibility,
        merchant_issues: issues,
        google_product_category: googleCategory,
        product_type: productType,
      },
    };
  });

  const search = String(req.query.q || "").trim().toLowerCase();
  const state = String(req.query.state || "all");
  const searched = search
    ? rows.filter((row: any) => [row.title, row.sourcing.source_sku, row.sourcing.category, row.sourcing.supplier_name]
        .filter(Boolean).join(" ").toLowerCase().includes(search))
    : rows;
  const filtered = searched.filter((row: any) => {
    if (state === "eligible") return row.sourcing.eligibility.eligible;
    if (state === "awaiting") return row.sourcing.eligibility.eligible && !row.sourcing.owner_approved;
    if (state === "approved") return row.sourcing.owner_approved;
    if (state === "quarantined") return row.sourcing.shopping_status === "quarantined";
    if (state === "stale") return row.sourcing.eligibility.stale;
    if (state === "merchant-error") return row.sourcing.merchant_issues.some((i: any) => i.severity !== "warning");
    if (state === "margin-incomplete") return !row.sourcing.margin.complete;
    return true;
  });
  const stats = rows.reduce((acc: any, row: any) => {
    if (row.sourcing.eligibility.eligible) acc.eligible++;
    if (row.sourcing.eligibility.eligible && !row.sourcing.owner_approved) acc.awaiting++;
    if (row.sourcing.owner_approved) acc.approved++;
    if (row.sourcing.shopping_status === "quarantined") acc.quarantined++;
    if (row.sourcing.eligibility.stale) acc.stale++;
    if (row.sourcing.merchant_issues.some((i: any) => i.severity !== "warning")) acc.merchant_error++;
    if (!row.sourcing.margin.complete) acc.margin_incomplete++;
    return acc;
  }, { eligible: 0, awaiting: 0, approved: 0, quarantined: 0, stale: 0, merchant_error: 0, margin_incomplete: 0 });
  const limit = Math.min(Math.max(positiveInteger(req.query.limit, defaultLimit), 1), maxLimit);
  const offset = positiveInteger(req.query.offset, 0);
  res.json({ products: filtered.slice(offset, offset + limit), count: filtered.length, total: rows.length, stats, limit, offset });
}

type UpdateBody = {
  product_ids?: string[];
  action?: "update" | "approve" | "revoke" | "quarantine" | "verify";
  values?: Record<string, unknown>;
  reason?: string;
};

export async function POST(req: AuthenticatedMedusaRequest<UpdateBody>, res: MedusaResponse) {
  const owner = await requireSourcingOwner(req);
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const query = req.scope.resolve("query") as any;
  const productIds = Array.from(new Set(req.body.product_ids || [])).filter(Boolean);
  const action = req.body.action || "update";
  const reason = req.body.reason?.trim();
  if (!productIds.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Selecteer minimaal één product.");
  if (["quarantine"].includes(action) && !reason) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Een reden is verplicht.");
  }
  const existing = await service.listSourcingProfiles({ product_id: productIds }, { take: productIds.length });
  const byProduct = new Map(existing.map((profile: any) => [profile.product_id, profile]));
  if (action === "approve") {
    const [{ data: products }, merchantIssues] = await Promise.all([
      query.graph({
        entity: "product",
        fields: ["id", "title", "description", "status", "thumbnail", "images.url", "metadata", "categories.handle"],
        filters: { id: productIds },
      }),
      service.listMerchantIssues({ product_id: productIds, resolved_at: null }, { take: 10000 }),
    ]);
    const issueProducts = new Set(merchantIssues.filter((item: any) => item.severity !== "warning").map((item: any) => item.product_id));
    for (const product of products) {
      const profile: any = byProduct.get(product.id);
      const checkedAt = profile?.source_checked_at ? new Date(profile.source_checked_at).getTime() : 0;
      const category = product.categories?.[0]?.handle;
      const retailPrice = Number(product.metadata?.suggested_retail_price_eur || 0);
      const blockers = [
        product.status !== "published" && "niet gepubliceerd",
        (!retailPrice || retailPrice > 10_000) && "ongeldige of extreme verkoopprijs",
        Number(profile?.purchase_price || 0) > 5_000 && "extreme inkoopprijs",
        (!checkedAt || Date.now() - checkedAt > 86_400_000) && "broncontrole ouder dan 24 uur",
        !profile?.source_availability && "voorraad niet geverifieerd",
        !profile?.image_verified && "beeld niet geverifieerd",
        (!product.title || !product.description) && "titel of beschrijving ontbreekt",
        !(product.thumbnail || product.images?.length) && "afbeelding ontbreekt",
        !googleCategoryByHandle[category] && "Google-categorie ontbreekt",
        issueProducts.has(product.id) && "kritieke Merchant-melding",
        profile?.shopping_status === "quarantined" && "product staat in quarantaine",
      ].filter(Boolean);
      if (blockers.length) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${product.title} kan niet worden goedgekeurd: ${blockers.join(", ")}.`,
        );
      }
    }
  }
  const updated: any[] = [];
  for (const productId of productIds) {
    let profile: any = byProduct.get(productId);
    if (!profile) {
      profile = await service.createSourcingProfiles({ product_id: productId, currency_code: "EUR", updated_by: owner.email });
    }
    const patch: Record<string, unknown> = { updated_by: owner.email };
    if (action === "update") {
      Object.entries(req.body.values || {}).forEach(([key, value]) => {
        if (editableFields.has(key)) patch[key] = value === "" ? null : value;
      });
    } else if (action === "approve") {
      patch.owner_approved = true;
      patch.approved_by = owner.email;
      patch.approved_at = new Date();
      patch.shopping_status = "approved";
      patch.quarantine_reason = null;
    } else if (action === "revoke") {
      patch.owner_approved = false;
      patch.approved_by = null;
      patch.approved_at = null;
      patch.shopping_status = "awaiting_approval";
    } else if (action === "quarantine") {
      patch.owner_approved = false;
      patch.shopping_status = "quarantined";
      patch.quarantine_reason = reason;
    } else if (action === "verify") {
      patch.source_checked_at = new Date();
      patch.image_verified = true;
    }
    const saved = await service.updateSourcingProfiles({ id: profile.id, ...patch });
    await service.createSourcingAuditLogs({
      profile_id: profile.id,
      product_id: productId,
      action,
      changes: patch,
      actor_id: owner.id,
      actor_email: owner.email,
      reason: reason || null,
    });
    updated.push(saved);
  }
  res.json({ profiles: updated });
}
