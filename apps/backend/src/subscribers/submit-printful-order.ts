import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { createPrintfulOrder } from "../lib/printful";
import { CONVERSION_MODULE } from "../modules/conversion";

export default async function submitPrintfulOrder({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!process.env.PRINTFUL_API_TOKEN) return;

  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const conversion = container.resolve(CONVERSION_MODULE) as any;
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "email",
      "currency_code",
      "shipping_address.*",
      "items.quantity",
      "items.unit_price",
      "items.variant_id",
      "items.metadata",
    ],
    filters: { id: data.id },
  });
  const order = orders?.[0];
  if (!order?.shipping_address) return;

  const variantIds = order.items
    .map((item: any) => item.variant_id)
    .filter(Boolean);
  const mappings = await conversion.listPodVariantMappings({
    variant_id: variantIds,
    active: true,
  });
  const mappingByVariant = new Map(
    mappings.map((mapping: any) => [mapping.variant_id, mapping]),
  );
  const podItems = order.items.flatMap((item: any) => {
    const mapping = mappingByVariant.get(item.variant_id) as any;
    if (!mapping) return [];
    return [
      {
        sync_variant_id: Number(mapping.external_variant_id),
        quantity: item.quantity,
        retail_price: String(item.unit_price),
        files: Array.isArray(item.metadata?.print_files)
          ? item.metadata.print_files
          : undefined,
      },
    ];
  });

  if (!podItems.length) return;

  await createPrintfulOrder({
    external_id: order.id,
    recipient: {
      name: `${order.shipping_address.first_name || ""} ${order.shipping_address.last_name || ""}`.trim(),
      address1: order.shipping_address.address_1,
      address2: order.shipping_address.address_2 || undefined,
      city: order.shipping_address.city,
      state_code: order.shipping_address.province || undefined,
      country_code: order.shipping_address.country_code.toUpperCase(),
      zip: order.shipping_address.postal_code,
      email: order.email,
      phone: order.shipping_address.phone || undefined,
    },
    items: podItems,
  });

  logger.info(`Printful order submitted for Medusa order ${order.id}`);
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
