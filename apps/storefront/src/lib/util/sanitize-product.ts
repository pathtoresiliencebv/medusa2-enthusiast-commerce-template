import { HttpTypes } from "@medusajs/types"

const publicMetadataKeys = new Set([
  "badge",
  "material",
  "dimensions",
  "seo_title",
  "seo_description",
  "seo_keywords",
  "canonical_handle",
  "search_tags",
  "launch_sale",
  "launch_sale_label",
  "launch_sale_discount_percent",
  "compare_at_price_eur",
])

export function sanitizeProductMetadata(
  metadata: HttpTypes.StoreProduct["metadata"]
) {
  if (!metadata) {
    return metadata
  }

  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => publicMetadataKeys.has(key))
  )
}

export function sanitizeProductForClient(product: HttpTypes.StoreProduct) {
  return {
    ...product,
    metadata: sanitizeProductMetadata(product.metadata),
    variants:
      product.variants?.map((variant) => ({
        ...variant,
        metadata: sanitizeProductMetadata(variant.metadata),
      })) ?? null,
  } satisfies HttpTypes.StoreProduct
}
