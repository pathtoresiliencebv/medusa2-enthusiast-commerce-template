import { model } from "@medusajs/framework/utils";

const Bundle = model.define("conversion_bundle", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  title: model.text(),
  description: model.text().nullable(),
  hero_product_id: model.text().index(),
  items: model.json(),
  discount_percentage: model.number().default(0),
  active: model.boolean().default(true),
});

export default Bundle;
