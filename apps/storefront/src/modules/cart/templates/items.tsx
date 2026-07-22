import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"

import CartLineItem from "../components/cart-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="flex items-end justify-between border-b border-[#dedbe9] pb-6">
        <div>
          <p className="mb-2 text-xs font-black uppercase text-[#666666]">
            Jouw selectie
          </p>
          <Heading className="font-display text-4xl leading-tight">
            Winkelmand
          </Heading>
        </div>
        <span className="text-sm text-ui-fg-subtle">
          {items?.reduce((total, item) => total + item.quantity, 0) ?? 0}{" "}
          artikelen
        </span>
      </div>
      <div className="divide-y divide-[#dedbe9]">
        {items
          ?.sort((a, b) =>
            (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
          )
          .map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              currencyCode={cart!.currency_code}
            />
          ))}
      </div>
    </div>
  )
}

export default ItemsTemplate
