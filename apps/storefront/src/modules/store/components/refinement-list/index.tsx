"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

import {
  OPTION_VALUE_QUERY_KEY,
  parseOptionValueIds,
} from "@lib/util/product-option-filters"
import OptionsPicker from "./options-picker"
import SortProducts, { SortOptions } from "./sort-products"
import { BarsArrowDown, XMark } from "@medusajs/icons"
import { useState } from "react"
import clsx from "clsx"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CategoryFilter = {
  id: string
  name: string
  handle: string
}

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  hideOptionsPicker?: boolean
  categories?: CategoryFilter[]
  activeCategoryHandle?: string
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  hideOptionsPicker = false,
  categories = [],
  activeCategoryHandle,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const updateQueryParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)

      params.delete("page")

      const queryString = params.toString()
      const currentQuery = searchParams.toString()
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname
      const currentPath = currentQuery
        ? `${pathname}?${currentQuery}`
        : pathname

      if (nextPath !== currentPath) {
        router.push(nextPath)
      }
    },
    [pathname, router, searchParams]
  )

  const setQueryParams = (name: string, value: string) =>
    updateQueryParams((params) => params.set(name, value))

  const selectedOptionValueIds = useMemo(
    () => parseOptionValueIds(searchParams),
    [searchParams]
  )

  const setOptionValueIds = (valueIds: string[]) =>
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      valueIds.forEach((valueId) =>
        params.append(OPTION_VALUE_QUERY_KEY, valueId)
      )
    })

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        className="focus-brand mb-7 flex min-h-12 w-full items-center justify-between rounded-full border border-[#6554c0] bg-white px-5 text-xs font-black uppercase text-[#6554c0] small:hidden"
        aria-expanded={mobileOpen}
      >
        <span className="flex items-center gap-2">
          <BarsArrowDown /> Categorieën en sorteren
        </span>
        {mobileOpen ? <XMark /> : <span>{selectedOptionValueIds.length}</span>}
      </button>
      <div
        className={clsx(
          "mb-8 flex-col gap-8 rounded-[18px] border border-[#dedbe9] bg-[#f7f6fb] p-5 shadow-[0_8px_30px_rgba(42,35,82,0.05)] small:mb-0 small:flex small:min-w-[250px] small:max-w-[270px] small:sticky small:top-36",
          mobileOpen ? "flex" : "hidden"
        )}
      >
        {!!categories.length && (
          <nav aria-label="Filter op categorie">
            <p className="mb-3 px-1 text-xs font-black uppercase tracking-[0.12em] text-[#666666]">
              Categorieën
            </p>
            <div className="grid gap-2">
              {categories.map((category) => {
                const active = category.handle === activeCategoryHandle

                return (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex min-h-11 items-center justify-between rounded-full border px-4 text-sm font-bold transition-colors",
                      active
                        ? "border-[#6554c0] bg-[#6554c0] text-white"
                        : "border-[#dedbe9] bg-white text-[#15162a] hover:border-[#6554c0] hover:text-[#6554c0]"
                    )}
                  >
                    <span>{category.name}</span>
                    <span aria-hidden="true">→</span>
                  </LocalizedClientLink>
                )
              })}
            </div>
          </nav>
        )}
        <SortProducts
          sortBy={sortBy}
          setQueryParams={setQueryParams}
          data-testid={dataTestId}
        />
        {!hideOptionsPicker && (
          <OptionsPicker
            selectedValueIds={selectedOptionValueIds}
            setOptionValueIds={setOptionValueIds}
          />
        )}
        {!!selectedOptionValueIds.length && (
          <button
            type="button"
            onClick={() => setOptionValueIds([])}
            className="min-h-11 rounded-full border border-[#6554c0] px-4 text-xs font-black uppercase text-[#6554c0] hover:bg-[#6554c0] hover:text-white"
          >
            Wis filters
          </button>
        )}
      </div>
    </>
  )
}

export default RefinementList
