import { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { BreadcrumbJsonLd, ProductJsonLd } from "@lib/json-ld"
import { absoluteUrl, localizedAlternates, productSeo, siteSeo } from "@lib/seo"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { getProductConversion } from "@lib/data/conversion"
import { resolveProductRedirect } from "@lib/data/product-redirects"
import { sanitizeProductForClient } from "@lib/util/sanitize-product"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export const dynamic = "force-dynamic"
export const revalidate = 0

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const replacement = await resolveProductRedirect(handle)
  if (replacement && replacement !== handle) {
    permanentRedirect(`/${params.countryCode}/products/${replacement}`)
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
    cache: "no-store",
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const canonicalHandle =
    typeof product.metadata?.canonical_handle === "string"
      ? product.metadata.canonical_handle
      : product.handle

  if (canonicalHandle && canonicalHandle !== handle) {
    permanentRedirect(`/${params.countryCode}/products/${canonicalHandle}`)
  }

  const seo = productSeo(product, params.countryCode)

  return {
    title: {
      absolute: seo.title,
    },
    description: seo.description,
    keywords: seo.keywords,
    alternates: localizedAlternates(
      params.countryCode,
      `/products/${canonicalHandle || handle}`
    ),
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      type: "website",
      siteName: siteSeo.name,
      images: seo.images.map((url) => ({
        url,
        alt: product.title,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: seo.images,
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const replacement = await resolveProductRedirect(params.handle)
  if (replacement && replacement !== params.handle) {
    permanentRedirect(`/${params.countryCode}/products/${replacement}`)
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
    cache: "no-store",
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const canonicalHandle =
    typeof pricedProduct.metadata?.canonical_handle === "string"
      ? pricedProduct.metadata.canonical_handle
      : pricedProduct.handle

  if (canonicalHandle && canonicalHandle !== params.handle) {
    permanentRedirect(`/${params.countryCode}/products/${canonicalHandle}`)
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)
  const conversion = await getProductConversion(pricedProduct.id)
  const seo = productSeo(pricedProduct, params.countryCode)
  const isInStock = pricedProduct.variants?.some(
    (variant) =>
      !variant.manage_inventory ||
      variant.allow_backorder ||
      (variant.inventory_quantity ?? 0) > 0
  )
  const productBrand =
    typeof pricedProduct.metadata?.brand === "string" &&
    pricedProduct.metadata.brand.trim()
      ? pricedProduct.metadata.brand.trim()
      : undefined
  const productCategory = pricedProduct.categories?.[0]?.name || "Meubels"

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          {
            position: 1,
            name: "Home",
            item: absoluteUrl(`/${params.countryCode}`),
          },
          {
            position: 2,
            name: "Store",
            item: absoluteUrl(`/${params.countryCode}/store`),
          },
          ...(pricedProduct.categories?.[0]?.handle
            ? [
                {
                  position: 3,
                  name: pricedProduct.categories[0].name,
                  item: absoluteUrl(
                    `/${params.countryCode}/categories/${pricedProduct.categories[0].handle}`
                  ),
                },
              ]
            : []),
          {
            position: pricedProduct.categories?.[0]?.handle ? 4 : 3,
            name: pricedProduct.title,
            item: seo.url,
          },
        ]}
      />
      <ProductJsonLd
        name={pricedProduct.title}
        description={seo.description}
        image={seo.images}
        sku={seo.sku || pricedProduct.id}
        brand={productBrand}
        category={productCategory}
        url={seo.url}
        offers={{
          price: seo.price || 0,
          priceCurrency: seo.currency,
          availability: isInStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url: seo.url,
          seller: {
            name: siteSeo.name,
          },
        }}
        aggregateRating={
          conversion?.rating.count && conversion.rating.average > 0
            ? {
                ratingValue: conversion.rating.average,
                reviewCount: conversion.rating.count,
              }
            : undefined
        }
      />
      <ProductTemplate
        product={sanitizeProductForClient(pricedProduct)}
        region={region}
        countryCode={params.countryCode}
        images={images ?? []}
        conversion={conversion}
      />
    </>
  )
}
