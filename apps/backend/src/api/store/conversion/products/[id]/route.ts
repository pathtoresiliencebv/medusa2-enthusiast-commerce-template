import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { CONVERSION_MODULE } from "../../../../../modules/conversion";

const defaultTiers = [
  { quantity: 1, discount_percentage: 0, label: "1 stuk" },
  { quantity: 2, discount_percentage: 5, label: "2 stuks - 5% voordeel" },
  { quantity: 4, discount_percentage: 10, label: "4 stuks - 10% voordeel" },
];

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const productId = req.params.id;

  const [merchandising] = await service.listProductMerchandisings({
    product_id: productId,
  });
  const reviews = await service.listReviews({
    product_id: productId,
    status: "published",
  });
  const bundles = await service.listBundles({
    hero_product_id: productId,
    active: true,
  });

  const rating = reviews.length
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
      reviews.length
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: reviews.filter((review: any) => review.rating === score).length,
  }));

  res.json({
    merchandising: merchandising || {
      product_id: productId,
      swatches: {},
      quantity_tiers: defaultTiers,
      delivery_label: "Levering binnen 3-5 werkdagen",
      financing_label: "Betaal veilig met iDEAL of kaart",
      trust_badges: ["30 dagen retour", "5 jaar garantie"],
      recommendation_ids: [],
    },
    rating: {
      average: Number(rating.toFixed(1)),
      count: reviews.length,
      distribution,
    },
    reviews,
    bundles,
  });
}
