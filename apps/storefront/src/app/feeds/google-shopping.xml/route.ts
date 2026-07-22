import { getShoppingFeedItems, shoppingFeedXml } from "@lib/shopping-feed"

export const revalidate = 3600
export const maxDuration = 60

export async function GET() {
  const mode = process.env.SHOPPING_CORE_FEED_LIVE === "true" ? "core" : "full"
  const items = await getShoppingFeedItems("nl", mode)
  return new Response(shoppingFeedXml(items), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-LVRO-Feed-Mode": mode,
    },
  })
}
