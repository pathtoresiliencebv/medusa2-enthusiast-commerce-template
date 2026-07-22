"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ payment_providers }) => {
      const priority = [
        "pp_stripe-ideal_stripe",
        "pp_stripe-bancontact_stripe",
        "pp_stripe_stripe",
        "pp_paypal_paypal",
        "pp_system_default",
      ]
      return payment_providers.sort(
        (a, b) => priority.indexOf(a.id) - priority.indexOf(b.id)
      )
    })
    .catch(() => {
      return null
    })
}
