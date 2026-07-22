import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { CONVERSION_MODULE } from "../../../../modules/conversion";

type CreateReviewBody = {
  product_id?: string;
  order_id?: string;
  author_name?: string;
  title?: string;
  body?: string;
  rating?: number;
  media?: string[];
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const productId = req.query.product_id as string | undefined;

  const reviews = await service.listReviews({
    ...(productId ? { product_id: productId } : {}),
    status: "published",
  });

  res.json({ reviews });
}

export async function POST(
  req: MedusaRequest<CreateReviewBody>,
  res: MedusaResponse,
) {
  const actorId = (req as any).auth_context?.actor_id;

  if (!actorId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Log in om een verified review te schrijven.",
    );
  }

  const { product_id, order_id, author_name, title, body, rating, media } =
    req.body;

  if (
    !product_id ||
    !order_id ||
    !author_name?.trim() ||
    !body?.trim() ||
    !rating ||
    rating < 1 ||
    rating > 5
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Product, bestelling, naam, beoordeling en reviewtekst zijn verplicht.",
    );
  }

  const query = req.scope.resolve("query") as any;
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "items.product_id"],
    filters: { id: order_id },
  });
  const order = orders?.[0];
  const verified =
    order?.customer_id === actorId &&
    order?.items?.some((item: any) => item.product_id === product_id);

  if (!verified) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Deze aankoop kon niet worden geverifieerd.",
    );
  }

  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const review = await service.createReviews({
    product_id,
    customer_id: actorId,
    order_id,
    author_name: author_name.trim(),
    title: title?.trim() || null,
    body: body.trim(),
    rating,
    status: "pending",
    verified_purchase: true,
    helpful_count: 0,
    media: media || null,
    source: "native",
  });

  res.status(201).json({ review });
}
