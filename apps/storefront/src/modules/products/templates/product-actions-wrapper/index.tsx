import { listProducts } from "@lib/data/products"
import { sanitizeProductForClient } from "@lib/util/sanitize-product"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import type { ProductConversion } from "../../../../types/conversion"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
  conversion,
}: {
  id: string
  region: HttpTypes.StoreRegion
  conversion: ProductConversion | null
}) {
  const product = await listProducts({
    queryParams: { id: [id] },
    regionId: region.id,
    cache: "no-store",
  }).then(({ response }) => response.products[0])

  if (!product) {
    return null
  }

  return (
    <ProductActions
      product={sanitizeProductForClient(product)}
      region={region}
      conversion={conversion}
    />
  )
}
