import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"
import { HttpTypes } from "@medusajs/types"
import { BreadcrumbJsonLd } from "@lib/json-ld"
import { absoluteUrl } from "@lib/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
  categories,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  categories: HttpTypes.StoreProductCategory[]
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="bg-white">
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: "Home", item: absoluteUrl(`/${countryCode}`) },
          {
            position: 2,
            name: "Meubels",
            item: absoluteUrl(`/${countryCode}/store`),
          },
        ]}
      />
      <section className="border-b border-[#dedbe9] bg-[#f7f6fb] text-[#15162a]">
        <div className="content-container grid gap-6 py-9 medium:grid-cols-[1.25fr_0.75fr] medium:items-end medium:py-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6554c0]">
              Shop alles
            </p>
            <h1
              className="font-display mt-3 max-w-4xl text-5xl leading-[.95] small:text-6xl"
              data-testid="store-page-title"
            >
              De volledige collectie
            </h1>
          </div>
          <div className="grid gap-4 text-sm leading-6 text-[#69667a]">
            <p>
              Banken, tafels, stoelen en opbergers voor een interieur dat sterk
              oogt en goed leeft.
            </p>
          </div>
        </div>
      </section>

      <div
        className="content-container flex flex-col py-8 small:flex-row small:items-start small:gap-8 small:py-10"
        data-testid="category-container"
      >
        <div className="order-2 w-full small:order-2">
          <div className="mb-7 flex items-end justify-between gap-3 border-b border-[#dedbe9] pb-5">
            <div>
              <p className="text-xs font-black uppercase text-[#666666]">
                Alle producten
              </p>
              <h2 className="font-display mt-2 text-3xl text-[#15162a]">
                Shop meubels
              </h2>
            </div>
          </div>
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
              listName={`Alle meubels - pagina ${pageNumber}`}
            />
          </Suspense>
        </div>
        <div className="order-1 w-full small:order-1 small:w-auto">
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
        </div>
      </div>
      {pageNumber === 1 && (
        <section className="border-t border-[#dedbe9] bg-[#f7f6fb]">
          <div className="content-container grid gap-10 py-14 small:py-20 medium:grid-cols-[.8fr_1.2fr] medium:gap-20">
            <div>
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#6554c0]">
                Meubels kiezen
              </p>
              <h2 className="font-display mt-4 text-4xl leading-none small:text-5xl">
                Begin bij de ruimte, niet alleen bij de stijl
              </h2>
            </div>
            <div className="grid gap-5 text-sm leading-7 text-[#59586b]">
              <p>
                Meet eerst de beschikbare plek en de route naar de kamer. Denk
                daarna aan dagelijks gebruik, onderhoud en materiaal. Zo kies je
                een meubel dat niet alleen goed oogt, maar ook praktisch blijft.
              </p>
              <div className="flex flex-wrap gap-3">
                <LocalizedClientLink
                  href="/categories/living-room-furniture"
                  className="brand-button"
                >
                  Woonkamermeubels
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/categories/dining-room-furniture"
                  className="inline-flex min-h-12 items-center rounded-full border border-[#15162a] px-6 text-xs font-black uppercase"
                >
                  Eetkamermeubels
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/service"
                  className="inline-flex min-h-12 items-center rounded-full border border-[#15162a] px-6 text-xs font-black uppercase"
                >
                  Keuzeadvies
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default StoreTemplate
