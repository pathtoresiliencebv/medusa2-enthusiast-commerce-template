import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { listingSeoState, siteSeo } from "@lib/seo"
import { listCategories } from "@lib/data/categories"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      page?: string
      sortBy?: SortOptions
      optionValueIds?: string | string[]
    }
  >
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  try {
    const { collections } = await listCollections({
      fields: "*products",
    })

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

    return staticParams
  } catch {
    // A fresh Railway template can build before Medusa finishes its first boot.
    // Collections remain available dynamically after the backend is online.
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const searchParams = await props.searchParams
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const listingSeo = listingSeoState(
    params.countryCode,
    `/collections/${collection.handle}`,
    searchParams
  )
  const pageSuffix = listingSeo.page > 1 ? ` - Pagina ${listingSeo.page}` : ""
  const title = `${collection.title} meubels kopen${pageSuffix}`
  const description = `Bekijk de ${collection.title}-collectie van ${siteSeo.name}. Vergelijk materialen, maten en prijzen en bestel jouw nieuwe meubel online.`
  const metadata = {
    title,
    description,
    alternates: listingSeo.alternates,
    robots: listingSeo.robots,
    openGraph: {
      title: `${title} | ${siteSeo.name}`,
      description,
      url: listingSeo.alternates.canonical,
      siteName: siteSeo.name,
      type: "website",
    },
  } as Metadata

  return metadata
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const [collection, categories] = await Promise.all([
    getCollectionByHandle(params.handle),
    listCategories(),
  ])

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
      categories={categories}
    />
  )
}
