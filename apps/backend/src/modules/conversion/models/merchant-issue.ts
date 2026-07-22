import { model } from "@medusajs/framework/utils";

const MerchantIssue = model.define("merchant_issue", {
  id: model.id().primaryKey(),
  feed_item_id: model.text().index(),
  product_id: model.text().index().nullable(),
  code: model.text(),
  severity: model.enum(["warning", "error", "disapproved"]),
  title: model.text(),
  detail: model.text().nullable(),
  country: model.text().nullable(),
  last_seen_at: model.dateTime(),
  resolved_at: model.dateTime().nullable(),
  source: model.text().default("merchant_center_csv"),
});

export default MerchantIssue;
