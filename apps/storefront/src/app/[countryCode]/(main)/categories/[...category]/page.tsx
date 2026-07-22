import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { absoluteUrl, getCategorySeo, listingSeoState, siteSeo } from "@lib/seo"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      sortBy?: SortOptions
      page?: string
      optionValueIds?: string | string[]
    }
  >
}

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()

    if (!product_categories) {
      return []
    }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map(
    (category: HttpTypes.StoreProductCategory) => category.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: string) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

    return staticParams
  } catch {
    // A fresh Railway template can build before Medusa finishes its first boot.
    // Categories remain available dynamically after the backend is online.
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const searchParams = await props.searchParams
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const seo = getCategorySeo(productCategory.name, productCategory.handle)
    const title = seo.title
    const description = productCategory.description ?? seo.description
    const listingSeo = listingSeoState(
      params.countryCode,
      `/categories/${params.category.join("/")}`,
      searchParams
    )
    const canonical = listingSeo.alternates.canonical
    const pageSuffix = listingSeo.page > 1 ? ` - Pagina ${listingSeo.page}` : ""

    return {
      title: `${title}${pageSuffix}`,
      description,
      alternates: listingSeo.alternates,
      robots: listingSeo.robots,
      openGraph: {
        title: `${title}${pageSuffix} | ${siteSeo.name}`,
        description,
        url: canonical,
        siteName: siteSeo.name,
      },
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const [productCategory, categories] = await Promise.all([
    getCategoryByHandle(params.category),
    listCategories(),
  ])

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
      categories={categories}
    />
  )
}
