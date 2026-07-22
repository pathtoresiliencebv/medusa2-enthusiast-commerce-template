import { HttpTypes } from "@medusajs/types"

import { getBaseURL } from "@lib/util/env"
import { getProductPrice } from "@lib/util/get-product-price"
import { brand } from "@lib/brand"
import type { Metadata } from "next"

export const siteSeo = {
  name: brand.name,
  title: "Design meubels online kopen | lvro.nl",
  description:
    "Koop moderne meubels voor woonkamer, eetkamer en slaapkamer. Ontdek banken, tafels, stoelen en kasten met heldere prijzen en thuisbezorging.",
  locale: "nl_NL",
}

export const indexableCountryCodes = ["nl", "be"] as const

export function isIndexableCountryCode(countryCode: string) {
  return indexableCountryCodes.includes(
    countryCode.toLowerCase() as (typeof indexableCountryCodes)[number]
  )
}

export function localizedAlternates(countryCode: string, path = "") {
  const normalizedPath = path
    ? path.startsWith("/") || path.startsWith("?")
      ? path
      : `/${path}`
    : ""
  const canonicalCountryCode = isIndexableCountryCode(countryCode)
    ? countryCode.toLowerCase()
    : "nl"

  return {
    canonical: absoluteUrl(`/${canonicalCountryCode}${normalizedPath}`),
    languages: {
      "nl-NL": absoluteUrl(`/nl${normalizedPath}`),
      "nl-BE": absoluteUrl(`/be${normalizedPath}`),
      "x-default": absoluteUrl(`/nl${normalizedPath}`),
    },
  }
}

export function listingSeoState(
  countryCode: string,
  path: string,
  searchParams: Record<string, string | string[] | undefined>
) {
  const rawPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page
  const page = Math.max(1, Number.parseInt(rawPage || "1", 10) || 1)
  const hasDuplicateParameters = Object.entries(searchParams).some(
    ([key, value]) => key !== "page" && value !== undefined
  )
  const canonicalPath = `${path}${page > 1 ? `?page=${page}` : ""}`

  return {
    page,
    alternates: localizedAlternates(countryCode, canonicalPath),
    robots: {
      index: isIndexableCountryCode(countryCode) && !hasDuplicateParameters,
      follow: true,
    } satisfies Metadata["robots"],
  }
}

export function countryRobots(countryCode: string): Metadata["robots"] {
  const index = isIndexableCountryCode(countryCode)

  return {
    index,
    follow: true,
    googleBot: {
      index,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  }
}

export function localizedPageMetadata({
  countryCode,
  path,
  title,
  description,
}: {
  countryCode: string
  path: string
  title: string
  description: string
}): Metadata {
  const alternates = localizedAlternates(countryCode, path)

  return {
    title,
    description,
    alternates,
    openGraph: {
      title: `${title} | ${siteSeo.name}`,
      description,
      url: alternates.canonical,
      siteName: siteSeo.name,
      locale: siteSeo.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteSeo.name}`,
      description,
    },
  }
}

const categorySeoMap: Record<
  string,
  { singular: string; plural: string; qualifier: string }
> = {
  chairs: {
    singular: "fauteuil",
    plural: "Fauteuils en stoelen",
    qualifier: "comfortabel en modern",
  },
  sofas: {
    singular: "bank",
    plural: "Banken",
    qualifier: "modulair en comfortabel",
  },
  tables: {
    singular: "eettafel",
    plural: "Eettafels",
    qualifier: "voor dagelijks tafelen",
  },
  storage: {
    singular: "opbergmeubel",
    plural: "Kasten en opbergmeubels",
    qualifier: "stijlvol en praktisch",
  },
  "coffee tables": {
    singular: "salontafel",
    plural: "Salontafels",
    qualifier: "modern en praktisch",
  },
  "coffee-tables": {
    singular: "salontafel",
    plural: "Salontafels",
    qualifier: "modern en praktisch",
  },
  "living room furniture": {
    singular: "woonkamermeubel",
    plural: "Woonkamermeubels",
    qualifier: "voor ieder interieur",
  },
  "living-room-furniture": {
    singular: "woonkamermeubel",
    plural: "Woonkamermeubels",
    qualifier: "voor ieder interieur",
  },
  "home office furniture": {
    singular: "kantoormeubel",
    plural: "Kantoormeubels",
    qualifier: "voor een fijne werkplek",
  },
  "home-office-furniture": {
    singular: "kantoormeubel",
    plural: "Kantoormeubels",
    qualifier: "voor een fijne werkplek",
  },
  "bathroom furniture": {
    singular: "badkamermeubel",
    plural: "Badkamermeubels",
    qualifier: "praktisch en stijlvol",
  },
  "bathroom-furniture": {
    singular: "badkamermeubel",
    plural: "Badkamermeubels",
    qualifier: "praktisch en stijlvol",
  },
  "accent furniture": {
    singular: "accentmeubel",
    plural: "Accentmeubels",
    qualifier: "voor een persoonlijk interieur",
  },
  "accent-furniture": {
    singular: "accentmeubel",
    plural: "Accentmeubels",
    qualifier: "voor een persoonlijk interieur",
  },
  "dining room furniture": {
    singular: "eetkamermeubel",
    plural: "Eetkamermeubels",
    qualifier: "voor tafelen en samenzijn",
  },
  "dining-room-furniture": {
    singular: "eetkamermeubel",
    plural: "Eetkamermeubels",
    qualifier: "voor tafelen en samenzijn",
  },
  "bedroom furniture": {
    singular: "slaapkamermeubel",
    plural: "Slaapkamermeubels",
    qualifier: "voor rust en opbergruimte",
  },
  "bedroom-furniture": {
    singular: "slaapkamermeubel",
    plural: "Slaapkamermeubels",
    qualifier: "voor rust en opbergruimte",
  },
  "entryway furniture": {
    singular: "halmeubel",
    plural: "Halmeubels",
    qualifier: "voor een opgeruimde entree",
  },
  "entryway-furniture": {
    singular: "halmeubel",
    plural: "Halmeubels",
    qualifier: "voor een opgeruimde entree",
  },
  "kids furniture": {
    singular: "kindermeubel",
    plural: "Kindermeubels",
    qualifier: "voor spelen, slapen en opbergen",
  },
  "kids-furniture": {
    singular: "kindermeubel",
    plural: "Kindermeubels",
    qualifier: "voor spelen, slapen en opbergen",
  },
  "furniture replacement parts": {
    singular: "meubelonderdeel",
    plural: "Meubelonderdelen",
    qualifier: "voor montage en vervanging",
  },
  "furniture-replacement-parts": {
    singular: "meubelonderdeel",
    plural: "Meubelonderdelen",
    qualifier: "voor montage en vervanging",
  },
  "kitchen furniture": {
    singular: "keukenmeubel",
    plural: "Keukenmeubels",
    qualifier: "slim en ruimtebesparend",
  },
  "kitchen-furniture": {
    singular: "keukenmeubel",
    plural: "Keukenmeubels",
    qualifier: "slim en ruimtebesparend",
  },
  "bathroom furniture set": {
    singular: "badkamermeubel",
    plural: "Badkamermeubels",
    qualifier: "complete sets en opbergruimte",
  },
  "bathroom-furniture-sets": {
    singular: "badkamermeubelset",
    plural: "Badkamermeubelsets",
    qualifier: "compleet en praktisch",
  },
  "kitchen tools gadgets": {
    singular: "keukenaccessoire",
    plural: "Keukenaccessoires",
    qualifier: "slim en praktisch",
  },
  "kitchen-tools-gadgets": {
    singular: "keukenaccessoire",
    plural: "Keukenaccessoires",
    qualifier: "slim en praktisch",
  },
  "side tables": {
    singular: "bijzettafel",
    plural: "Bijzettafels",
    qualifier: "compact en veelzijdig",
  },
  "side-tables": {
    singular: "bijzettafel",
    plural: "Bijzettafels",
    qualifier: "compact en veelzijdig",
  },
  "console tables": {
    singular: "consoletafel",
    plural: "Consoletafels",
    qualifier: "voor hal en woonkamer",
  },
  "console-tables": {
    singular: "consoletafel",
    plural: "Consoletafels",
    qualifier: "voor hal en woonkamer",
  },
  sideboards: {
    singular: "dressoir",
    plural: "Dressoirs",
    qualifier: "stijlvol en ruim",
  },
}

export function cleanSeoText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function truncateSeoText(value: string, maxLength: number) {
  const cleaned = cleanSeoText(value)

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  return `${cleaned.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`
}

export function getCategorySeo(categoryName: string, categoryHandle?: string) {
  const key = (categoryHandle || categoryName).toLowerCase()
  const fallbackKey = categoryName.toLowerCase()
  const category = categorySeoMap[key] || categorySeoMap[fallbackKey]
  const plural = category?.plural || cleanSeoText(categoryName)
  const qualifier = category?.qualifier || "modern en betaalbaar"

  return {
    singular: category?.singular || cleanSeoText(categoryName).toLowerCase(),
    label: plural,
    qualifier,
    title: `${plural} kopen | ${qualifier}`,
    description: `Bekijk ${plural.toLowerCase()} van ${
      siteSeo.name
    }. Vergelijk modellen, materialen, maten en actuele prijzen en bestel eenvoudig online.`,
  }
}

export function absoluteUrl(path = "") {
  const baseUrl = getBaseURL().replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

export function productSeo(
  product: HttpTypes.StoreProduct,
  countryCode: string
) {
  const { cheapestPrice } = getProductPrice({ product })
  const images = [
    product.thumbnail,
    ...(product.images?.map((image) => image.url) || []),
  ].filter(
    (image, index, all): image is string =>
      Boolean(image) && all.indexOf(image) === index
  )

  const metadata = (product.metadata || {}) as Record<string, unknown>
  const categoryName =
    product.categories?.[0]?.name ||
    (typeof metadata.source_category === "string"
      ? metadata.source_category
      : "Meubels")
  const category = getCategorySeo(categoryName, product.categories?.[0]?.handle)
  const productTitle = cleanSeoText(product.title)
  const includesCategory = productTitle
    .toLowerCase()
    .includes(category.singular.toLowerCase())
  const metadataTitle =
    typeof metadata.seo_title === "string" ? metadata.seo_title : undefined
  const title =
    metadataTitle ||
    truncateSeoText(
      `${productTitle}${includesCategory ? "" : ` ${category.singular}`} kopen`,
      55
    )
  const metadataDescription =
    typeof metadata.seo_description === "string"
      ? metadata.seo_description
      : undefined

  return {
    title,
    description: truncateSeoText(
      metadataDescription ||
        product.description ||
        `Bekijk ${product.title} van ${siteSeo.name}. Ontdek materiaal, afmetingen, levertijd en actuele prijs.`,
      160
    ),
    url: absoluteUrl(`/${countryCode}/products/${product.handle}`),
    images,
    price: cheapestPrice?.calculated_price_number,
    currency: cheapestPrice?.currency_code?.toUpperCase() || "EUR",
    sku: product.variants?.[0]?.sku || product.id,
    keywords: Array.isArray(metadata.seo_keywords)
      ? metadata.seo_keywords.filter(
          (keyword): keyword is string => typeof keyword === "string"
        )
      : [],
  }
}
