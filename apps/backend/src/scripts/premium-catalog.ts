import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";

type CatalogEntry = {
  title: string;
  description: string;
  badge: string;
  material: string;
  dimensions: string;
  prices: number[];
};

const catalog: Record<string, CatalogEntry> = {
  "boucle-lounge-chair": {
    title: "Nordhavn bouclé fauteuil",
    description:
      "Een sculpturale fauteuil met zachte bouclé, ronde armleuningen en een diepe zit. Ontworpen als comfortabel accent voor rustige woonkamers.",
    badge: "Atelier favoriet",
    material: "Bouclé, massief hout en vormvast schuim",
    dimensions: "B 84 x D 86 x H 78 cm",
    prices: [749, 779, 769, 739],
  },
  "modular-linen-sofa": {
    title: "Fjord modulaire linnen bank",
    description:
      "Een lage modulaire bank met royale zitdiepte, linnen bekleding en losse elementen. Samengesteld voor ontspannen wonen en eenvoudig aan te passen aan je ruimte.",
    badge: "Bestseller",
    material: "Linnenmix, FSC-hout en koudschuim",
    dimensions: "B 248 x D 104 x H 76 cm",
    prices: [2199, 2249, 2299, 2349, 2299, 2349, 2399, 2449],
  },
  "oak-dining-table": {
    title: "Skagen eiken eettafel",
    description:
      "Een royale eettafel met rustige lijnen en een warm houten blad. Stevig genoeg voor dagelijks gebruik en verfijnd genoeg voor lange diners.",
    badge: "Nieuw",
    material: "Massief eiken en eikenfineer",
    dimensions: "L 220 x B 95 x H 75 cm",
    prices: [1299, 1399, 1349, 1249],
  },
  "rattan-storage-cabinet": {
    title: "Ribe rotan opbergkast",
    description:
      "Een luchtige opbergkast met geweven rotan fronten en royale bergruimte. Natuurlijke textuur aan de buitenkant, overzicht aan de binnenkant.",
    badge: "Atelier selectie",
    material: "Eikenfineer, rotan en gepoedercoat staal",
    dimensions: "B 110 x D 42 x H 145 cm",
    prices: [999, 1099, 1049, 949],
  },
};

const translateVariant = (title: string) =>
  title
    .replace("Natural oak", "Naturel eiken")
    .replace("Walnut", "Walnoot")
    .replace("Black ash", "Zwart essen")
    .replace("Cream lacquer", "Crème lak")
    .replace("Charcoal bouclé", "Antraciet bouclé")
    .replace("Ivory linen", "Ivoor linnen");

const translateOption = (title: string) =>
  title.replace("Finish", "Afwerking").replace("Upholstery", "Bekleding");

export default async function updatePremiumCatalog({
  container,
}: {
  container: MedusaContainer;
}) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve(Modules.PRODUCT);
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "variants.id",
      "variants.title",
      "options.id",
      "options.title",
      "options.values.id",
      "options.values.value",
    ],
  });

  for (const product of products) {
    const entry = catalog[product.handle];

    if (!entry) {
      continue;
    }

    await updateProductsWorkflow(container).run({
      input: {
        products: [
          {
            id: product.id,
            title: entry.title,
            description: entry.description,
            metadata: {
              badge: entry.badge,
              material: entry.material,
              dimensions: entry.dimensions,
            },
          },
        ],
      },
    });

    await updateProductVariantsWorkflow(container).run({
      input: {
        product_variants: product.variants.map(
          (variant: { id: string; title: string }, index: number) => ({
            id: variant.id,
            title: translateVariant(variant.title),
            manage_inventory: true,
            allow_backorder: true,
            prices: [
              {
                amount: entry.prices[index] ?? entry.prices[0],
                currency_code: "eur",
              },
            ],
          }),
        ),
      },
    });

    for (const option of product.options) {
      await productService.updateProductOptions(option.id, {
        title: translateOption(option.title),
      });

      for (const value of option.values) {
        await productService.updateProductOptionValues(value.id, {
          value: translateVariant(value.value),
        });
      }
    }

    logger.info(`Updated premium catalog product: ${entry.title}`);
  }
}
