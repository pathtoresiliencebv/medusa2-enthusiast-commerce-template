import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

const BATCH_SIZE = 50;

const collectionRootCategory: Record<string, string> = {
  woonkamer: "living-room-furniture",
  eetkamer: "dining-room-furniture",
  slaapkamer: "bedroom-furniture",
  thuiskantoor: "home-office-furniture",
  hal: "entryway-furniture",
  badkamer: "bathroom-furniture",
  keuken: "kitchen-furniture",
  kinderkamer: "kids-furniture",
  meubelonderdelen: "furniture-replacement-parts",
  "wonen-accessoires": "wonen-accessoires",
};

const chunks = <T>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

export default async function repairLvroCatalogStructure({
  container,
}: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve(Modules.PRODUCT) as any;

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    pagination: { skip: 0, take: 1000 },
  });
  if (!categories.some((category: any) => category.handle === "wonen-accessoires")) {
    await productService.createProductCategories({
      name: "Wonen & accessoires",
      handle: "wonen-accessoires",
      description:
        "Overige woonproducten en accessoires die nog op definitieve indeling wachten.",
      is_active: true,
      is_internal: false,
      rank: 9,
    });
  }
  const { data: allCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    pagination: { skip: 0, take: 1000 },
  });
  const categoryIdByHandle = new Map<string, string>(
    allCategories.map((category: any) => [category.handle, category.id]),
  );
  const collections = await productService.listProductCollections({}, { take: 100 });
  const collectionHandleById = new Map<string, string>(
    collections.map((collection: any) => [collection.id, collection.handle]),
  );

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "collection_id",
      "collection.handle",
      "categories.id",
      "categories.handle",
      "categories.parent_category_id",
      "categories.parent_category.handle",
      "options.id",
      "options.title",
      "options.values.id",
      "options.values.value",
      "variants.id",
      "variants.title",
      "variants.options.id",
      "variants.options.value",
    ],
    pagination: { skip: 0, take: 10000 },
  });

  const categoryUpdates: any[] = [];
  const optionProblems: string[] = [];
  const collectionProblems: string[] = [];

  for (const product of products) {
    const existingCategoryIds = new Set<string>(
      (product.categories || []).map((category: any) => category.id),
    );
    const collectionHandle = collectionHandleById.get(product.collection_id);
    const rootHandle = collectionHandle
      ? collectionRootCategory[collectionHandle]
      : undefined;
    const relevantCategories = rootHandle
      ? (product.categories || []).filter(
          (category: any) =>
            category.handle === rootHandle ||
            category.parent_category?.handle === rootHandle,
        )
      : product.categories || [];
    const categoryIds = new Set<string>(
      relevantCategories.map((category: any) => category.id),
    );
    if (rootHandle && categoryIdByHandle.has(rootHandle)) {
      categoryIds.add(categoryIdByHandle.get(rootHandle)!);
    }
    for (const category of relevantCategories) {
      if (category.parent_category_id) {
        categoryIds.add(category.parent_category_id);
      }
    }
    if (
      categoryIds.size !== existingCategoryIds.size ||
      Array.from(categoryIds).some((id) => !existingCategoryIds.has(id))
    ) {
      categoryUpdates.push({
        id: product.id,
        category_ids: Array.from(categoryIds),
      });
    }

    const options = product.options || [];
    const variants = product.variants || [];
    const option = options[0];
    if (
      options.length !== 1 ||
      option?.title !== "Uitvoering" ||
      option?.values?.length !== 1 ||
      option?.values?.[0]?.value !== "Standaard" ||
      variants.length !== 1 ||
      variants[0]?.title !== "Standaard"
    ) {
      optionProblems.push(product.id);
    }
    if (!product.collection_id) collectionProblems.push(product.id);
  }

  for (const batch of chunks(categoryUpdates, BATCH_SIZE)) {
    await updateProductsWorkflow(container).run({ input: { products: batch } });
  }

  if (optionProblems.length) {
    throw new Error(
      `${optionProblems.length} actieve producten hebben een onverwachte variantstructuur; automatische wijziging gestopt om prijzen en voorraad te beschermen.`,
    );
  }
  if (collectionProblems.length) {
    throw new Error(
      `${collectionProblems.length} actieve producten missen een collectie.`,
    );
  }

  logger.info(
    `Catalogusstructuur hersteld: ${categoryUpdates.length} producten kregen hun bovenliggende categorie; alle ${products.length} opties, varianten en collecties zijn gevalideerd.`,
  );
}
