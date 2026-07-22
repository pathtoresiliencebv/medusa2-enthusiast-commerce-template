import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import Image from "next/image"
import WishlistButton from "@modules/wishlist/components/wishlist-button"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  const secondaryImage = product.images?.find(
    (image) => image.url && image.url !== product.thumbnail
  )?.url
  const badge =
    typeof product.metadata?.badge === "string"
      ? product.metadata.badge
      : undefined

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-[#dedbe9] bg-white shadow-[0_8px_30px_rgba(42,35,82,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#c8c3dd] hover:shadow-[0_16px_42px_rgba(42,35,82,0.12)]"
      data-testid="product-wrapper"
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="flex h-full flex-col"
      >
        <div className="relative overflow-hidden bg-[#f7f6fb]">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="square"
            isFeatured={isFeatured}
            className="rounded-none bg-[#f7f6fb] p-0 shadow-none group-hover:shadow-none"
            alt={product.title}
          />
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.title} in een andere opstelling`}
              fill
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
          {badge && (
            <span className="absolute left-2 top-2 rounded-full bg-[#ff6b6b] px-2.5 py-1 text-[10px] font-black uppercase text-[#15162a] shadow-sm">
              {badge}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col px-3 pb-4 pt-3">
          <h3
            className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-[#15162a]"
            data-testid="product-title"
            title={product.title}
          >
            {product.title}
          </h3>
          <div className="mt-2 min-h-5 text-sm font-bold">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </LocalizedClientLink>
      <WishlistButton
        item={{
          id: product.id,
          handle: product.handle || product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          price: cheapestPrice?.calculated_price,
        }}
        className="absolute right-2 top-2 z-10"
      />
    </article>
  )
}
