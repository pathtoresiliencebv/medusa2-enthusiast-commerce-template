import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { CONVERSION_MODULE } from "../../../../modules/conversion";

type ModerateReviewBody = {
  id?: string;
  status?: "pending" | "published" | "rejected";
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const reviews = await service.listReviews(
    {},
    { order: { created_at: "DESC" } },
  );
  res.json({ reviews });
}

export async function POST(
  req: MedusaRequest<ModerateReviewBody>,
  res: MedusaResponse,
) {
  const { id, status } = req.body;
  if (
    !id ||
    !status ||
    !["pending", "published", "rejected"].includes(status)
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Review en geldige status zijn verplicht.",
    );
  }

  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const review = await service.updateReviews({ id, status });
  res.json({ review });
}
