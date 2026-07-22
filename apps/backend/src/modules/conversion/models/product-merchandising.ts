import { model } from "@medusajs/framework/utils";

const ProductMerchandising = model.define("product_merchandising", {
  id: model.id().primaryKey(),
  product_id: model.text().unique(),
  swatches: model.json().nullable(),
  quantity_tiers: model.json().nullable(),
  delivery_label: model.text().default("Levering binnen 3-5 werkdagen"),
  financing_label: model.text().nullable(),
  trust_badges: model.json().nullable(),
  recommendation_ids: model.json().nullable(),
  downsell_product_id: model.text().nullable(),
  updated_by: model.text().nullable(),
});

export default ProductMerchandising;
