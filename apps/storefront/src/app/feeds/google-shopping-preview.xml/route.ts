import { getShoppingFeedItems, shoppingFeedXml } from "@lib/shopping-feed"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: Request) {
  const expected = process.env.SHOPPING_FEED_PREVIEW_TOKEN
  const provided = new URL(request.url).searchParams.get("token")
  if (!expected || provided !== expected) {
    return new Response("Niet geautoriseerd", { status: 401 })
  }
  const items = await getShoppingFeedItems("nl", "core")
  return new Response(shoppingFeedXml(items), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-LVRO-Feed-Mode": "core-preview",
    },
  })
}
