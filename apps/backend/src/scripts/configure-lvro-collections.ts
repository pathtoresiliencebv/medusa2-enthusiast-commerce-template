import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

const BATCH_SIZE = 50;

const collectionDefinitions = [
  {
    title: "Woonkamer",
    handle: "woonkamer",
    categories: [
      "sofas",
      "chairs",
      "coffee-tables",
      "side-tables",
      "storage",
      "sideboards",
      "accent-furniture",
      "living-room-furniture",
    ],
  },
  {
    title: "Eetkamer",
    handle: "eetkamer",
    categories: ["tables", "dining-room-furniture"],
  },
  {
    title: "Slaapkamer",
    handle: "slaapkamer",
    categories: ["bedroom-furniture"],
  },
  {
    title: "Thuiskantoor",
    handle: "thuiskantoor",
    categories: ["home-office-furniture"],
  },
  {
    title: "Hal",
    handle: "hal",
    categories: ["console-tables", "entryway-furniture"],
  },
  {
    title: "Badkamer",
    handle: "badkamer",
    categories: ["bathroom-furniture-sets", "bathroom-furniture"],
  },
  {
    title: "Keuken",
    handle: "keuken",
    categories: ["kitchen-tools-gadgets", "kitchen-furniture"],
  },
  {
    title: "Kinderkamer",
    handle: "kinderkamer",
    categories: ["kids-furniture"],
  },
  {
    title: "Meubelonderdelen",
    handle: "meubelonderdelen",
    categories: ["furniture-replacement-parts"],
  },
  {
    title: "Wonen & accessoires",
    handle: "wonen-accessoires",
    categories: [],
  },
] as const;

const chunks = <T>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

export default async function configureLvroCollections({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve(Modules.PRODUCT) as any;

  const existing = await productService.listProductCollections({}, { take: 100 });
  const byHandle = new Map(existing.map((item: any) => [item.handle, item]));

  for (const definition of collectionDefinitions) {
    const current = byHandle.get(definition.handle) as any;
    const payload = {
      title: definition.title,
      handle: definition.handle,
      metadata: {
        market: "NL-BE",
        merchandising: "ruimte",
      },
    };
    const saved = current
      ? await productService.updateProductCollections(current.id, payload)
      : await productService.createProductCollections(payload);
    byHandle.set(definition.handle, saved);
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "categories.handle"],
    pagination: { skip: 0, take: 10000 },
  });

  const updates: any[] = products.map((product: any) => {
    const handles = new Set(
      (product.categories || []).map((category: any) => category.handle),
    );
    const definition =
      collectionDefinitions.find((candidate) =>
        candidate.categories.some((handle) => handles.has(handle)),
      ) || collectionDefinitions[collectionDefinitions.length - 1];
    const collection = byHandle.get(definition.handle) as any;
    return { id: product.id, collection_id: collection.id };
  });

  for (const batch of chunks(updates, BATCH_SIZE)) {
    await updateProductsWorkflow(container).run({ input: { products: batch } });
  }

  logger.info(
    `${collectionDefinitions.length} LVRO-collecties ingericht en ${updates.length} producten gekoppeld.`,
  );
}
