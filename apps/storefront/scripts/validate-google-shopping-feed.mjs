const feedUrl = process.argv[2] || "https://lvro.nl/feeds/google-shopping.xml"

const allowedAvailability = new Set([
  "in_stock",
  "out_of_stock",
  "backorder",
  "preorder",
])
const allowedConditions = new Set(["new", "refurbished", "used"])
const genericOptionValues = new Set([
  "default",
  "default option",
  "default title",
  "standaard",
])
const knownGoogleCategories = new Set([
  "443",
  "460",
  "4355",
  "6356",
  "1395",
  "1549",
  "1602",
  "447",
  "6362",
  "500000",
  "638",
  "436",
  "6347",
  "6346",
  "2081",
  "6934",
])

function decodeXml(value = "") {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim()
}

function valueOf(item, tag) {
  const match = item.match(new RegExp(`<g:${tag}>([\\s\\S]*?)</g:${tag}>`))

  return decodeXml(match?.[1])
}

function fail(errors, id, message) {
  errors.push(`${id || "onbekend item"}: ${message}`)
}

const response = await fetch(feedUrl, {
  headers: { "user-agent": "LVRO Shopping Feed Validator/1.0" },
})

if (!response.ok) {
  throw new Error(`Feed ophalen mislukt: HTTP ${response.status} (${feedUrl})`)
}

const xml = await response.text()
const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
const errors = []
const warnings = []
const ids = new Set()
const groups = new Map()
let itemsWithAdditionalImages = 0
let itemsWithGoogleCategory = 0
let itemsWithVerifiedIdentifiers = 0

if (!xml.includes('xmlns:g="http://base.google.com/ns/1.0"')) {
  errors.push("Google RSS namespace ontbreekt")
}

if (!items.length) {
  errors.push("Feed bevat geen producten")
}

for (const item of items) {
  const id = valueOf(item, "id")
  const required = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "condition",
    "price",
    "identifier_exists",
    "product_type",
    "shipping",
  ]

  for (const tag of required) {
    if (!valueOf(item, tag)) fail(errors, id, `<g:${tag}> ontbreekt`)
  }

  if (ids.has(id)) fail(errors, id, "dubbel product-ID")
  ids.add(id)

  if (id.length > 50) fail(errors, id, "product-ID is langer dan 50 tekens")

  const title = valueOf(item, "title")
  const description = valueOf(item, "description")
  if (title.length > 150) fail(errors, id, "titel is langer dan 150 tekens")
  if (description.length > 5000) {
    fail(errors, id, "beschrijving is langer dan 5.000 tekens")
  }

  for (const tag of ["link", "image_link"]) {
    const url = valueOf(item, tag)
    if (!url.startsWith("https://") && !url.startsWith("http://localhost")) {
      fail(errors, id, `<g:${tag}> gebruikt geen HTTPS-URL`)
    }
  }

  const availability = valueOf(item, "availability")
  if (!allowedAvailability.has(availability)) {
    fail(errors, id, `ongeldige beschikbaarheid: ${availability}`)
  }

  const condition = valueOf(item, "condition")
  if (!allowedConditions.has(condition)) {
    fail(errors, id, `ongeldige staat: ${condition}`)
  }

  const price = valueOf(item, "price")
  if (
    !/^\d+\.\d{2} [A-Z]{3}$/.test(price) ||
    Number(price.split(" ")[0]) <= 0
  ) {
    fail(errors, id, `ongeldige prijs: ${price}`)
  }

  const identifierExists = valueOf(item, "identifier_exists")
  const gtin = valueOf(item, "gtin")
  const brand = valueOf(item, "brand")
  const mpn = valueOf(item, "mpn")
  const hasVerifiedIdentifier = Boolean(gtin || (brand && mpn))

  if (identifierExists !== (hasVerifiedIdentifier ? "yes" : "no")) {
    fail(
      errors,
      id,
      "identifier_exists komt niet overeen met GTIN of merk + MPN"
    )
  }
  if (hasVerifiedIdentifier) itemsWithVerifiedIdentifiers += 1
  if (brand.toLowerCase() === "lvro.nl") {
    fail(errors, id, "lvro.nl mag niet als fabrikantmerk worden verzonnen")
  }

  const color = valueOf(item, "color").toLowerCase()
  if (genericOptionValues.has(color)) {
    fail(
      errors,
      id,
      `generieke waarde '${color}' mag niet als kleur worden gebruikt`
    )
  }

  const productType = valueOf(item, "product_type")
  if (!productType.includes(" > ")) {
    fail(errors, id, "product_type bevat geen volledige categorieroute")
  }

  const googleCategory = valueOf(item, "google_product_category")
  if (googleCategory) {
    itemsWithGoogleCategory += 1
    if (!knownGoogleCategories.has(googleCategory)) {
      fail(errors, id, `onbekende Google-productcategorie: ${googleCategory}`)
    }
  }

  const shipping = valueOf(item, "shipping")
  if (
    !shipping.includes("<g:country>NL</g:country>") ||
    !shipping.includes("<g:price>10.00 EUR</g:price>")
  ) {
    fail(errors, id, "Nederlandse verzendkosten van 10,00 EUR ontbreken")
  }
  if (!item.includes("<g:country>BE</g:country>")) {
    fail(errors, id, "Belgische verzending ontbreekt")
  }

  const groupId = valueOf(item, "item_group_id")
  if (groupId) {
    const group = groups.get(groupId) || []
    group.push({
      id,
      hasVariantAttribute: Boolean(color || valueOf(item, "size")),
    })
    groups.set(groupId, group)
  }

  if (item.includes("<g:additional_image_link>")) {
    itemsWithAdditionalImages += 1
  }
}

for (const [groupId, group] of groups) {
  if (group.length < 2) {
    errors.push(
      `${groupId}: item_group_id wordt maar voor één aanbieding gebruikt`
    )
  }
  if (group.some((item) => !item.hasVariantAttribute)) {
    errors.push(`${groupId}: gegroepeerde variant mist kleur of maat`)
  }
}

if (itemsWithAdditionalImages < items.length) {
  warnings.push(
    `${itemsWithAdditionalImages}/${items.length} aanbiedingen hebben extra productfoto's`
  )
}

const report = {
  feedUrl,
  items: items.length,
  uniqueIds: ids.size,
  itemGroups: groups.size,
  withGoogleProductCategory: itemsWithGoogleCategory,
  withVerifiedIdentifiers: itemsWithVerifiedIdentifiers,
  withAdditionalImages: itemsWithAdditionalImages,
  warnings,
  errors: errors.slice(0, 50),
}

console.log(JSON.stringify(report, null, 2))

if (errors.length) {
  console.error(`\nValidatie mislukt met ${errors.length} fout(en).`)
  process.exit(1)
}

console.log("\nGoogle Shopping-feed is technisch geldig.")
