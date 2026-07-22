import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";

const BATCH_SIZE = 50;
const LOCATION_NAME = "LVRO EU fulfilment";

const chunks = <T>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

export default async function configureLvroInventory({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK) as any;

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
    filters: { name: LOCATION_NAME },
    pagination: { skip: 0, take: 10 },
  });
  if (locations.length !== 1) {
    throw new Error(
      `Verwacht exact een voorraadlocatie '${LOCATION_NAME}', gevonden: ${locations.length}.`,
    );
  }
  const locationId = locations[0].id;

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "sku",
      "title",
      "manage_inventory",
      "allow_backorder",
      "product.id",
      "product.title",
      "product.status",
    ],
    filters: { product: { status: ["published", "draft", "proposed", "rejected"] } },
    pagination: { skip: 0, take: 10000 },
  });

  const activeVariants: any[] = variants.filter(
    (variant: any) => variant.product?.id,
  );
  const duplicateSkus = activeVariants
    .map((variant: any) => variant.sku)
    .filter((sku: string, index: number, all: string[]) => !sku || all.indexOf(sku) !== index);
  if (duplicateSkus.length) {
    throw new Error(
      `Inventory-inrichting gestopt: ${duplicateSkus.length} ontbrekende of dubbele SKU's.`,
    );
  }

  const { data: links } = await query.graph({
    entity: "product_variant_inventory_item",
    fields: ["variant_id", "inventory_item_id"],
    pagination: { skip: 0, take: 10000 },
  });
  const itemIdByVariantId = new Map<string, string>(
    links.map(
      (link: any) => [link.variant_id, link.inventory_item_id] as [string, string],
    ),
  );

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku", "metadata"],
    pagination: { skip: 0, take: 10000 },
  });
  const orphanItemByVariantId = new Map<string, string>();
  for (const item of inventoryItems) {
    const variantId = item.metadata?.lvro_variant_id;
    if (typeof variantId === "string" && !itemIdByVariantId.has(variantId)) {
      orphanItemByVariantId.set(variantId, item.id);
    }
  }

  let createdItems = 0;
  let createdLinks = 0;
  const variantsWithoutLink = activeVariants.filter(
    (variant: any) => !itemIdByVariantId.has(variant.id),
  );

  for (const batch of chunks(variantsWithoutLink, BATCH_SIZE)) {
    const variantsNeedingItem = batch.filter(
      (variant: any) => !orphanItemByVariantId.has(variant.id),
    );
    if (variantsNeedingItem.length) {
      const { result: created } = await createInventoryItemsWorkflow(container).run({
        input: {
          items: variantsNeedingItem.map((variant: any) => ({
            sku: variant.sku,
            title: `${variant.product.title} - ${variant.title}`,
            description: "LVRO voorraadartikel; beginvoorraad onbekend en daarom op 0 gezet.",
            requires_shipping: true,
            metadata: {
              lvro_variant_id: variant.id,
              stock_source: "unknown",
              stock_verified: false,
            },
            location_levels: [
              {
                location_id: locationId,
                stocked_quantity: 0,
              },
            ],
          })),
        },
      });
      variantsNeedingItem.forEach((variant: any, index: number) => {
        itemIdByVariantId.set(variant.id, created[index].id);
      });
      createdItems += created.length;
    }

    for (const variant of batch) {
      if (!itemIdByVariantId.has(variant.id)) {
        const orphanItemId = orphanItemByVariantId.get(variant.id);
        if (orphanItemId) itemIdByVariantId.set(variant.id, orphanItemId);
      }
    }

    const linkDefinitions = batch.map((variant: any) => ({
      [Modules.PRODUCT]: { variant_id: variant.id },
      [Modules.INVENTORY]: {
        inventory_item_id: itemIdByVariantId.get(variant.id),
      },
    }));
    await remoteLink.create(linkDefinitions);
    createdLinks += linkDefinitions.length;
  }

  const { data: levels } = await query.graph({
    entity: "inventory_level",
    fields: ["inventory_item_id", "location_id"],
    filters: { location_id: locationId },
    pagination: { skip: 0, take: 10000 },
  });
  const itemsWithLevel = new Set<string>(
    levels.map((level: any) => level.inventory_item_id as string),
  );
  const missingLevels: string[] = activeVariants
    .map((variant: any) => itemIdByVariantId.get(variant.id))
    .filter((id: string | undefined): id is string => !!id && !itemsWithLevel.has(id));
  for (const batch of chunks(missingLevels, BATCH_SIZE)) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: batch.map((inventoryItemId) => ({
          inventory_item_id: inventoryItemId,
          location_id: locationId,
          stocked_quantity: 0,
        })),
      },
    });
  }

  const variantsToManage = activeVariants.filter(
    (variant: any) => !variant.manage_inventory || !variant.allow_backorder,
  );
  for (const batch of chunks(variantsToManage, BATCH_SIZE)) {
    await updateProductVariantsWorkflow(container).run({
      input: {
        product_variants: batch.map((variant: any) => ({
          id: variant.id,
          manage_inventory: true,
          allow_backorder: true,
        })),
      },
    });
  }

  logger.info(
    `Inventory gereed: ${activeVariants.length} varianten beheerd, ${createdItems} items en ${createdLinks} koppelingen aangemaakt, ${missingLevels.length} ontbrekende niveaus op 0 gezet.`,
  );
}
