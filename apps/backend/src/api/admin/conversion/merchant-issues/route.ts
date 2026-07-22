import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { CONVERSION_MODULE } from "../../../../modules/conversion";
import { requireSourcingOwner } from "../_owner";

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"' && quoted && input[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ""; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(cell); cell = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = (rows.shift() || []).map((value) => value.trim().toLowerCase());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ""])));
}

const pick = (row: Record<string, string>, names: string[]) => {
  for (const name of names) if (row[name]) return row[name];
  return "";
};

export async function POST(req: AuthenticatedMedusaRequest<{ csv?: string }>, res: MedusaResponse) {
  await requireSourcingOwner(req);
  const csv = req.body.csv;
  if (!csv?.trim()) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Upload een Merchant Center CSV-export.");
  const rows = parseCsv(csv);
  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const query = req.scope.resolve("query") as any;
  const now = new Date();
  const feedItemIds = rows.map((row) => pick(row, ["item id", "item_id", "id", "offer id", "offer_id"])).filter(Boolean);
  const { data: variants } = feedItemIds.length ? await query.graph({
    entity: "product_variant", fields: ["id", "product_id"], filters: { id: feedItemIds },
  }) : { data: [] };
  const productByVariant = new Map(variants.map((variant: any) => [variant.id, variant.product_id]));
  const previous = await service.listMerchantIssues({ resolved_at: null }, { take: 10000 });
  for (const issue of previous) {
    await service.updateMerchantIssues({ id: issue.id, resolved_at: now });
  }
  const imported: any[] = [];
  for (const row of rows) {
    const feedItemId = pick(row, ["item id", "item_id", "id", "offer id", "offer_id"]);
    if (!feedItemId) continue;
    const rawSeverity = pick(row, ["severity", "ernst", "status"]).toLowerCase();
    const severity = rawSeverity.includes("disappro") || rawSeverity.includes("afgekeurd")
      ? "disapproved" : rawSeverity.includes("warn") || rawSeverity.includes("waarsch") ? "warning" : "error";
    const code = pick(row, ["issue code", "issue_code", "code", "problem code"]) || "merchant_issue";
    const title = pick(row, ["issue", "probleem", "title", "titel"]) || code;
    const detail = pick(row, ["description", "beschrijving", "details"]);
    const productId = pick(row, ["product id", "product_id"]) || productByVariant.get(feedItemId);
    imported.push(await service.createMerchantIssues({
      feed_item_id: feedItemId, product_id: productId || null, code, severity, title,
      detail: detail || null, country: pick(row, ["country", "land"]) || null,
      last_seen_at: now, resolved_at: null, source: "merchant_center_csv",
    }));
  }
  res.status(201).json({ imported: imported.length });
}
