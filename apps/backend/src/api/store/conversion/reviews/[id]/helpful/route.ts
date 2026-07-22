import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { CONVERSION_MODULE } from "../../../../../../modules/conversion";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const review = await service.retrieveReview(req.params.id).catch(() => null);

  if (!review || review.status !== "published") {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Review niet gevonden.");
  }

  const updated = await service.updateReviews({
    id: review.id,
    helpful_count: review.helpful_count + 1,
  });

  res.json({ review: updated });
}
