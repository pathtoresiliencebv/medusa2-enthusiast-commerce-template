// @ts-nocheck -- Medusa Admin compiles React 18 separately from the workspace React 19 types.
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import { ShoppingBag } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Input, Text, Textarea } from "@medusajs/ui";
import { useEffect, useState } from "react";

const fields = [
  ["purchase_price", "Inkoopprijs"], ["supplier_shipping", "Leveranciersverzending"],
  ["inbound_handling", "Inbound/handling"], ["import_duties", "Invoerrechten"],
  ["outbound_fulfillment", "Fulfilment"], ["other_costs", "Overige kosten"],
  ["return_reserve_rate", "Retourreserve (0–1)"], ["ad_cost_rate", "Advertentiekosten (0–1)"],
];

export default function ProductSourcingWidget({ data }: DetailWidgetProps<AdminProduct>) {
  const [profile, setProfile] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const load = () => fetch(`/admin/conversion/sourcing/${data.id}`, { credentials: "include" })
    .then(async (response) => {
      if (response.status === 403) { setForbidden(true); return null; }
      if (!response.ok) throw new Error("Inkoopgegevens konden niet worden geladen.");
      return response.json();
    })
    .then((payload) => {
      if (!payload) return;
      setProfile(payload.profile); setAudit(payload.audit || []); setForm(payload.profile || {});
    }).catch((error) => setMessage(error.message));

  useEffect(load, [data.id]);
  if (forbidden) return <></>;

  const save = async () => {
    if (!reason.trim()) { setMessage("Vul een wijzigingsreden in."); return; }
    const values = Object.fromEntries([
      ...fields.map(([key]) => [key, form[key] === "" ? null : Number(form[key])]),
      ["supplier_name", form.supplier_name || null], ["source_url", form.source_url || null],
      ["source_sku", form.source_sku || null], ["source_product_id", form.source_product_id || null],
      ["warehouse_country", form.warehouse_country || null], ["source_availability", form.source_availability || null],
      ["internal_notes", form.internal_notes || null], ["public_brand", form.public_brand || null],
      ["public_mpn", form.public_mpn || null], ["eu_warehouse", Boolean(form.eu_warehouse)],
    ]);
    const response = await fetch("/admin/conversion/sourcing", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_ids: [data.id], action: "update", values, reason }),
    });
    if (!response.ok) { setMessage("Opslaan mislukt."); return; }
    setMessage("Inkoopgegevens opgeslagen en gelogd."); setReason(""); load();
  };

  return <Container className="divide-y p-0">
    <div className="flex items-center justify-between px-6 py-4"><div className="flex items-center gap-3"><ShoppingBag /><div><Heading level="h2">Interne inkoopgegevens</Heading><Text className="text-ui-fg-subtle">Alleen zichtbaar voor de eigenaar; iedere wijziging wordt gelogd.</Text></div></div><Badge color={profile?.owner_approved ? "green" : "orange"}>{profile?.owner_approved ? "Kernfeed goedgekeurd" : profile?.shopping_status || "Nog niet ingericht"}</Badge></div>
    <div className="grid gap-4 px-6 py-5 md:grid-cols-4">
      {fields.map(([key, label]) => <label key={key}><Text size="xsmall" className="mb-1 text-ui-fg-subtle">{label}</Text><Input type="number" step="0.01" value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}
      {[["supplier_name", "Leverancier"], ["source_sku", "Bron-SKU"], ["source_product_id", "Bronproduct-ID"], ["warehouse_country", "Magazijnland"], ["source_availability", "Bronvoorraad"], ["public_brand", "Geverifieerd merk"], ["public_mpn", "Geverifieerde MPN"], ["source_url", "Bron-URL"]].map(([key, label]) => <label key={key}><Text size="xsmall" className="mb-1 text-ui-fg-subtle">{label}</Text><Input value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}
      <label className="flex items-center gap-2 pt-6"><input type="checkbox" checked={Boolean(form.eu_warehouse)} onChange={(event) => setForm({ ...form, eu_warehouse: event.target.checked })} /><Text size="small">EU-magazijn</Text></label>
    </div>
    <div className="grid gap-4 px-6 py-5 md:grid-cols-2"><label><Text size="xsmall" className="mb-1 text-ui-fg-subtle">Interne notities</Text><Textarea value={form.internal_notes ?? ""} onChange={(event) => setForm({ ...form, internal_notes: event.target.value })} /></label><label><Text size="xsmall" className="mb-1 text-ui-fg-subtle">Verplichte wijzigingsreden</Text><Textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label></div>
    <div className="flex items-center justify-between gap-4 px-6 py-4"><Text size="small" className={message.includes("opgeslagen") ? "text-ui-fg-success" : "text-ui-fg-error"}>{message || `${audit.length} wijzigingen in de historie`}</Text><Button onClick={save}>Opslaan met historie</Button></div>
    {audit.length > 0 && <div className="px-6 py-4"><Heading level="h3">Laatste wijzigingen</Heading><div className="mt-3 divide-y">{audit.slice(0, 8).map((entry) => <div key={entry.id} className="flex justify-between gap-4 py-2"><Text size="small">{entry.action}{entry.reason ? ` — ${entry.reason}` : ""}</Text><Text size="xsmall" className="text-ui-fg-subtle">{entry.actor_email} · {new Date(entry.created_at).toLocaleString("nl-NL")}</Text></div>)}</div></div>}
  </Container>;
}

export const config = defineWidgetConfig({ zone: "product.details.before" });
