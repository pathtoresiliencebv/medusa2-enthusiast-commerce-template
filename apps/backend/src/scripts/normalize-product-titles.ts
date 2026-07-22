import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

import { conciseProductTitle } from "../utils/concise-product-title";

const chunkSize = 50;

const chunks = <T>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

export default async function normalizeProductTitles({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "metadata"],
    pagination: { skip: 0, take: 10000 },
  });
  const updates = products
    .filter((product: any) => product.metadata?.source_system === "SHEIN")
    .map((product: any) => ({
      id: product.id,
      title: conciseProductTitle(product.title),
      metadata: {
        ...product.metadata,
        catalog_title_normalized_at: "2026-07-15",
      },
      previousTitle: product.title,
    }))
    .filter((product: any) => product.title !== product.previousTitle);

  logger.info(
    `${updates.length} van ${products.length} producttitels worden ingekort.`,
  );
  console.table(
    updates
      .sort((a: any, b: any) => b.previousTitle.length - a.previousTitle.length)
      .slice(0, 25)
      .map(({ previousTitle, title }: any) => ({
        oud: previousTitle.slice(0, 90),
        nieuw: title,
      })),
  );

  if (process.env.DRY_RUN === "1") {
    logger.info("Dry-run voltooid; er is niets gewijzigd.");
    return;
  }

  for (const batch of chunks(updates, chunkSize)) {
    await updateProductsWorkflow(container).run({
      input: {
        products: batch.map(
          ({ previousTitle: _previousTitle, ...update }) => update,
        ),
      },
    });
  }

  logger.info(`${updates.length} producttitels bijgewerkt.`);
}
