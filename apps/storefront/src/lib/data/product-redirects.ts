"use server"

import { sdk } from "@lib/config"

export async function resolveProductRedirect(handle: string) {
  return sdk.client
    .fetch<{ handle: string }>(
      `/store/catalog/redirects/${encodeURIComponent(handle)}`,
      { method: "GET", cache: "no-store" }
    )
    .then((result) => result.handle)
    .catch(() => null)
}
