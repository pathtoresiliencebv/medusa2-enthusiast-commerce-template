import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import {
  addToCartWorkflow,
  updateLineItemInCartWorkflow,
} from "@medusajs/medusa/core-flows";

import { CONVERSION_MODULE } from "../../../../modules/conversion";
import {
  applyPercentageDiscount,
  getQuantityDiscount,
} from "../../../../modules/conversion/utils/pricing";

type AddTieredLineItemBody = {
  cart_id?: string;
  product_id?: string;
  variant_id?: string;
  quantity?: number;
};

type UpdateTieredLineItemBody = AddTieredLineItemBody & {
  line_id?: string;
};

async function getTieredPrice(
  req: MedusaRequest,
  productId: string,
  variantId: string,
  quantity: number,
) {
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const [merchandising] = await service.listProductMerchandisings({
    product_id: productId,
  });
  const tiers =
    (merchandising?.quantity_tiers || []) as Array<{
      quantity: number;
      discount_percentage: number;
    }>;
  const discount = getQuantityDiscount(tiers, quantity);

  const query = req.scope.resolve("query") as any;
  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "product_id", "prices.amount", "prices.currency_code"],
    filters: { id: variantId },
  });
  const variant = variants?.[0];
  const eurPrice = variant?.prices?.find(
    (price: any) => price.currency_code === "eur",
  );

  if (!variant || variant.product_id !== productId || !eurPrice) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Variant en product komen niet overeen of hebben geen EUR-prijs.",
    );
  }

  return {
    discount,
    baseUnitPrice: eurPrice.amount,
    unitPrice: applyPercentageDiscount(eurPrice.amount, discount),
  };
}

export async function POST(
  req: MedusaRequest<AddTieredLineItemBody>,
  res: MedusaResponse,
) {
  const { cart_id, product_id, variant_id, quantity = 1 } = req.body;

  if (!cart_id || !product_id || !variant_id || quantity < 1 || quantity > 10) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Ongeldige product- of hoeveelheidskeuze.",
    );
  }

  const { discount, baseUnitPrice, unitPrice } = await getTieredPrice(
    req,
    product_id,
    variant_id,
    quantity,
  );

  await addToCartWorkflow(req.scope).run({
    input: {
      cart_id,
      items: [
        {
          variant_id,
          quantity,
          unit_price: unitPrice,
          metadata: {
            quantity_discount_percentage: discount,
            base_unit_price: baseUnitPrice,
          },
        },
      ],
    },
  });

  res.status(201).json({
    quantity,
    discount_percentage: discount,
    unit_price: unitPrice,
  });
}

export async function PATCH(
  req: MedusaRequest<UpdateTieredLineItemBody>,
  res: MedusaResponse,
) {
  const { cart_id, line_id, product_id, variant_id, quantity = 1 } = req.body;

  if (
    !cart_id ||
    !line_id ||
    !product_id ||
    !variant_id ||
    quantity < 1 ||
    quantity > 10
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Ongeldige cartregel of hoeveelheidskeuze.",
    );
  }

  const { discount, baseUnitPrice, unitPrice } = await getTieredPrice(
    req,
    product_id,
    variant_id,
    quantity,
  );

  await updateLineItemInCartWorkflow(req.scope).run({
    input: {
      cart_id,
      item_id: line_id,
      update: {
        quantity,
        unit_price: unitPrice,
        metadata: {
          quantity_discount_percentage: discount,
          base_unit_price: baseUnitPrice,
        },
      },
    },
  });

  res.json({
    quantity,
    discount_percentage: discount,
    unit_price: unitPrice,
  });
}
