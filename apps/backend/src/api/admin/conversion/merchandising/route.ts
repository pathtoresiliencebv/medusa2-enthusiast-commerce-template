import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { CONVERSION_MODULE } from "../../../../modules/conversion";

type UpsertMerchandisingBody = {
  product_id?: string;
  swatches?: Record<string, string>;
  quantity_tiers?: Array<{
    quantity: number;
    discount_percentage: number;
    label: string;
  }>;
  delivery_label?: string;
  financing_label?: string;
  trust_badges?: string[];
  recommendation_ids?: string[];
  downsell_product_id?: string | null;
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const records = await service.listProductMerchandisings({});
  res.json({ merchandising: records });
}

export async function POST(
  req: MedusaRequest<UpsertMerchandisingBody>,
  res: MedusaResponse,
) {
  const { product_id, ...data } = req.body;
  if (!product_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Product is verplicht.",
    );
  }

  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const [existing] = await service.listProductMerchandisings({ product_id });
  const merchandising = existing
    ? await service.updateProductMerchandisings({ id: existing.id, ...data })
    : await service.createProductMerchandisings({ product_id, ...data });

  res.json({ merchandising });
}
