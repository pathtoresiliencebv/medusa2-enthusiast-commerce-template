import { conciseProductTitle } from "./concise-product-title";

const categorySeo: Record<
  string,
  { label: string; singular: string; tags: string[] }
> = {
  "coffee tables": {
    label: "Salontafels",
    singular: "salontafel",
    tags: ["salontafel", "woonkamer", "tafel"],
  },
  "living room furniture": {
    label: "Woonkamermeubels",
    singular: "woonkamermeubel",
    tags: ["woonkamermeubel", "wonen", "interieur"],
  },
  "home office furniture": {
    label: "Kantoormeubels",
    singular: "kantoormeubel",
    tags: ["kantoormeubel", "thuiswerken", "werkplek"],
  },
  "bathroom furniture": {
    label: "Badkamermeubels",
    singular: "badkamermeubel",
    tags: ["badkamermeubel", "badkamer", "opbergen"],
  },
  "accent furniture": {
    label: "Accentmeubels",
    singular: "accentmeubel",
    tags: ["accentmeubel", "interieur", "wonen"],
  },
  "dining room furniture": {
    label: "Eetkamermeubels",
    singular: "eetkamermeubel",
    tags: ["eetkamermeubel", "eetkamer", "tafelen"],
  },
  "bedroom furniture": {
    label: "Slaapkamermeubels",
    singular: "slaapkamermeubel",
    tags: ["slaapkamermeubel", "slaapkamer", "opbergen"],
  },
  "entryway furniture": {
    label: "Halmeubels",
    singular: "halmeubel",
    tags: ["halmeubel", "entree", "opbergen"],
  },
  "kids furniture": {
    label: "Kindermeubels",
    singular: "kindermeubel",
    tags: ["kindermeubel", "kinderkamer", "opbergen"],
  },
  "furniture replacement parts": {
    label: "Meubelonderdelen",
    singular: "meubelonderdeel",
    tags: ["meubelonderdeel", "montage", "reparatie"],
  },
  "kitchen furniture": {
    label: "Keukenmeubels",
    singular: "keukenmeubel",
    tags: ["keukenmeubel", "keuken", "opbergen"],
  },
  "bathroom furniture sets": {
    label: "Badkamermeubelsets",
    singular: "badkamermeubelset",
    tags: ["badkamermeubelset", "badkamer", "opbergen"],
  },
  "kitchen tools & gadgets": {
    label: "Keukenaccessoires",
    singular: "keukenaccessoire",
    tags: ["keukenaccessoire", "keukengerei", "koken"],
  },
};

const supplierTerms = /\b(?:shein|temu|aliexpress|amazon)\b/gi;

const dedupeWords = (value: string) => {
  const words = value.split(/\s+/);
  const result: string[] = [];

  for (const word of words) {
    const previous = result.at(-1);
    if (
      previous?.toLocaleLowerCase("nl-NL") === word.toLocaleLowerCase("nl-NL")
    ) {
      continue;
    }

    result.push(word);
  }

  return result.join(" ");
};

const clean = (value: string) =>
  dedupeWords(
    value
      .replace(supplierTerms, "")
      .replace(/Nachttisch|Nachtschrank/gi, "nachtkastje")
      .replace(/Beistelltisch/gi, "bijzettafel")
      .replace(/Couchtisch/gi, "salontafel")
      .replace(/doppelter|dubbelter/gi, "dubbele")
      .replace(/runder Tisch/gi, "ronde tafel")
      .replace(/natürlicher?/gi, "natuurlijk")
      .replace(/^\d+\s+/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return value
    .slice(0, maxLength + 1)
    .replace(/\s+\S*$/, "")
    .replace(/[\s,;:-]+$/, "");
};

export const slugifyCatalogText = (value: string) =>
  clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const truncateSlug = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength + 1).replace(/-?[^-]*$/, "");
};

const sentenceCase = (value: string) =>
  value.charAt(0).toLocaleUpperCase("nl-NL") + value.slice(1);

const buildSeoTitle = (title: string) => {
  const compact = title.length <= 38 ? `${title} kopen` : truncate(title, 44);

  return `${compact} | lvro.nl`;
};

const buildSeoDescription = (title: string, categoryLabel: string) => {
  const category = categoryLabel.toLowerCase();
  const suffix = ` uit onze collectie ${category}. Actuele prijs, specificaties en levertijd bij lvro.nl.`;
  const maxTitleLength = 155 - "Bestel ".length - suffix.length;
  const productTitle = truncate(
    title.toLowerCase(),
    Math.max(maxTitleLength, 24),
  );

  return `Bestel ${productTitle}${suffix}`;
};

export const buildCatalogSeo = ({
  currentTitle,
  sourceTitle,
  categoryName,
  sourceId,
  attributes = [],
}: {
  currentTitle: string;
  sourceTitle?: string;
  categoryName?: string;
  sourceId: string;
  attributes?: string[];
}) => {
  const mappedCategory = categorySeo[(categoryName || "").toLowerCase()];
  const category =
    mappedCategory ||
    ({
      label: categoryName || "Meubels",
      singular: "meubel",
      tags: ["meubel", "interieur"],
    } as const);
  const title = sentenceCase(
    clean(conciseProductTitle(sourceTitle || currentTitle)),
  );
  const titleWithCategory =
    !mappedCategory ||
    title.toLowerCase().includes(category.singular.toLowerCase())
      ? title
      : truncate(`${title} ${category.singular}`, 58);
  const handleBase = truncateSlug(slugifyCatalogText(titleWithCategory), 58);
  const handle = `${handleBase}-${slugifyCatalogText(sourceId)}`;
  const seoTitle = buildSeoTitle(titleWithCategory);
  const seoDescription = buildSeoDescription(titleWithCategory, category.label);
  const attributeTags = attributes
    .flatMap((attribute) => clean(attribute).split(/[:/,]/))
    .map((tag) => tag.toLowerCase().trim())
    .filter((tag) => tag.length >= 3 && tag.length <= 32);
  const keywords = Array.from(
    new Set([...category.tags, category.label.toLowerCase(), ...attributeTags]),
  ).slice(0, 12);

  return {
    title: titleWithCategory,
    handle,
    seoTitle,
    seoDescription,
    keywords,
    productDescription: `${titleWithCategory} uit de collectie ${category.label.toLowerCase()}. Bekijk de beschikbare uitvoering, productspecificaties, actuele prijs en verwachte levertijd.`,
  };
};
