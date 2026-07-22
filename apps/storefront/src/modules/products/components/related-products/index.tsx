import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { sanitizeProductForClient } from "@lib/util/sanitize-product"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = { limit: 4 }
  if (region?.id) {
    queryParams.region_id = region.id
  }
  const categoryId = product.categories?.[0]?.id
  if (categoryId) {
    queryParams.category_id = [categoryId]
  } else if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  } else if (product.tags?.length) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
    cache: "no-store",
  }).then(({ response }) => {
    return response.products
      .filter((responseProduct) => responseProduct.id !== product.id)
      .slice(0, 4)
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="mb-8 flex flex-col">
        <span className="mb-3 text-xs font-black uppercase text-[#666666]">
          Slim combineren
        </span>
        <p className="font-display max-w-2xl text-4xl leading-none text-[#15162a] small:text-5xl">
          Past bij dit product
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-x-2 gap-y-8 small:grid-cols-3 medium:grid-cols-4 medium:gap-x-4">
        {products.map((product) => (
          <li key={product.id}>
            <Product
              region={region}
              product={sanitizeProductForClient(product)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
