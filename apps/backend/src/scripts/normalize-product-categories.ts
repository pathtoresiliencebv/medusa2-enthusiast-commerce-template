import { ExecArgs } from "@medusajs/framework/types";
import { updateProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

type CategoryUpdate = {
  handle: string;
  name: string;
  description: string;
  parent?: string;
  rank: number;
};

const categoryUpdates: CategoryUpdate[] = [
  {
    handle: "living-room-furniture",
    name: "Woonkamermeubels",
    description:
      "Ontdek banken, stoelen, salontafels, bijzettafels, dressoirs en opbergmeubels voor een complete woonkamer.",
    rank: 0,
  },
  {
    handle: "sofas",
    name: "Banken",
    description:
      "Bekijk banken voor de woonkamer en vergelijk formaten, uitvoeringen, materialen en actuele prijzen.",
    parent: "living-room-furniture",
    rank: 0,
  },
  {
    handle: "chairs",
    name: "Stoelen en fauteuils",
    description:
      "Vind eetkamerstoelen, fauteuils en andere zitmeubels voor comfortabel dagelijks gebruik.",
    parent: "living-room-furniture",
    rank: 1,
  },
  {
    handle: "coffee-tables",
    name: "Salontafels",
    description:
      "Vergelijk ronde, rechthoekige en compacte salontafels voor verschillende woonruimtes.",
    parent: "living-room-furniture",
    rank: 2,
  },
  {
    handle: "side-tables",
    name: "Bijzettafels",
    description:
      "Ontdek compacte bijzettafels voor naast de bank, fauteuil of het bed.",
    parent: "living-room-furniture",
    rank: 3,
  },
  {
    handle: "storage",
    name: "Kasten en opbergmeubels",
    description:
      "Bekijk kasten en opbergmeubels die woonruimte en spullen overzichtelijk bij elkaar brengen.",
    parent: "living-room-furniture",
    rank: 4,
  },
  {
    handle: "sideboards",
    name: "Dressoirs",
    description:
      "Vind dressoirs met praktische opbergruimte voor woonkamer, eetkamer of werkruimte.",
    parent: "living-room-furniture",
    rank: 5,
  },
  {
    handle: "accent-furniture",
    name: "Accentmeubels",
    description:
      "Bekijk compacte accentmeubels die extra functie en karakter aan een ruimte toevoegen.",
    parent: "living-room-furniture",
    rank: 6,
  },
  {
    handle: "dining-room-furniture",
    name: "Eetkamermeubels",
    description:
      "Ontdek tafels en andere meubels voor dagelijks eten, werken en samenzijn in de eetkamer.",
    rank: 1,
  },
  {
    handle: "tables",
    name: "Eettafels",
    description:
      "Vergelijk eettafels op vorm, formaat, materiaal en het aantal zitplaatsen.",
    parent: "dining-room-furniture",
    rank: 0,
  },
  {
    handle: "bedroom-furniture",
    name: "Slaapkamermeubels",
    description:
      "Bekijk slaapkamermeubels voor slapen, opbergen en een rustige inrichting.",
    rank: 2,
  },
  {
    handle: "home-office-furniture",
    name: "Kantoormeubels",
    description:
      "Vind bureaus, stoelen en opbergmeubels voor een praktische werkplek thuis.",
    rank: 3,
  },
  {
    handle: "entryway-furniture",
    name: "Halmeubels",
    description:
      "Ontdek halmeubels en consoletafels voor een opgeruimde en functionele entree.",
    rank: 4,
  },
  {
    handle: "console-tables",
    name: "Consoletafels",
    description:
      "Bekijk smalle consoletafels voor de hal, woonkamer of ruimte achter de bank.",
    parent: "entryway-furniture",
    rank: 0,
  },
  {
    handle: "bathroom-furniture",
    name: "Badkamermeubels",
    description:
      "Bekijk badkamermeubels en complete sets voor wastafelruimte en praktische opberging.",
    rank: 5,
  },
  {
    handle: "bathroom-furniture-sets",
    name: "Badkamermeubelsets",
    description:
      "Vergelijk complete badkamermeubelsets op afmetingen, indeling en uitvoering.",
    parent: "bathroom-furniture",
    rank: 0,
  },
  {
    handle: "kitchen-furniture",
    name: "Keukenmeubels",
    description:
      "Ontdek meubels en praktische oplossingen voor extra werk- en opbergruimte in de keuken.",
    rank: 6,
  },
  {
    handle: "kitchen-tools-gadgets",
    name: "Keukenaccessoires",
    description:
      "Bekijk praktische keukenaccessoires voor bereiden, bewaren en organiseren.",
    parent: "kitchen-furniture",
    rank: 0,
  },
  {
    handle: "kids-furniture",
    name: "Kindermeubels",
    description:
      "Bekijk kindermeubels voor slapen, spelen, leren en overzichtelijk opbergen.",
    rank: 7,
  },
  {
    handle: "furniture-replacement-parts",
    name: "Meubelonderdelen",
    description:
      "Vind onderdelen en accessoires voor montage, vervanging en praktisch meubelgebruik.",
    rank: 8,
  },
];

export default async function normalizeProductCategories({
  container,
}: ExecArgs) {
  const query = container.resolve("query");
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle", "parent_category_id"],
  });
  const byHandle = new Map(
    categories.map((category: any) => [category.handle, category]),
  );

  for (const categoryUpdate of categoryUpdates) {
    const category: any = byHandle.get(categoryUpdate.handle);

    if (!category) {
      console.warn(`Categorie niet gevonden: ${categoryUpdate.handle}`);
      continue;
    }

    const parent: any = categoryUpdate.parent
      ? byHandle.get(categoryUpdate.parent)
      : undefined;

    await updateProductCategoriesWorkflow(container).run({
      input: {
        selector: { id: category.id },
        update: {
          name: categoryUpdate.name,
          description: categoryUpdate.description,
          parent_category_id: parent?.id || null,
          is_active: true,
          rank: categoryUpdate.rank,
        },
      },
    });

    console.log(
      `${categoryUpdate.handle}: ${categoryUpdate.name}${
        parent ? ` -> ${parent.handle}` : ""
      }`,
    );
  }
}
