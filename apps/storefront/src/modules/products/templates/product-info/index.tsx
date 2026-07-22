import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { StarSolid } from "@medusajs/icons"
import type { ProductRating } from "../../../../types/conversion"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  rating?: ProductRating
}

const ProductInfo = ({ product, rating }: ProductInfoProps) => {
  return (
    <div id="product-info" className="border-b border-[#dedbe9] pb-6">
      <div className="flex flex-col gap-y-4">
        <a
          href="#reviews"
          className="flex w-fit items-center gap-2 text-xs font-bold hover:underline"
          aria-label={`${rating?.average || 0} van 5 sterren uit ${
            rating?.count || 0
          } reviews`}
        >
          <span className="flex gap-0.5 text-[#15162a]" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <StarSolid
                key={index}
                className={
                  index < Math.round(rating?.average || 0)
                    ? ""
                    : "text-[#d0d0d0]"
                }
              />
            ))}
          </span>
          {rating?.count
            ? `${rating.average} (${rating.count})`
            : "Nog geen reviews"}
        </a>
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-xs font-black uppercase text-[#666666] hover:underline"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <h1
          className="font-display text-4xl leading-[.96] text-[#15162a] small:text-5xl"
          data-testid="product-title"
        >
          {product.title}
        </h1>
        <p
          className="whitespace-pre-line text-sm leading-6 text-[#555555]"
          data-testid="product-description"
        >
          {product.description}
        </p>
        <p className="text-xs text-[#777777]">
          Artikelnummer: {product.variants?.[0]?.sku || product.id}
        </p>
      </div>
    </div>
  )
}

export default ProductInfo
