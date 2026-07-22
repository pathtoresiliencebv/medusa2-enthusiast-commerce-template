import { HttpTypes } from "@medusajs/types"

import { listProducts } from "@lib/data/products"
import { absoluteUrl, getCategorySeo, siteSeo } from "@lib/seo"

export type ShoppingFeedItem = {
  id: string
  itemGroupId?: string
  itemGroupTitle?: string
  title: string
  description: string
  availability: "in_stock" | "out_of_stock" | "backorder"
  condition: "new"
  price: number
  originalPrice?: number
  currency: string
  link: string
  imageLink: string
  additionalImageLinks: string[]
  brand?: string
  gtin?: string
  mpn?: string
  productType: string
  googleProductCategory?: string
  color?: string
  size?: string
  material?: string
  inventory: number
  shippingLabel: string
  customLabel0: string
  customLabel1: string
}

type ApprovedFeedProduct = {
  product_id: string
  brand?: string
  mpn?: string
  google_product_category?: string
}

const categoryFeedMap: Record<
  string,
  { productType: string; googleProductCategory?: string }
> = {
  chairs: {
    productType: "Meubels > Woonkamer > Stoelen en fauteuils",
    googleProductCategory: "443",
  },
  sofas: {
    productType: "Meubels > Woonkamer > Banken",
    googleProductCategory: "460",
  },
  tables: {
    productType: "Meubels > Eetkamer > Eettafels",
    googleProductCategory: "4355",
  },
  storage: {
    productType: "Meubels > Woonkamer > Kasten en opbergmeubels",
    googleProductCategory: "6356",
  },
  "coffee-tables": {
    productType: "Meubels > Woonkamer > Salontafels",
    googleProductCategory: "1395",
  },
  "side-tables": {
    productType: "Meubels > Woonkamer > Bijzettafels",
    googleProductCategory: "1549",
  },
  "console-tables": {
    productType: "Meubels > Hal > Consoletafels",
    googleProductCategory: "1602",
  },
  sideboards: {
    productType: "Meubels > Woonkamer > Dressoirs",
    googleProductCategory: "447",
  },
  "living-room-furniture": {
    productType: "Meubels > Woonkamer",
    googleProductCategory: "436",
  },
  "accent-furniture": {
    productType: "Meubels > Woonkamer > Accentmeubels",
    googleProductCategory: "436",
  },
  "dining-room-furniture": {
    productType: "Meubels > Eetkamer",
    googleProductCategory: "6347",
  },
  "bedroom-furniture": {
    productType: "Meubels > Slaapkamer",
    googleProductCategory: "6346",
  },
  "home-office-furniture": {
    productType: "Meubels > Werkruimte",
    googleProductCategory: "6362",
  },
  "entryway-furniture": {
    productType: "Meubels > Hal",
    googleProductCategory: "436",
  },
  "bathroom-furniture": {
    productType: "Meubels > Badkamer",
    googleProductCategory: "2081",
  },
  "bathroom-furniture-sets": {
    productType: "Meubels > Badkamer > Badkamermeubelsets",
    googleProductCategory: "500000",
  },
  "kitchen-furniture": {
    productType: "Meubels > Keuken",
    googleProductCategory: "6934",
  },
  "kitchen-tools-gadgets": {
    productType: "Wonen > Keuken > Keukenaccessoires",
    googleProductCategory: "638",
  },
  "kids-furniture": {
    productType: "Meubels > Kinderkamer",
    googleProductCategory: "436",
  },
  "furniture-replacement-parts": {
    productType: "Meubels > Meubelonderdelen",
    googleProductCategory: "436",
  },
}

function compactText(value: string | null | undefined, fallback: string) {
  const text = (value || fallback)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  return text.slice(0, 5000)
}

function metadataOf(product: HttpTypes.StoreProduct) {
  return (product.metadata || {}) as Record<string, unknown>
}

function metadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key]

  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

const genericOptionValues = new Set([
  "default",
  "default option",
  "default title",
  "standaard",
])

function variantOptionValue(
  product: HttpTypes.StoreProduct,
  variant: HttpTypes.StoreProductVariant,
  optionNames: string[]
) {
  const optionTitles = new Map(
    (product.options || []).map((option) => [
      option.id,
      option.title.toLowerCase(),
    ])
  )
  const option = variant.options?.find((value) => {
    if (!value.option_id) {
      return false
    }

    const title = optionTitles.get(value.option_id)?.toLowerCase()

    return title && optionNames.some((name) => title.includes(name))
  })
  const value = option?.value?.trim()

  if (!value || genericOptionValues.has(value.toLowerCase())) {
    return undefined
  }

  return value
}

function variantAvailability(
  variant: HttpTypes.StoreProductVariant,
  sourceAvailability?: string
): ShoppingFeedItem["availability"] {
  if (sourceAvailability?.toLowerCase().includes("niet beschikbaar")) {
    return "out_of_stock"
  }

  if (variant.manage_inventory && (variant.inventory_quantity ?? 0) <= 0) {
    return variant.allow_backorder ? "backorder" : "out_of_stock"
  }

  return "in_stock"
}

function productToFeedItems(product: HttpTypes.StoreProduct) {
  const metadata = metadataOf(product)
  const categoryName =
    product.categories?.[0]?.name ||
    metadataString(metadata, "source_category") ||
    "Meubels"
  const categoryHandle = product.categories?.[0]?.handle
  const categoryKey = (categoryHandle || categoryName).toLowerCase()
  const categorySeo = getCategorySeo(categoryName, categoryHandle)
  const feedCategory = categoryFeedMap[categoryKey] || {
    productType: `Meubels > ${categorySeo.label}`,
  }
  const variants = product.variants || []
  const productImages = [
    product.thumbnail,
    ...(product.images?.map((image) => image.url) || []),
  ].filter(Boolean) as string[]
  const sourceAvailability = metadataString(metadata, "source_availability")
  const material = metadataString(metadata, "material")
  const warehouse =
    metadata.source_eu_warehouse === true ? "EU-magazijn" : "Internationaal"

  return variants.flatMap((variant) => {
    const calculatedPrice = variant.calculated_price
    const currentPrice = calculatedPrice?.calculated_amount
    const originalPrice = calculatedPrice?.original_amount
    const imageLinks = [
      ...(variant.images?.map((image) => image.url) || []),
      ...productImages,
    ].filter((url, index, all) => Boolean(url) && all.indexOf(url) === index)

    if (!currentPrice || !imageLinks[0] || !product.handle) {
      return []
    }

    const hasMeaningfulVariant =
      variants.length > 1 &&
      variant.title &&
      !["default", "standaard"].includes(variant.title.toLowerCase())
    const title = compactText(
      `${product.title}${hasMeaningfulVariant ? ` - ${variant.title}` : ""}`,
      product.title
    ).slice(0, 150)
    const availability = variantAvailability(variant, sourceAvailability)
    const color = variantOptionValue(product, variant, [
      "color",
      "colour",
      "kleur",
      "farbe",
    ])
    const size = variantOptionValue(product, variant, [
      "size",
      "maat",
      "afmeting",
      "dimension",
      "grootte",
    ])
    const hasGoogleVariantAttribute = Boolean(color || size)
    const brand = metadataString(metadata, "brand")
    const mpn = metadataString(metadata, "mpn")
    const gtin = variant.ean || variant.barcode || undefined

    return [
      {
        id: variant.id,
        itemGroupId:
          variants.length > 1 && hasGoogleVariantAttribute
            ? product.id
            : undefined,
        itemGroupTitle:
          variants.length > 1 && hasGoogleVariantAttribute
            ? product.title
            : undefined,
        title,
        description: compactText(
          product.description,
          `Bekijk ${product.title}, een ${categorySeo.singular} van ${siteSeo.name}.`
        ),
        availability,
        condition: "new" as const,
        price: currentPrice,
        originalPrice:
          originalPrice && originalPrice > currentPrice
            ? originalPrice
            : undefined,
        currency: calculatedPrice?.currency_code?.toUpperCase() || "EUR",
        link: absoluteUrl(`/nl/products/${product.handle}?v_id=${variant.id}`),
        imageLink: imageLinks[0],
        additionalImageLinks: imageLinks.slice(1, 11),
        brand,
        gtin,
        mpn,
        productType: feedCategory.productType,
        googleProductCategory: feedCategory.googleProductCategory,
        color,
        size,
        material,
        inventory:
          variant.inventory_quantity ??
          (availability === "out_of_stock" ? 0 : 1),
        shippingLabel: "meubels-nl-be",
        customLabel0: warehouse,
        customLabel1: categoryName,
      } satisfies ShoppingFeedItem,
    ]
  })
}

async function getApprovedFeedProducts() {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!backendUrl || !publishableKey) return new Map<string, ApprovedFeedProduct>()

  const response = await fetch(
    `${backendUrl.replace(/\/$/, "")}/store/conversion/shopping-feed`,
    {
      headers: { "x-publishable-api-key": publishableKey },
      cache: "no-store",
    }
  )
  if (!response.ok) throw new Error(`Kernfeedstatus niet beschikbaar (${response.status})`)
  const payload = (await response.json()) as { products?: ApprovedFeedProduct[] }
  return new Map((payload.products || []).map((item) => [item.product_id, item]))
}

export async function getShoppingFeedItems(
  countryCode = "nl",
  mode: "full" | "core" = "full"
) {
  const limit = 100
  const queryParams = {
    limit,
    fields:
      "id,title,description,handle,thumbnail,*images,*categories,+metadata,*options,*options.values,*variants,*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options",
  }
  const firstPage = await listProducts({
    pageParam: 1,
    countryCode,
    queryParams,
    cache: "no-store",
  })
  const totalPages = Math.ceil(firstPage.response.count / limit)
  const products = [...firstPage.response.products]

  for (let startPage = 2; startPage <= totalPages; startPage += 5) {
    const pageNumbers = Array.from(
      { length: Math.min(5, totalPages - startPage + 1) },
      (_, index) => startPage + index
    )
    const pages = await Promise.all(
      pageNumbers.map((pageParam) =>
        listProducts({
          pageParam,
          countryCode,
          queryParams,
          cache: "no-store",
        })
      )
    )

    products.push(...pages.flatMap((page) => page.response.products))
  }

  const selectedProducts =
    mode === "core"
      ? await getApprovedFeedProducts().then((approved) =>
          products
            .filter((product) => approved.has(product.id))
            .map((product) => {
              const publicData = approved.get(product.id)
              return {
                ...product,
                metadata: {
                  ...(product.metadata || {}),
                  ...(publicData?.brand ? { brand: publicData.brand } : {}),
                  ...(publicData?.mpn ? { mpn: publicData.mpn } : {}),
                },
              } as HttpTypes.StoreProduct
            })
        )
      : products

  const feedItems = selectedProducts.flatMap(productToFeedItems)
  const priceSafeItems = feedItems.filter((item) => item.price <= 10_000)
  if (mode === "full") return priceSafeItems

  const exactDuplicates = new Set<string>()
  return priceSafeItems.filter((item) => {
    const key = `${item.title}|${item.imageLink}|${item.price}`.toLowerCase()
    if (exactDuplicates.has(key)) return false
    exactDuplicates.add(key)
    return Boolean(item.googleProductCategory)
  })
}

export function shoppingFeedXml(items: ShoppingFeedItem[]) {
  const itemXml = items
    .map((item) => {
      const price = item.originalPrice || item.price
      const salePrice = item.originalPrice
        ? `<g:sale_price>${item.price.toFixed(2)} ${item.currency}</g:sale_price>`
        : ""
      const additionalImages = item.additionalImageLinks
        .map((image) => `<g:additional_image_link>${escapeXml(image)}</g:additional_image_link>`)
        .join("")
      const hasIdentifier = Boolean(item.gtin || (item.brand && item.mpn))
      const shipping = ["NL", "BE"]
        .map(
          (country) => `<g:shipping>
    <g:country>${country}</g:country>
    <g:service>Standaardbezorging 3-5 werkdagen</g:service>
    <g:price>10.00 EUR</g:price>
  </g:shipping>`
        )
        .join("\n")

      return `<item>
  <g:id>${escapeXml(item.id)}</g:id>
  ${item.itemGroupId ? `<g:item_group_id>${escapeXml(item.itemGroupId)}</g:item_group_id>` : ""}
  ${item.itemGroupTitle ? `<g:item_group_title>${escapeXml(item.itemGroupTitle)}</g:item_group_title>` : ""}
  <g:title>${escapeXml(item.title)}</g:title>
  <g:description>${escapeXml(item.description)}</g:description>
  <g:link>${escapeXml(item.link)}</g:link>
  <g:image_link>${escapeXml(item.imageLink)}</g:image_link>
  ${additionalImages}
  <g:availability>${item.availability}</g:availability>
  <g:condition>${item.condition}</g:condition>
  <g:price>${price.toFixed(2)} ${item.currency}</g:price>
  ${salePrice}
  ${item.brand ? `<g:brand>${escapeXml(item.brand)}</g:brand>` : ""}
  ${item.mpn ? `<g:mpn>${escapeXml(item.mpn)}</g:mpn>` : ""}
  ${item.gtin ? `<g:gtin>${escapeXml(item.gtin)}</g:gtin>` : ""}
  <g:identifier_exists>${hasIdentifier ? "yes" : "no"}</g:identifier_exists>
  ${item.googleProductCategory ? `<g:google_product_category>${escapeXml(item.googleProductCategory)}</g:google_product_category>` : ""}
  <g:product_type>${escapeXml(item.productType)}</g:product_type>
  ${item.color ? `<g:color>${escapeXml(item.color)}</g:color>` : ""}
  ${item.size ? `<g:size>${escapeXml(item.size)}</g:size>` : ""}
  ${item.material ? `<g:material>${escapeXml(item.material)}</g:material>` : ""}
  ${shipping}
  <g:shipping_label>${escapeXml(item.shippingLabel)}</g:shipping_label>
  <g:custom_label_0>${escapeXml(item.customLabel0)}</g:custom_label_0>
  <g:custom_label_1>${escapeXml(item.customLabel1)}</g:custom_label_1>
</item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>${escapeXml(siteSeo.name)} productfeed</title>
  <link>${escapeXml(absoluteUrl("/nl"))}</link>
  <description>${escapeXml(siteSeo.description)}</description>
  ${itemXml}
</channel>
</rss>`
}

export function escapeXml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function escapeCsv(value: string | number | undefined) {
  const stringValue = value === undefined ? "" : String(value)

  return `"${stringValue.replace(/"/g, '""')}"`
}
