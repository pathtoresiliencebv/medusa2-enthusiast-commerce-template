import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createTaxRegionsWorkflow,
  updateRegionsWorkflow,
} from "@medusajs/medusa/core-flows";

import { CONVERSION_MODULE } from "../modules/conversion";

const swatchMap: Record<string, string> = {
  "Crème lak": "#e9e2d6",
  "Naturel eiken": "#c9a979",
  Walnoot: "#70513a",
  "Zwart essen": "#242424",
  "Antraciet bouclé": "#4b4b48",
  "Ivoor linnen": "#e7e0d3",
};

const quantityTiers = [
  { quantity: 1, discount_percentage: 0, label: "1 stuk" },
  { quantity: 2, discount_percentage: 5, label: "2 stuks - 5% voordeel" },
  { quantity: 4, discount_percentage: 10, label: "4 stuks - 10% voordeel" },
];

export default async function setupConversion({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const conversion = container.resolve(CONVERSION_MODULE) as any;

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "countries.iso_2", "payment_providers.id"],
  });
  const region = regions?.[0];
  if (region) {
    const countries = ["nl", "be"];
    const paymentProviders =
      process.env.STRIPE_API_KEY && process.env.STRIPE_WEBHOOK_SECRET
        ? [
            "pp_stripe_stripe",
            "pp_stripe-ideal_stripe",
            "pp_stripe-bancontact_stripe",
          ]
        : ["pp_system_default"];

    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          name: "Nederland en België",
          countries,
          payment_providers: paymentProviders,
        },
      } as any,
    });
  }

  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  });
  const existingCountries = new Set(
    taxRegions.map((taxRegion: any) => taxRegion.country_code)
  );
  const missingTaxRegions = ["nl", "be"].filter(
    (countryCode) => !existingCountries.has(countryCode)
  );
  if (missingTaxRegions.length) {
    await createTaxRegionsWorkflow(container).run({
      input: missingTaxRegions.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "options.values.value", "variants.id"],
  });
  const productIds = products.map((product: any) => product.id);

  for (const product of products) {
    const values = product.options.flatMap(
      (option: any) => option.values || []
    );
    const swatches = Object.fromEntries(
      values
        .filter((value: any) => swatchMap[value.value])
        .map((value: any) => [value.value, swatchMap[value.value]])
    );
    const recommendations = productIds
      .filter((id: string) => id !== product.id)
      .slice(0, 3);
    const payload = {
      product_id: product.id,
      swatches,
      quantity_tiers: quantityTiers,
      delivery_label:
        product.handle === "modular-linen-sofa"
          ? "Made-to-order: levering binnen 6-8 weken"
          : "Op voorraad: levering binnen 3-5 werkdagen",
      financing_label: "Of betaal in termijnen via je betaalprovider",
      trust_badges: [
        "Verzendkosten vooraf zichtbaar",
        "30 dagen retour",
        "5 jaar garantie op geselecteerde meubels",
      ],
      recommendation_ids: recommendations,
      downsell_product_id: recommendations.at(-1) || null,
    };
    const [existing] = await conversion.listProductMerchandisings({
      product_id: product.id,
    });
    if (existing) {
      await conversion.updateProductMerchandisings({
        id: existing.id,
        ...payload,
      });
    } else {
      await conversion.createProductMerchandisings(payload);
    }
  }

  const sofa = products.find(
    (product: any) => product.handle === "modular-linen-sofa"
  );
  const chair = products.find(
    (product: any) => product.handle === "boucle-lounge-chair"
  );
  if (sofa?.variants?.[0] && chair?.variants?.[0]) {
    const bundlePayload = {
      handle: "fjord-living-set",
      title: "Fjord living set",
      description:
        "De Fjord bank met de Nordhavn fauteuil als complete zithoek.",
      hero_product_id: sofa.id,
      items: [
        { variant_id: sofa.variants[0].id, quantity: 1 },
        { variant_id: chair.variants[0].id, quantity: 1 },
      ],
      discount_percentage: 7,
      active: true,
    };
    const [existingBundle] = await conversion.listBundles({
      handle: bundlePayload.handle,
    });
    if (existingBundle) {
      await conversion.updateBundles({
        id: existingBundle.id,
        ...bundlePayload,
      });
    } else {
      await conversion.createBundles(bundlePayload);
    }
  }

  logger.info("Conversion data, NL/BE markets and merchandising configured");
}
