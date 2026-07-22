import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { CONVERSION_MODULE } from "../../../../modules/conversion";

const gpcByCategory: Record<string, string> = {
  chairs: "443", sofas: "460", tables: "4355", storage: "6356",
  "coffee-tables": "1395", "side-tables": "1549", "console-tables": "1602",
  sideboards: "447", "living-room-furniture": "436", "accent-furniture": "436",
  "dining-room-furniture": "6347", "bedroom-furniture": "6346",
  "home-office-furniture": "6362", "entryway-furniture": "436",
  "bathroom-furniture": "2081", "bathroom-furniture-sets": "500000",
  "kitchen-furniture": "6934", "kitchen-tools-gadgets": "638",
  "kids-furniture": "436", "furniture-replacement-parts": "436",
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const [profiles, merchantIssues] = await Promise.all([
    service.listSourcingProfiles({ owner_approved: true, shopping_status: "approved" }, { take: 10000 }),
    service.listMerchantIssues({ resolved_at: null }, { take: 10000 }),
  ]);
  const now = Date.now();
  const approved = profiles.filter((profile: any) => {
    const checked = profile.source_checked_at ? new Date(profile.source_checked_at).getTime() : 0;
    return profile.image_verified && profile.source_availability && checked && now - checked <= 86_400_000 &&
      Number(profile.purchase_price || 0) <= 5000 && !profile.quarantine_reason;
  });
  const query = req.scope.resolve("query") as any;
  const { data: products } = approved.length ? await query.graph({
    entity: "product",
    fields: ["id", "status", "metadata", "categories.handle", "variants.id"],
    filters: { id: approved.map((profile: any) => profile.product_id) },
  }) : { data: [] };
  const productById = new Map(products.map((product: any) => [product.id, product]));
  const blockedProducts = new Set(merchantIssues.filter((issue: any) => issue.severity !== "warning").map((issue: any) => issue.product_id).filter(Boolean));
  const blockedVariants = new Set(merchantIssues.filter((issue: any) => issue.severity !== "warning").map((issue: any) => issue.feed_item_id));
  const items = approved.flatMap((profile: any) => {
    const product: any = productById.get(profile.product_id);
    const category = product?.categories?.[0]?.handle;
    const retailPrice = Number(product?.metadata?.suggested_retail_price_eur || 0);
    const variantBlocked = product?.variants?.some((variant: any) => blockedVariants.has(variant.id));
    if (!product || product.status !== "published" || !gpcByCategory[category] || !retailPrice || retailPrice > 10_000 || blockedProducts.has(product.id) || variantBlocked) return [];
    return [{ product_id: profile.product_id, brand: profile.public_brand || undefined, mpn: profile.public_mpn || undefined, google_product_category: gpcByCategory[category] }];
  });
  res.json({ products: items, generated_at: new Date().toISOString() });
}
