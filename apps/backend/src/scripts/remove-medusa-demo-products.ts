import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows";

const demoHandles = new Set(["t-shirt", "sweatshirt", "sweatpants", "shorts"]);

export default async function removeMedusaDemoProducts({
  container,
}: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "metadata"],
    pagination: { skip: 0, take: 10000 },
  });

  const demoProducts = products.filter(
    (product: any) =>
      demoHandles.has(product.handle) &&
      product.metadata?.source_system !== "SHEIN",
  );

  if (!demoProducts.length) {
    logger.info("Geen Medusa-demoartikelen gevonden.");
    return;
  }

  await deleteProductsWorkflow(container).run({
    input: { ids: demoProducts.map((product: any) => product.id) },
  });

  logger.info(
    `${demoProducts.length} Medusa-demoartikelen verwijderd: ${demoProducts
      .map((product: any) => product.title)
      .join(", ")}`,
  );
}
