import { escapeCsv, getShoppingFeedItems } from "@lib/shopping-feed"

export const revalidate = 3600
export const maxDuration = 60

export async function GET() {
  const items = await getShoppingFeedItems("nl")
  const columns = [
    "id",
    "item_group_id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "sale_price",
    "link",
    "image_link",
    "additional_image_link",
    "brand",
    "gtin",
    "mpn",
    "google_product_category",
    "product_type",
    "color",
    "size",
    "material",
    "inventory",
    "custom_label_0",
    "custom_label_1",
  ]
  const rows = items.map((item) => {
    const standardPrice = item.originalPrice || item.price
    const values = [
      item.id,
      item.itemGroupId,
      item.title,
      item.description,
      item.availability,
      item.condition,
      `${standardPrice.toFixed(2)} ${item.currency}`,
      item.originalPrice ? `${item.price.toFixed(2)} ${item.currency}` : "",
      item.link,
      item.imageLink,
      item.additionalImageLinks.join(","),
      item.brand,
      item.gtin,
      item.mpn,
      item.googleProductCategory,
      item.productType,
      item.color,
      item.size,
      item.material,
      item.inventory,
      item.customLabel0,
      item.customLabel1,
    ]

    return values.map((value) => escapeCsv(value)).join(",")
  })

  return new Response([columns.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="lvro-nl-meta-catalog.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
