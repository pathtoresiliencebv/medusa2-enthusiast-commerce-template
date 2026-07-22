const PRINTFUL_API_URL = "https://api.printful.com";

type PrintfulOrderInput = {
  external_id: string;
  recipient: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code?: string;
    country_code: string;
    zip: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    sync_variant_id: number;
    quantity: number;
    retail_price?: string;
    files?: Array<{ type: string; url: string }>;
  }>;
};

export async function createPrintfulOrder(input: PrintfulOrderInput) {
  const token = process.env.PRINTFUL_API_TOKEN;
  if (!token) return { skipped: true, reason: "PRINTFUL_API_TOKEN ontbreekt" };

  const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(process.env.PRINTFUL_STORE_ID
        ? { "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID }
        : {}),
    },
    body: JSON.stringify({ ...input, confirm: true }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `Printful order mislukt (${response.status}): ${JSON.stringify(payload)}`,
    );
  }

  return payload;
}
