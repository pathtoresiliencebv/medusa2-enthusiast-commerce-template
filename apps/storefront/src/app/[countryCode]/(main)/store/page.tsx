import { Metadata } from "next"

import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { listingSeoState, siteSeo } from "@lib/seo"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { listCategories } from "@lib/data/categories"

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<StorePageSearchParams>
}): Promise<Metadata> {
  const { countryCode } = await params
  const listingSeo = listingSeoState(countryCode, "/store", await searchParams)
  const pageSuffix = listingSeo.page > 1 ? ` - Pagina ${listingSeo.page}` : ""
  const title = `Meubels online kopen | Banken, tafels en kasten${pageSuffix}`
  const description =
    "Bekijk moderne meubels voor woonkamer, eetkamer en slaapkamer. Vergelijk banken, tafels, stoelen en kasten en bestel eenvoudig online."

  return {
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
  }
}

type StorePageSearchParams = Record<string, string | string[] | undefined> & {
  sortBy?: SortOptions
  page?: string
  optionValueIds?: string | string[]
}

type Params = {
  searchParams: Promise<StorePageSearchParams>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)
  const categories = await listCategories()

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
      categories={categories}
    />
  )
}
