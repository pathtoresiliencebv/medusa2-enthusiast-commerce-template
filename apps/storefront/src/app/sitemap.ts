import { MetadataRoute } from "next"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import {
  absoluteUrl,
  indexableCountryCodes,
  localizedAlternates,
} from "@lib/seo"
import { policySlugs } from "@lib/service-policy-data"

export const revalidate = 3600
export const maxDuration = 60

async function listAllProductHandles(countryCode: string) {
  const limit = 100
  const queryParams = {
    limit,
    fields: "handle,updated_at,thumbnail,*images",
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

  return products
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const regions = await listRegions()
  const availableCountryCodes = new Set(
    (regions || []).flatMap(
      (region) => region.countries?.map((country) => country.iso_2) || []
    )
  )
  const countryCodes = indexableCountryCodes.filter((countryCode) =>
    availableCountryCodes.has(countryCode)
  )
  const alternatesFor = (path = "") => ({
    languages: localizedAlternates("nl", path).languages,
  })

  const staticRoutes = countryCodes.flatMap((countryCode) => [
    {
      url: absoluteUrl(`/${countryCode}`),
      changeFrequency: "daily" as const,
      priority: 1,
      alternates: alternatesFor(),
    },
    {
      url: absoluteUrl(`/${countryCode}/store`),
      changeFrequency: "daily" as const,
      priority: 0.9,
      alternates: alternatesFor("/store"),
    },
    {
      url: absoluteUrl(`/${countryCode}/inspiratie`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: alternatesFor("/inspiratie"),
    },
    {
      url: absoluteUrl(`/${countryCode}/service`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: alternatesFor("/service"),
    },
    {
      url: absoluteUrl(`/${countryCode}/faq`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: alternatesFor("/faq"),
    },
    {
      url: absoluteUrl(`/${countryCode}/over-ons`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: alternatesFor("/over-ons"),
    },
    {
      url: absoluteUrl(`/${countryCode}/track-en-trace`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: alternatesFor("/track-en-trace"),
    },
    ...policySlugs.map((slug) => ({
      url: absoluteUrl(`/${countryCode}/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: alternatesFor(`/${slug}`),
    })),
  ])

  const productRoutes = (
    await Promise.all(
      countryCodes.map(async (countryCode) => {
        const products = await listAllProductHandles(countryCode)

        return products
          .filter((product) => product.handle)
          .map((product) => ({
            url: absoluteUrl(`/${countryCode}/products/${product.handle}`),
            lastModified: product.updated_at
              ? new Date(product.updated_at)
              : undefined,
            changeFrequency: "weekly" as const,
            priority: 0.8,
            alternates: alternatesFor(`/products/${product.handle}`),
            images: [
              product.thumbnail,
              ...(product.images?.map((image) => image.url) || []),
            ].filter(
              (image, index, all): image is string =>
                Boolean(image) && all.indexOf(image) === index
            ),
          }))
      })
    )
  ).flat()

  const categories = await listCategories()
  const categoryRoutes = countryCodes.flatMap((countryCode) =>
    categories
      .filter((category) => category.handle)
      .map((category) => ({
        url: absoluteUrl(`/${countryCode}/categories/${category.handle}`),
        lastModified: category.updated_at
          ? new Date(category.updated_at)
          : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: alternatesFor(`/categories/${category.handle}`),
      }))
  )

  const { collections } = await listCollections({
    fields: "id,handle,title,updated_at",
  })
  const collectionRoutes = countryCodes.flatMap((countryCode) =>
    collections
      .filter((collection) => collection.handle)
      .map((collection) => ({
        url: absoluteUrl(`/${countryCode}/collections/${collection.handle}`),
        lastModified: collection.updated_at
          ? new Date(collection.updated_at)
          : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: alternatesFor(`/collections/${collection.handle}`),
      }))
  )

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...collectionRoutes,
    ...productRoutes,
  ]
}
