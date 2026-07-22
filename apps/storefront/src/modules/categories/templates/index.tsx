import { notFound } from "next/navigation"
import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { absoluteUrl, getCategorySeo } from "@lib/seo"
import { BreadcrumbJsonLd } from "@lib/json-ld"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
  categories,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  categories: HttpTypes.StoreProductCategory[]
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const categorySeo = getCategorySeo(category.name, category.handle)

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)
  const orderedParents = [...parents].reverse()
  const children = [...(category.category_children || [])].sort(
    (first, second) => (first.rank ?? 0) - (second.rank ?? 0)
  )

  const categoryFilters = children.length
    ? children
    : category.parent_category
    ? categories
        .filter(
          (item) => item.parent_category?.id === category.parent_category?.id
        )
        .sort((first, second) => (first.rank ?? 0) - (second.rank ?? 0))
    : categories
        .filter((item) => !item.parent_category)
        .sort((first, second) => (first.rank ?? 0) - (second.rank ?? 0))

  return (
    <div className="bg-white">
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: "Home", item: absoluteUrl(`/${countryCode}`) },
          ...orderedParents.map((parent, index) => ({
            position: index + 2,
            name: getCategorySeo(parent.name, parent.handle).label,
            item: absoluteUrl(`/${countryCode}/categories/${parent.handle}`),
          })),
          {
            position: orderedParents.length + 2,
            name: categorySeo.label,
            item: absoluteUrl(`/${countryCode}/categories/${category.handle}`),
          },
        ]}
      />
      <section className="border-b border-[#dedbe9] bg-[#f7f6fb] text-[#15162a]">
        <div className="content-container py-9 small:py-11">
          <div className="mb-4 flex flex-wrap gap-2 text-xs font-black text-[#6554c0]">
            {orderedParents.map((parent) => (
              <LocalizedClientLink
                key={parent.id}
                href={`/categories/${parent.handle}`}
                data-testid="sort-by-link"
                className="hover:underline"
              >
                {parent.name} /
              </LocalizedClientLink>
            ))}
            <span aria-current="page">{categorySeo.label}</span>
          </div>
          <h1
            className="font-display max-w-4xl break-words text-4xl leading-none xsmall:text-5xl small:text-6xl"
            data-testid="category-page-title"
          >
            {categorySeo.label}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#69667a]">
            {category.description || categorySeo.description}
          </p>
        </div>
      </section>

      <div
        className="content-container flex flex-col py-8 small:flex-row small:items-start small:gap-8 small:py-10"
        data-testid="category-container"
      >
        <div className="order-2 w-full small:order-2">
          {children.length > 0 && (
            <div className="mb-8 border-b border-[#dedbe9] pb-6">
              <h2 className="mb-4 text-sm font-black uppercase text-[#15162a]">
                Bekijk subcategorieën
              </h2>
              <div className="grid gap-3 xsmall:grid-cols-2 medium:grid-cols-3">
                {children.map((c) => (
                  <LocalizedClientLink
                    key={c.id}
                    href={`/categories/${c.handle}`}
                    className="rounded-[14px] border border-[#dedbe9] bg-white p-4 text-[#15162a] shadow-sm transition-colors hover:border-[#6554c0]"
                  >
                    <span className="block text-sm font-black">
                      {getCategorySeo(c.name, c.handle).label}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-[#69667a]">
                      {c.description ||
                        getCategorySeo(c.name, c.handle).description}
                    </span>
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
          )}

          <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
              listName={`${categorySeo.label} - pagina ${pageNumber}`}
            />
          </Suspense>
        </div>
        <div className="order-1 w-full small:order-1 small:w-auto">
          <RefinementList
            sortBy={sort}
            data-testid="sort-by-container"
            hideOptionsPicker
            categories={categoryFilters.map((item) => ({
              id: item.id,
              name: getCategorySeo(item.name, item.handle).label,
              handle: item.handle,
            }))}
            activeCategoryHandle={category.handle}
          />
        </div>
      </div>
      {pageNumber === 1 && (
        <CategoryBuyingGuide
          singular={categorySeo.singular}
          plural={categorySeo.label}
          qualifier={categorySeo.qualifier}
        />
      )}
    </div>
  )
}

function CategoryBuyingGuide({
  singular,
  plural,
  qualifier,
}: {
  singular: string
  plural: string
  qualifier: string
}) {
  const pluralLower = plural.toLowerCase()

  return (
    <section className="border-t border-[#dedbe9] bg-[#f7f6fb]">
      <div className="content-container py-14 small:py-20">
        <div className="grid gap-10 medium:grid-cols-[0.8fr_1.2fr] medium:gap-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#6554c0]">
              Keuzehulp
            </p>
            <h2 className="font-display mt-4 text-4xl leading-none small:text-5xl">
              Welke {singular} past bij jouw ruimte?
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#59586b]">
              De beste {singular} is niet alleen mooi, maar klopt ook qua maat,
              gebruik en onderhoud. Vergelijk {pluralLower} daarom op de punten
              die in jouw dagelijks leven echt verschil maken.
            </p>
          </div>

          <div className="grid gap-4 xsmall:grid-cols-3">
            <BuyingPoint
              number="01"
              title="Meet de ruimte"
              body="Noteer breedte, diepte en hoogte en houd voldoende loopruimte vrij. Controleer ook deuren, trappen en de route naar de kamer."
            />
            <BuyingPoint
              number="02"
              title="Denk aan gebruik"
              body={`Bepaal wie het meubel gebruikt en hoe vaak. Zo kies je ${pluralLower} die ${qualifier} zijn én bij jouw huishouden passen.`}
            />
            <BuyingPoint
              number="03"
              title="Vergelijk materiaal"
              body="Kijk naast kleur en uitstraling ook naar onderhoud, belastbaarheid en de combinatie met meubels die al in de ruimte staan."
            />
          </div>
        </div>

        <div className="mt-14 grid gap-10 border-t border-[#dedbe9] pt-12 medium:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl leading-none small:text-4xl">
              {plural} online kopen met duidelijke voorwaarden
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#59586b]">
              Bekijk vóór je bestelt de productmaten, actuele prijs en verwachte
              levertijd. Voorraadartikelen worden doorgaans binnen 3-5 werkdagen
              geleverd. Een gewone retour meld je binnen 30 dagen aan; de
              directe retourkosten zijn dan voor eigen rekening.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LocalizedClientLink href="/levering" className="brand-button">
                Bekijk levering
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/retourneren"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#15162a] px-6 text-xs font-black uppercase"
              >
                Lees retourvoorwaarden
              </LocalizedClientLink>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl leading-none small:text-4xl">
              Veelgestelde vragen over {pluralLower}
            </h2>
            <div className="mt-5 divide-y divide-[#dedbe9] border-y border-[#dedbe9]">
              <Question
                title={`Hoe kies ik de juiste maat ${singular}?`}
                body="Meet de beschikbare plek en vergelijk die met de buitenmaten op de productpagina. Houd rekening met loopruimte, plinten en draaiende deuren."
              />
              <Question
                title={`Waar vergelijk ik ${pluralLower} op?`}
                body="Vergelijk formaat, materiaal, onderhoud, dagelijks gebruik en levertijd. Kies pas daarna op kleur en vorm, zodat het meubel ook praktisch blijft."
              />
              <Question
                title="Kan ik hulp krijgen bij mijn keuze?"
                body="Ja. Stuur de gewenste afmetingen, een foto van de ruimte en je vragen naar onze klantenservice voor gericht maat- of materiaaladvies."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BuyingPoint({
  number,
  title,
  body,
}: {
  number: string
  title: string
  body: string
}) {
  return (
    <article className="rounded-[16px] border border-[#dedbe9] bg-white p-5">
      <p className="text-xs font-black text-[#6554c0]">{number}</p>
      <h3 className="mt-4 text-base font-black">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#59586b]">{body}</p>
    </article>
  )
}

function Question({ title, body }: { title: string; body: string }) {
  return (
    <article className="py-5">
      <h3 className="text-sm font-black text-[#15162a]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#59586b]">{body}</p>
    </article>
  )
}
