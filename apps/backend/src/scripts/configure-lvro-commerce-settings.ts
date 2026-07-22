import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  deleteSalesChannelsWorkflow,
  deleteShippingOptionsWorkflow,
  deleteStoresWorkflow,
  updateProductsWorkflow,
  updateRegionsWorkflow,
  updateShippingOptionsWorkflow,
  updateStockLocationsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const OWNER_EMAIL = process.env.SOURCING_OWNER_EMAILS?.split(",")[0]?.trim() || "owner@example.com";
const BATCH_SIZE = 50;

const typePriority = [
  "sofas",
  "chairs",
  "coffee-tables",
  "side-tables",
  "storage",
  "sideboards",
  "accent-furniture",
  "tables",
  "console-tables",
  "bathroom-furniture-sets",
  "kitchen-tools-gadgets",
  "furniture-replacement-parts",
  "living-room-furniture",
  "dining-room-furniture",
  "bedroom-furniture",
  "home-office-furniture",
  "entryway-furniture",
  "bathroom-furniture",
  "kitchen-furniture",
  "kids-furniture",
];

const roomTags: Record<string, string> = {
  "living-room-furniture": "Ruimte: Woonkamer",
  sofas: "Ruimte: Woonkamer",
  chairs: "Ruimte: Woonkamer",
  "coffee-tables": "Ruimte: Woonkamer",
  "side-tables": "Ruimte: Woonkamer",
  storage: "Ruimte: Woonkamer",
  sideboards: "Ruimte: Woonkamer",
  "accent-furniture": "Ruimte: Woonkamer",
  "dining-room-furniture": "Ruimte: Eetkamer",
  tables: "Ruimte: Eetkamer",
  "bedroom-furniture": "Ruimte: Slaapkamer",
  "home-office-furniture": "Ruimte: Thuiskantoor",
  "entryway-furniture": "Ruimte: Hal",
  "console-tables": "Ruimte: Hal",
  "bathroom-furniture": "Ruimte: Badkamer",
  "bathroom-furniture-sets": "Ruimte: Badkamer",
  "kitchen-furniture": "Ruimte: Keuken",
  "kitchen-tools-gadgets": "Ruimte: Keuken",
  "kids-furniture": "Ruimte: Kinderkamer",
};

const attributeTags: Array<[string, string[]]> = [
  ["Materiaal: Hout", ["hout", "wood", "houten"]],
  ["Materiaal: MDF", ["mdf"]],
  ["Materiaal: Metaal", ["metaal", "metal", "stalen", "staal"]],
  ["Materiaal: Glas", ["glas", "glass"]],
  ["Materiaal: Bamboe", ["bamboe", "bamboo"]],
  ["Materiaal: Rotan", ["rotan", "rattan"]],
  ["Materiaal: Kunststof", ["kunststof", "plastic", "abs"]],
  ["Materiaal: Siliconen", ["siliconen", "silicone"]],
  ["Kleur: Zwart", ["zwart", "black"]],
  ["Kleur: Wit", ["wit", "white"]],
  ["Kleur: Grijs", ["grijs", "grey", "gray"]],
  ["Kleur: Bruin", ["bruin", "brown"]],
  ["Kleur: Beige", ["beige"]],
  ["Kleur: Groen", ["groen", "green"]],
  ["Kleur: Blauw", ["blauw", "blue"]],
  ["Kleur: Goud", ["goud", "gold"]],
  ["Kleur: Zilver", ["zilver", "silver"]],
];

const returnReasons = [
  ["verkeerd_besteld", "Verkeerd artikel besteld", "De klant heeft per ongeluk het verkeerde artikel besteld."],
  ["past_niet", "Past of voldoet niet", "Het formaat, de maat of het gebruik past niet bij de verwachting."],
  ["beschadigd", "Beschadigd aangekomen", "Het artikel of de verpakking is tijdens de levering beschadigd."],
  ["defect", "Defect of werkt niet", "Het artikel functioneert niet zoals bedoeld."],
  ["verkeerd_ontvangen", "Verkeerd artikel ontvangen", "De klant heeft een ander artikel ontvangen dan besteld."],
  ["onderdelen_ontbreken", "Onderdelen ontbreken", "Een of meer onderdelen of accessoires ontbreken."],
  ["wijkt_af", "Wijkt af van de beschrijving", "Het artikel wijkt aantoonbaar af van de productinformatie."],
  ["anders", "Andere reden", "Gebruik de interne notitie voor aanvullende informatie."],
] as const;

const chunks = <T>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

export default async function configureLvroCommerceSettings({
  container,
}: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve(Modules.PRODUCT) as any;
  const orderService = container.resolve(Modules.ORDER) as any;
  const fulfillmentService = container.resolve(Modules.FULFILLMENT) as any;
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL) as any;

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "description",
      "categories.id",
      "categories.name",
      "categories.handle",
      "sales_channels.id",
    ],
    pagination: { skip: 0, take: 10000 },
  });

  const categoryNames = new Set<string>();
  const assignments = products.map((product: any) => {
    const categories = product.categories || [];
    const selected = [...categories].sort(
      (a: any, b: any) =>
        (typePriority.indexOf(a.handle) < 0 ? 999 : typePriority.indexOf(a.handle)) -
        (typePriority.indexOf(b.handle) < 0 ? 999 : typePriority.indexOf(b.handle)),
    )[0];
    const typeValue = selected?.name || "Wonen";
    categoryNames.add(typeValue);

    const tagValues = new Set<string>(["LVRO"]);
    for (const category of categories) {
      tagValues.add(`Categorie: ${category.name}`);
      if (roomTags[category.handle]) tagValues.add(roomTags[category.handle]);
    }
    const searchable = `${product.title || ""} ${product.description || ""}`.toLocaleLowerCase("nl-NL");
    for (const [tag, needles] of attributeTags) {
      if (needles.some((needle) => searchable.includes(needle))) tagValues.add(tag);
    }

    return { product, typeValue, tagValues: Array.from(tagValues).slice(0, 10) };
  });

  const existingTypes = await productService.listProductTypes({}, { take: 1000 });
  const existingTypeValues = new Set(existingTypes.map((item: any) => item.value));
  const missingTypes = Array.from(categoryNames)
    .filter((value) => !existingTypeValues.has(value))
    .map((value) => ({ value }));
  if (missingTypes.length) await productService.createProductTypes(missingTypes);
  const allTypes = await productService.listProductTypes({}, { take: 1000 });
  const typeByValue = new Map<string, string>(
    allTypes.map((item: any) => [item.value, item.id]),
  );

  const desiredTagValues = Array.from(
    new Set(assignments.flatMap((item) => item.tagValues)),
  );
  const existingTags = await productService.listProductTags({}, { take: 1000 });
  const existingTagValues = new Set(existingTags.map((item: any) => item.value));
  const missingTags = desiredTagValues
    .filter((value) => !existingTagValues.has(value))
    .map((value) => ({ value }));
  if (missingTags.length) await productService.createProductTags(missingTags);
  const allTags = await productService.listProductTags({}, { take: 1000 });
  const tagByValue = new Map<string, string>(
    allTags.map((item: any) => [item.value, item.id]),
  );

  const productUpdates: any[] = assignments.map(
    ({ product, typeValue, tagValues }) => ({
      id: product.id,
      type_id: typeByValue.get(typeValue),
      tag_ids: tagValues
        .map((value) => tagByValue.get(value))
        .filter(Boolean),
    }),
  );
  for (const batch of chunks(productUpdates, BATCH_SIZE)) {
    await updateProductsWorkflow(container).run({ input: { products: batch } });
  }

  const existingReasons = await orderService.listReturnReasons({}, { take: 100 });
  const existingReasonValues = new Set(existingReasons.map((item: any) => item.value));
  const missingReasons = returnReasons
    .filter(([value]) => !existingReasonValues.has(value))
    .map(([value, label, description]) => ({ value, label, description }));
  if (missingReasons.length) await orderService.createReturnReasons(missingReasons);

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "address.*"],
    pagination: { skip: 0, take: 100 },
  });
  const primaryLocation = locations[0];
  if (!primaryLocation) throw new Error("Geen voorraadlocatie gevonden.");
  await updateStockLocationsWorkflow(container).run({
    input: {
      selector: { id: primaryLocation.id },
      update: {
        name: "LVRO EU fulfilment",
        metadata: {
          operational_model: "partner_fulfilment",
          markets: ["NL", "BE"],
          owner: OWNER_EMAIL,
        },
      },
    },
  });

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
    pagination: { skip: 0, take: 100 },
  });
  const primaryRegion = regions[0];
  if (!primaryRegion) throw new Error("Geen verkoopregio gevonden.");
  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: primaryRegion.id },
      update: {
        name: "Nederland & België",
        currency_code: "eur",
        countries: ["nl", "be"],
        automatic_taxes: true,
        metadata: { markets: ["NL", "BE"], owner: OWNER_EMAIL },
      },
    },
  });

  const { data: serviceZones } = await query.graph({
    entity: "service_zone",
    fields: ["id", "name", "geo_zones.*"],
    pagination: { skip: 0, take: 100 },
  });
  const primaryZone = serviceZones[0];
  if (!primaryZone) throw new Error("Geen verzendzone gevonden.");
  await fulfillmentService.updateServiceZones(primaryZone.id, {
    name: "Nederland & België",
    metadata: { delivery_days: "3-5", owner: OWNER_EMAIL },
  });
  const obsoleteGeoZoneIds = (primaryZone.geo_zones || [])
    .filter((zone: any) => !["nl", "be"].includes(zone.country_code))
    .map((zone: any) => zone.id);
  if (obsoleteGeoZoneIds.length) {
    await fulfillmentService.deleteGeoZones(obsoleteGeoZoneIds);
  }

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "price_type", "metadata"],
    pagination: { skip: 0, take: 100 },
  });
  const standardOption = shippingOptions.find((option: any) =>
    option.name.toLowerCase().includes("standard"),
  ) || shippingOptions[0];
  if (!standardOption) throw new Error("Geen verzendmethode gevonden.");
  await updateShippingOptionsWorkflow(container).run({
    input: [
      {
        id: standardOption.id,
        name: "Standaardlevering (3-5 werkdagen)",
        price_type: "flat",
        prices: [
          { currency_code: "eur", amount: 10 },
          { region_id: primaryRegion.id, amount: 10 },
        ],
      },
    ],
  });
  const misleadingOptions = shippingOptions
    .filter((option: any) => option.id !== standardOption.id)
    .filter((option: any) => option.name.toLowerCase().includes("express"))
    .map((option: any) => option.id);
  if (misleadingOptions.length) {
    await deleteShippingOptionsWorkflow(container).run({
      input: { ids: misleadingOptions },
    });
  }

  const channelCounts = new Map<string, number>();
  for (const product of products) {
    for (const channel of product.sales_channels || []) {
      channelCounts.set(channel.id, (channelCounts.get(channel.id) || 0) + 1);
    }
  }
  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name", "description", "is_disabled"],
    pagination: { skip: 0, take: 100 },
  });
  const primaryChannel = [...channels].sort(
    (a: any, b: any) =>
      (channelCounts.get(b.id) || 0) - (channelCounts.get(a.id) || 0),
  )[0];
  if (!primaryChannel) throw new Error("Geen verkoopkanaal gevonden.");
  await salesChannelService.updateSalesChannels(primaryChannel.id, {
    name: "LVRO.nl Webshop",
    description: "Primair verkoopkanaal voor Nederland en België",
    is_disabled: false,
    metadata: { markets: ["NL", "BE"], owner: OWNER_EMAIL },
  });

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name", "default_sales_channel_id"],
    pagination: { skip: 0, take: 100 },
  });
  const primaryStore =
    stores.find((store: any) => store.default_sales_channel_id === primaryChannel.id) ||
    stores[0];
  if (!primaryStore) throw new Error("Geen store gevonden.");
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: primaryStore.id },
      update: {
        name: "LVRO.nl",
        supported_currencies: [{ currency_code: "eur", is_default: true }],
        supported_locales: [{ locale_code: "nl-NL" }],
        default_sales_channel_id: primaryChannel.id,
        default_region_id: primaryRegion.id,
        default_location_id: primaryLocation.id,
        metadata: {
          markets: ["NL", "BE"],
          returns_days: 30,
          refund_method: "original_payment_method",
          refund_processing_days: 5,
          owner: OWNER_EMAIL,
        },
      },
    },
  });

  const duplicateStoreIds = stores
    .filter((store: any) => store.id !== primaryStore.id)
    .map((store: any) => store.id);
  if (duplicateStoreIds.length) {
    await deleteStoresWorkflow(container).run({ input: { ids: duplicateStoreIds } });
  }
  const emptyChannelIds = channels
    .filter((channel: any) => channel.id !== primaryChannel.id)
    .filter((channel: any) => (channelCounts.get(channel.id) || 0) === 0)
    .map((channel: any) => channel.id);
  if (emptyChannelIds.length) {
    await deleteSalesChannelsWorkflow(container).run({
      input: { ids: emptyChannelIds },
    });
  }

  logger.info(
    `LVRO-instellingen ingericht: ${productUpdates.length} producten, ${allTypes.length} producttypes, ${allTags.length} tags, ${missingReasons.length} nieuwe retourredenen, 1 actieve winkel en 1 standaard verzendmethode.`,
  );
}
