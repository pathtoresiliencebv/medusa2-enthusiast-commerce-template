import { model } from "@medusajs/framework/utils";

const Review = model.define("conversion_review", {
  id: model.id().primaryKey(),
  product_id: model.text().index(),
  customer_id: model.text().index().nullable(),
  order_id: model.text().nullable(),
  author_name: model.text(),
  title: model.text().nullable(),
  body: model.text(),
  rating: model.number(),
  status: model.enum(["pending", "published", "rejected"]).default("pending"),
  verified_purchase: model.boolean().default(false),
  helpful_count: model.number().default(0),
  media: model.json().nullable(),
  source: model.text().default("native"),
  source_review_id: model.text().nullable(),
  source_created_at: model.dateTime().nullable(),
  source_url: model.text().nullable(),
  source_language: model.text().nullable(),
});

export default Review;
