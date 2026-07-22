const auditOrigin = new URL(process.argv[2] || "https://lvro.nl")
const publicOrigin = "https://lvro.nl"
const errors = []
const warnings = []

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim()
}

function fetchUrl(publicUrl) {
  const url = new URL(publicUrl, publicOrigin)
  url.protocol = auditOrigin.protocol
  url.hostname = auditOrigin.hostname
  url.port = auditOrigin.port
  return url
}

async function get(publicUrl) {
  const url = fetchUrl(publicUrl)
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "LVRO SEO Validator/1.0" },
  })
  return { response, body: await response.text(), url }
}

function tagContent(html, tag) {
  return decodeHtml(
    html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1]
  )
}

function metaContent(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || []
  const tag = tags.find((value) =>
    new RegExp(`(?:name|property)=["']${name}["']`, "i").test(value)
  )
  return decodeHtml(tag?.match(/content=["']([^"']*)["']/i)?.[1])
}

function linkHref(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) || []
  const tag = tags.find((value) =>
    new RegExp(`rel=["']${rel}["']`, "i").test(value)
  )
  return decodeHtml(tag?.match(/href=["']([^"']*)["']/i)?.[1])
}

function jsonLd(html) {
  return [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ]
    .map((match) => {
      try {
        return JSON.parse(match[1])
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function addError(page, message) {
  errors.push(`${page}: ${message}`)
}

async function auditIndexablePage(publicUrl, expectedTypes = []) {
  const { response, body } = await get(publicUrl)
  if (!response.ok) {
    addError(publicUrl, `HTTP ${response.status}`)
    return null
  }

  const title = tagContent(body, "title")
  const description = metaContent(body, "description")
  const canonical = linkHref(body, "canonical")
  const robots = metaContent(body, "robots")
  const hreflangs = new Set(
    [...body.matchAll(/hreflang=["']([^"']+)["']/gi)].map((match) =>
      match[1].toLowerCase()
    )
  )
  const h1Count = (body.match(/<h1\b/gi) || []).length
  const schemas = jsonLd(body)

  if (title.length < 15 || title.length > 70) {
    addError(publicUrl, `titellengte is ${title.length}`)
  }
  if (description.length < 50 || description.length > 170) {
    addError(publicUrl, `meta-descriptionlengte is ${description.length}`)
  }
  if (canonical !== publicUrl) {
    addError(publicUrl, `canonical is '${canonical}'`)
  }
  if (robots.toLowerCase().includes("noindex")) {
    addError(publicUrl, "indexeerbare pagina bevat noindex")
  }
  for (const language of ["nl-nl", "nl-be", "x-default"]) {
    if (!hreflangs.has(language))
      addError(publicUrl, `hreflang ${language} ontbreekt`)
  }
  if (h1Count !== 1) addError(publicUrl, `heeft ${h1Count} H1-koppen`)
  for (const type of expectedTypes) {
    if (!schemas.some((schema) => schema["@type"] === type)) {
      addError(publicUrl, `${type} structured data ontbreekt`)
    }
  }

  return { body, schemas, title, description, canonical, robots }
}

const robotsResult = await get("/robots.txt")
if (!robotsResult.response.ok) errors.push("robots.txt is niet bereikbaar")
if (!robotsResult.body.includes("Sitemap: https://lvro.nl/sitemap.xml")) {
  errors.push("robots.txt verwijst niet naar de productie-sitemap")
}
if (!robotsResult.body.includes("Disallow: /api/")) {
  errors.push("robots.txt blokkeert de API niet")
}

const sitemapResult = await get("/sitemap.xml")
if (!sitemapResult.response.ok) errors.push("sitemap.xml is niet bereikbaar")
const sitemapUrls = [...sitemapResult.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => decodeHtml(match[1])
)
const uniqueUrls = new Set(sitemapUrls)

if (sitemapUrls.length < 3000 || sitemapUrls.length > 5000) {
  errors.push(`sitemap bevat onverwacht ${sitemapUrls.length} URL's`)
}
if (uniqueUrls.size !== sitemapUrls.length) {
  errors.push("sitemap bevat dubbele URL's")
}
for (const url of sitemapUrls) {
  const countryCode = new URL(url).pathname.split("/")[1]
  if (!["nl", "be"].includes(countryCode)) {
    addError(url, `niet-doelland '${countryCode}' staat in sitemap`)
  }
}
if (!sitemapResult.body.includes('hreflang="nl-NL"')) {
  errors.push("sitemap bevat geen NL/BE hreflang-relaties")
}
if (!sitemapResult.body.includes("<image:image>")) {
  warnings.push("sitemap bevat geen productafbeeldingen")
}

const categoryUrl = sitemapUrls.find((url) => url.includes("/nl/categories/"))
const productUrl = sitemapUrls.find((url) => url.includes("/nl/products/"))
const corePages = [
  [publicOrigin + "/nl", ["OnlineStore", "BreadcrumbList"]],
  [publicOrigin + "/nl/store", ["BreadcrumbList", "ItemList"]],
  [categoryUrl, ["BreadcrumbList", "ItemList"]],
  [publicOrigin + "/nl/faq", ["BreadcrumbList", "FAQPage"]],
  [productUrl, ["BreadcrumbList", "Product"]],
].filter(([url]) => Boolean(url))

const audited = new Map()
for (const [url, types] of corePages) {
  audited.set(url, await auditIndexablePage(url, types))
}

const categoryAudit = audited.get(categoryUrl)
if (categoryAudit && !categoryAudit.body.includes("Keuzehulp")) {
  addError(categoryUrl, "zichtbare categorie-keuzehulp ontbreekt")
}

const productAudit = audited.get(productUrl)
if (productAudit) {
  const product = productAudit.schemas.find(
    (schema) => schema["@type"] === "Product"
  )
  if (!product?.offers?.price || !product?.offers?.priceCurrency) {
    addError(productUrl, "Product-aanbod mist prijs of valuta")
  }
  if (product?.offers?.seller?.["@type"] !== "Organization") {
    addError(productUrl, "verkoper is niet als Organization gemarkeerd")
  }
  if (!product?.offers?.shippingDetails) {
    addError(
      productUrl,
      "verzendinformatie ontbreekt in Product structured data"
    )
  }
  if (product?.brand?.name?.toLowerCase() === "lvro.nl") {
    addError(productUrl, "lvro.nl wordt onterecht als fabrikantmerk gebruikt")
  }
}

const duplicatePage = await get("/nl/store?sortBy=price_asc")
if (
  !metaContent(duplicatePage.body, "robots").toLowerCase().includes("noindex")
) {
  errors.push("sorteer-URL bevat geen noindex")
}
if (linkHref(duplicatePage.body, "canonical") !== publicOrigin + "/nl/store") {
  errors.push("sorteer-URL canonicaliseert niet naar de hoofdcollectie")
}

const pageTwo = await get("/nl/store?page=2")
if (linkHref(pageTwo.body, "canonical") !== publicOrigin + "/nl/store?page=2") {
  errors.push("pagina 2 heeft geen zelf-canonical")
}
if (!tagContent(pageTwo.body, "title").includes("Pagina 2")) {
  errors.push("pagina 2 heeft geen unieke paginatitel")
}
if (!/rel=["'](?:prev|next)["']/i.test(pageTwo.body)) {
  errors.push("paginering bevat geen crawlbare vorige/volgende link")
}

const foreignPage = await get("/fr/store")
if (
  !metaContent(foreignPage.body, "robots").toLowerCase().includes("noindex")
) {
  errors.push("niet-doelland FR bevat geen noindex")
}
if (linkHref(foreignPage.body, "canonical") !== publicOrigin + "/nl/store") {
  errors.push("niet-doelland FR canonicaliseert niet naar NL")
}

for (const privatePath of ["/nl/cart", "/nl/wishlist", "/nl/verify-account"]) {
  const page = await get(privatePath)
  if (!metaContent(page.body, "robots").toLowerCase().includes("noindex")) {
    addError(privatePath, "privépagina bevat geen noindex")
  }
}

const report = {
  auditOrigin: auditOrigin.origin,
  sitemapUrls: sitemapUrls.length,
  sitemapCountries: [
    ...new Set(sitemapUrls.map((url) => new URL(url).pathname.split("/")[1])),
  ].sort(),
  auditedPages: audited.size + 6,
  warnings,
  errors: errors.slice(0, 75),
}

console.log(JSON.stringify(report, null, 2))
if (errors.length) {
  console.error(`\nSEO-validatie mislukt met ${errors.length} fout(en).`)
  process.exit(1)
}
console.log("\nSEO-validatie geslaagd.")
