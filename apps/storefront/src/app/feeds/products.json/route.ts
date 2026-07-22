import { getShoppingFeedItems } from "@lib/shopping-feed"
import { absoluteUrl } from "@lib/seo"

export const revalidate = 3600
export const maxDuration = 60

export async function GET() {
  const items = await getShoppingFeedItems("nl")

  return Response.json(
    {
      generated_at: new Date().toISOString(),
      currency: "EUR",
      country: "NL",
      language: "nl",
      item_count: items.length,
      feeds: {
        google: absoluteUrl("/feeds/google-shopping.xml"),
        meta: absoluteUrl("/feeds/meta-catalog.csv"),
      },
      items,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  )
}
