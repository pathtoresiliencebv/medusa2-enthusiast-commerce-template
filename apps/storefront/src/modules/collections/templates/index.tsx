import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { BreadcrumbJsonLd } from "@lib/json-ld"
import { absoluteUrl } from "@lib/seo"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
  categories,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  categories: HttpTypes.StoreProductCategory[]
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="content-container flex flex-col py-6 small:flex-row small:items-start">
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: "Home", item: absoluteUrl(`/${countryCode}`) },
          {
            position: 2,
            name: "Collectie",
            item: absoluteUrl(`/${countryCode}/store`),
          },
          {
            position: 3,
            name: collection.title,
            item: absoluteUrl(
              `/${countryCode}/collections/${collection.handle}`
            ),
          },
        ]}
      />
      <RefinementList
        sortBy={sort}
        hideOptionsPicker
        categories={categories
          .filter((item) => !item.parent_category)
          .map((item) => ({
            id: item.id,
            name: item.name,
            handle: item.handle,
          }))}
      />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1>{collection.title}</h1>
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            listName={`${collection.title} - pagina ${pageNumber}`}
          />
        </Suspense>
      </div>
    </div>
  )
}
