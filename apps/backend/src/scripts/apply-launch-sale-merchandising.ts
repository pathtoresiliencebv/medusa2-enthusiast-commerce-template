import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";

import { compareAtPrice } from "../utils/catalog-pricing";

const chunkSize = 50;
const targetShare = 0.18;
const salePercents = [10, 12, 15, 18, 20];

const chunks = <T>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

const hash = (value: string) =>
  value.split("").reduce((total, character) => {
    return (total * 31 + character.charCodeAt(0)) % 100000;
  }, 7);

export default async function applyLaunchSaleMerchandising({
  container,
}: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "metadata", "variants.id", "variants.metadata"],
    pagination: { skip: 0, take: 10000 },
  });

  const sourced = products.filter(
    (product: any) => product.metadata?.source_system === "SHEIN",
  );
  const saleUpdates: any[] = [];
  const variantUpdates: any[] = [];

  for (const product of sourced) {
    const metadata = product.metadata || {};
    const sourceId = String(
      metadata.source_goods_id || metadata.source_sku || product.id,
    );
    const retailPrice = Number(metadata.suggested_retail_price_eur || 0);
    const bucket = hash(sourceId);
    const isSale = bucket % 100 < targetShare * 100 && retailPrice > 0;

    if (!isSale) {
      continue;
    }

    const discountPercent = salePercents[bucket % salePercents.length];
    const compareAt = compareAtPrice(retailPrice, discountPercent);
    const saleMetadata = {
      launch_sale: true,
      launch_sale_label: "Launchdeal",
      launch_sale_discount_percent: discountPercent,
      compare_at_price_eur: compareAt,
      badge: "Launchdeal",
      merchandised_at: "2026-07-15",
    };

    saleUpdates.push({
      id: product.id,
      metadata: {
        ...metadata,
        ...saleMetadata,
      },
    });

    for (const variant of product.variants || []) {
      variantUpdates.push({
        id: variant.id,
        metadata: {
          ...(variant.metadata || {}),
          ...saleMetadata,
        },
      });
    }
  }

  logger.info(
    `${saleUpdates.length} producten krijgen een transparante launchdeal-weergave.`,
  );
  console.table(
    saleUpdates.slice(0, 20).map((product) => ({
      titel: product.metadata.source_title || product.id,
      korting: `${product.metadata.launch_sale_discount_percent}%`,
      adviesprijs: product.metadata.compare_at_price_eur,
    })),
  );

  if (process.env.DRY_RUN === "1") {
    logger.info("Dry-run voltooid; er is niets gewijzigd.");
    return;
  }

  for (const batch of chunks(saleUpdates, chunkSize)) {
    await updateProductsWorkflow(container).run({
      input: { products: batch },
    });
  }
  for (const batch of chunks(variantUpdates, chunkSize)) {
    await updateProductVariantsWorkflow(container).run({
      input: { product_variants: batch },
    });
  }

  logger.info("Launchdeal-merchandising voltooid.");
}
