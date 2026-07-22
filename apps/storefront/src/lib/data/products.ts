"use server"

import { sdk } from "@lib/config"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  cache = "no-store",
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
  cache?: RequestCache
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,",
          ...queryParams,
        },
        headers,
        next,
        cache,
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )
  const filteredQuery = {
    ...queryParams,
    ...(optionFilters.length ? { option_value_id: optionFilters } : {}),
  }

  if (sortBy === "created_at") {
    return listProducts({
      pageParam: Math.max(page, 1),
      queryParams: {
        ...filteredQuery,
        limit,
        order: "-created_at",
      },
      countryCode,
      cache: "no-store",
    })
  }

  const fetchLimit = 100
  const firstPage = await listProducts({
    pageParam: 1,
    queryParams: {
      ...filteredQuery,
      limit: fetchLimit,
    },
    countryCode,
    cache: "no-store",
  })
  const products = [...firstPage.response.products]
  const totalPages = Math.ceil(firstPage.response.count / fetchLimit)

  for (let startPage = 2; startPage <= totalPages; startPage += 5) {
    const pageNumbers = Array.from(
      { length: Math.min(5, totalPages - startPage + 1) },
      (_, index) => startPage + index
    )
    const pages = await Promise.all(
      pageNumbers.map((pageParam) =>
        listProducts({
          pageParam,
          queryParams: { ...filteredQuery, limit: fetchLimit },
          countryCode,
          cache: "no-store",
        })
      )
    )

    products.push(...pages.flatMap((result) => result.response.products))
  }

  const sortedProducts = sortProducts(products, sortBy)
  const offset = (Math.max(page, 1) - 1) * limit
  const filteredCount = firstPage.response.count
  const nextPage = filteredCount > offset + limit ? page + 1 : null
  const paginatedProducts = sortedProducts.slice(offset, offset + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}
