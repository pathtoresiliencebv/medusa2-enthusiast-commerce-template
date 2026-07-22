import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";

import {
  catalogMarginPolicy,
  catalogMarginSnapshot,
  protectedRetailPrice,
} from "../utils/catalog-pricing";
import { buildCatalogSeo } from "../utils/catalog-seo";

const chunkSize = 50;

const chunks = <T>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

export default async function optimizeSourcedCatalog({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "metadata",
      "categories.name",
      "variants.id",
      "variants.sku",
    ],
    pagination: { skip: 0, take: 10000 },
  });

  const sourcedProducts = products.filter(
    (product: any) => product.metadata?.source_system === "SHEIN",
  );
  const productUpdates: any[] = [];
  const variantUpdates: any[] = [];

  for (const product of sourcedProducts) {
    const metadata = product.metadata || {};
    const purchasePrice = Number(metadata.purchase_price_eur || 0);
    if (!purchasePrice) continue;

    const sourceId = String(
      metadata.source_goods_id || metadata.source_sku || product.id,
    );
    const seo = buildCatalogSeo({
      currentTitle: product.title,
      sourceTitle: metadata.source_title,
      categoryName:
        metadata.source_category || product.categories?.[0]?.name || "Meubels",
      sourceId,
      attributes: Array.isArray(metadata.source_attributes)
        ? metadata.source_attributes
        : [],
    });
    const retailPrice = protectedRetailPrice(purchasePrice);
    const legacyHandles = Array.from(
      new Set(
        [
          ...(Array.isArray(metadata.legacy_handles)
            ? metadata.legacy_handles
            : []),
          product.handle,
        ].filter((handle) => handle && handle !== seo.handle),
      ),
    );

    productUpdates.push({
      id: product.id,
      title: seo.title,
      handle: seo.handle,
      description: seo.productDescription,
      metadata: {
        ...metadata,
        legacy_handles: legacyHandles,
        seo_title: seo.seoTitle,
        seo_description: seo.seoDescription,
        seo_keywords: seo.keywords,
        search_tags: seo.keywords,
        canonical_handle: seo.handle,
        seo_status: "ready",
        seo_generated_at: "2026-07-15",
        suggested_retail_price_eur: retailPrice,
        margin_policy: {
          ...catalogMarginPolicy,
          prices_include_vat: true,
        },
        margin_snapshot: catalogMarginSnapshot(purchasePrice, retailPrice),
      },
    });

    for (const variant of product.variants || []) {
      variantUpdates.push({
        id: variant.id,
        prices: [{ amount: retailPrice, currency_code: "eur" }],
        metadata: {
          ...metadata,
          suggested_retail_price_eur: retailPrice,
          margin_snapshot: catalogMarginSnapshot(purchasePrice, retailPrice),
        },
      });
    }
  }

  logger.info(
    `${productUpdates.length} producten en ${variantUpdates.length} varianten worden SEO- en margegereed gemaakt.`,
  );
  console.table(
    productUpdates.slice(0, 20).map((product) => ({
      titel: product.title,
      slug: product.handle,
      verkoopprijs: product.metadata.suggested_retail_price_eur,
      marge: `${product.metadata.margin_snapshot.contribution_margin_percent}%`,
    })),
  );

  if (process.env.DRY_RUN === "1") {
    logger.info("Dry-run voltooid; er is niets gewijzigd.");
    return;
  }

  for (const batch of chunks(productUpdates, chunkSize)) {
    await updateProductsWorkflow(container).run({
      input: { products: batch },
    });
  }
  for (const batch of chunks(variantUpdates, chunkSize)) {
    await updateProductVariantsWorkflow(container).run({
      input: { product_variants: batch },
    });
  }

  logger.info("Catalogusoptimalisatie voltooid.");
}
