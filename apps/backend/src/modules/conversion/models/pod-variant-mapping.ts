import { model } from "@medusajs/framework/utils";

const PodVariantMapping = model.define("pod_variant_mapping", {
  id: model.id().primaryKey(),
  variant_id: model.text().unique(),
  provider: model.text().default("printful"),
  external_variant_id: model.text(),
  personalization_schema: model.json().nullable(),
  active: model.boolean().default(true),
});

export default PodVariantMapping;
