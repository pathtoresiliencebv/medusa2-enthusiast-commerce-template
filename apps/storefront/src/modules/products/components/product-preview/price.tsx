import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <span
          className="mr-2 text-xs text-[#817d91] line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className="whitespace-nowrap text-base font-black text-[#6554c0]"
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </>
  )
}
