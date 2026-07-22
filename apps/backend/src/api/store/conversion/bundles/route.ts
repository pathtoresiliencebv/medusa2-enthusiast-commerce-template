import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";

import { CONVERSION_MODULE } from "../../../../modules/conversion";

type AddBundleBody = {
  cart_id?: string;
  handle?: string;
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const bundles = await service.listBundles({ active: true });
  res.json({ bundles });
}

export async function POST(
  req: MedusaRequest<AddBundleBody>,
  res: MedusaResponse,
) {
  const { cart_id, handle } = req.body;

  if (!cart_id || !handle) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Winkelmand en bundel zijn verplicht.",
    );
  }

  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const [bundle] = await service.listBundles({ handle, active: true });

  if (!bundle) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Bundel niet gevonden.");
  }

  const bundleItems = bundle.items as Array<{
    variant_id: string;
    quantity: number;
  }>;
  const query = req.scope.resolve("query") as any;
  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "prices.amount", "prices.currency_code"],
    filters: { id: bundleItems.map((item) => item.variant_id) },
  });
  const variantMap = new Map(
    variants.map((variant: any) => [variant.id, variant]),
  );

  const items = bundleItems.map((item) => {
    const variant = variantMap.get(item.variant_id) as any;
    const eurPrice = variant?.prices?.find(
      (price: any) => price.currency_code === "eur",
    );
    const discountedPrice = eurPrice
      ? Math.round(
          eurPrice.amount * (1 - Number(bundle.discount_percentage || 0) / 100),
        )
      : undefined;

    return {
      variant_id: item.variant_id,
      quantity: item.quantity,
      ...(discountedPrice !== undefined ? { unit_price: discountedPrice } : {}),
      metadata: {
        bundle_id: bundle.id,
        bundle_handle: bundle.handle,
        bundle_discount_percentage: bundle.discount_percentage,
      },
    };
  });

  await addToCartWorkflow(req.scope).run({
    input: { cart_id, items },
  });

  res.status(201).json({ bundle_id: bundle.id, items_added: items.length });
}
