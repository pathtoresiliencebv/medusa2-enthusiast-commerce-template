// @ts-nocheck -- Medusa Admin compiles React 18 separately from the workspace React 19 types.
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChevronLeftMini, ChevronRightMini, MagnifyingGlass, ShoppingBag } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Input, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

const pageSize = 50;
const views = [
  ["all", "Alles"], ["eligible", "Geschikt"], ["awaiting", "Wacht op akkoord"],
  ["approved", "Goedgekeurd"], ["quarantined", "Quarantaine"], ["stale", "Verouderd"],
  ["merchant-error", "Merchant-fout"], ["margin-incomplete", "Marge onvolledig"],
];
const money = (value) => value === null || value === undefined
  ? "Onbekend"
  : new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(Number(value));
const number = (value) => Number(value || 0).toLocaleString("nl-NL");

export default function SourcingPage() {
  const [payload, setPayload] = useState({ products: [], count: 0, total: 0, stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");
  const [selected, setSelected] = useState([]);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset), state: view });
    if (search) params.set("q", search);
    setLoading(true); setError("");
    fetch(`/admin/conversion/sourcing?${params}`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 403 ? "Alleen de eigenaar mag de inkoopomgeving openen." : "De inkoopselectie kon niet worden geladen.");
        return response.json();
      })
      .then(setPayload)
      .catch((requestError) => requestError.name !== "AbortError" && setError(requestError.message))
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [offset, search, view, revision]);

  const runAction = async (action) => {
    if (!selected.length) return;
    const reason = action === "quarantine" ? window.prompt("Waarom plaats je deze producten in quarantaine?") : undefined;
    if (action === "quarantine" && !reason) return;
    const response = await fetch("/admin/conversion/sourcing", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_ids: selected, action, reason }),
    });
    if (!response.ok) { setError((await response.json().catch(() => ({}))).message || "Actie mislukt."); return; }
    setSelected([]); setRevision((value) => value + 1);
  };

  const importMerchantCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const response = await fetch("/admin/conversion/merchant-issues", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: await file.text() }),
    });
    if (!response.ok) setError("Merchant Center-export kon niet worden geïmporteerd.");
    else setRevision((value) => value + 1);
    event.target.value = "";
  };

  const allPageSelected = payload.products.length > 0 && payload.products.every((product) => selected.includes(product.id));
  const stats = payload.stats || {};
  return (
    <div className="flex flex-col gap-3">
      <Container className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div><Heading level="h1">Inkoop & Google Shopping</Heading><Text className="text-ui-fg-subtle">Owner-only kosten, broncontrole, marges en goedkeuring van de kernfeed.</Text></div>
        <div className="flex flex-wrap gap-2"><Badge color="green">{number(stats.approved)} goedgekeurd</Badge><Badge color="grey">{number(payload.total)} totaal</Badge><label><input type="file" accept=".csv,text/csv" className="hidden" onChange={importMerchantCsv} /><span className="inline-flex cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium">Merchant CSV importeren</span></label></div>
      </Container>
      <Container className="grid grid-cols-2 divide-x p-0 md:grid-cols-7">
        {[["Geschikt", stats.eligible], ["Wacht akkoord", stats.awaiting], ["Goedgekeurd", stats.approved], ["Quarantaine", stats.quarantined], ["Verouderd", stats.stale], ["Merchant-fout", stats.merchant_error], ["Marge onvolledig", stats.margin_incomplete]].map(([label, value]) => <div key={label} className="px-4 py-4"><Text size="xsmall" className="text-ui-fg-subtle">{label}</Text><Heading level="h2">{number(value)}</Heading></div>)}
      </Container>
      <Container className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <form className="flex w-full max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); setOffset(0); setSearch(searchInput.trim()); }}><Input placeholder="Zoek product, SKU, leverancier of categorie" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /><Button type="submit" variant="secondary"><MagnifyingGlass />Zoeken</Button></form>
            <Text size="small" className="ml-auto text-ui-fg-subtle">{number(selected.length)} geselecteerd</Text>
          </div>
          <div className="flex flex-wrap gap-2">{views.map(([value, label]) => <Button key={value} size="small" variant={view === value ? "primary" : "secondary"} onClick={() => { setView(value); setOffset(0); setSelected([]); }}>{label}</Button>)}</div>
          {selected.length > 0 && <div className="flex flex-wrap gap-2 rounded bg-ui-bg-subtle p-3"><Button size="small" onClick={() => runAction("verify")}>Prijs, voorraad & beeld bevestigd</Button><Button size="small" onClick={() => runAction("approve")}>Goedkeuren voor kernfeed</Button><Button size="small" variant="secondary" onClick={() => runAction("revoke")}>Goedkeuring intrekken</Button><Button size="small" variant="danger" onClick={() => runAction("quarantine")}>Quarantaine</Button></div>}
        </div>
        {error ? <Text className="p-6 text-ui-fg-error">{error}</Text> : loading ? <Text className="p-6 text-ui-fg-subtle">Laden...</Text> : (
          <div className="overflow-x-auto"><div className="min-w-[1320px]">
            <div className="grid grid-cols-[32px_minmax(300px,1.4fr)_210px_220px_220px_220px_110px] gap-4 border-b bg-ui-bg-subtle px-6 py-3"><input type="checkbox" checked={allPageSelected} onChange={() => setSelected(allPageSelected ? [] : payload.products.map((p) => p.id))} /><Text size="small" weight="plus">Product</Text><Text size="small" weight="plus">Kosten & marge</Text><Text size="small" weight="plus">Bron</Text><Text size="small" weight="plus">Feedcontroles</Text><Text size="small" weight="plus">Status</Text><span /></div>
            <div className="divide-y">{payload.products.map((product) => {
              const s = product.sourcing; const failures = s.eligibility?.failures || [];
              return <div key={product.id} className="grid grid-cols-[32px_minmax(300px,1.4fr)_210px_220px_220px_220px_110px] items-center gap-4 px-6 py-4">
                <input type="checkbox" checked={selected.includes(product.id)} onChange={() => setSelected((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])} />
                <div className="flex min-w-0 gap-3"><div className="h-16 w-16 shrink-0 overflow-hidden rounded border">{product.thumbnail && <img src={product.thumbnail} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0"><Text weight="plus" className="line-clamp-2">{product.title}</Text><Text size="xsmall" className="truncate text-ui-fg-subtle">{s.category} · {s.image_count} foto’s</Text></div></div>
                <div><Text size="small">Inkoop {money(s.costs.purchase_price)}</Text><Text size="small">Verkoop {money(s.retail_price)}</Text><Text size="xsmall" className={s.margin.complete ? "text-ui-fg-subtle" : "text-ui-fg-error"}>Netto {s.margin.complete ? money(s.margin.projected_net_contribution) : "onvolledig"}</Text><Text size="xsmall" className="text-ui-fg-subtle">Break-even ROAS {s.margin.break_even_roas ? `${Number(s.margin.break_even_roas).toFixed(2)}x` : "—"}</Text></div>
                <div><Text size="small">{s.supplier_name || s.source_system || "Onbekend"}</Text><Text size="xsmall" className="font-mono">{s.source_sku || "Geen SKU"}</Text><Text size="xsmall" className="text-ui-fg-subtle">Controle {s.source_checked_at ? new Date(s.source_checked_at).toLocaleString("nl-NL") : "nooit"}</Text></div>
                <div className="flex flex-wrap gap-1">{failures.length ? failures.slice(0, 4).map((failure) => <Badge key={failure} color="red">{failure.replaceAll("_", " ")}</Badge>) : <Badge color="green">Alle automatische checks OK</Badge>}{s.merchant_issues?.length > 0 && <Badge color="orange">{s.merchant_issues.length} Merchant</Badge>}</div>
                <div className="flex flex-col items-start gap-1"><Badge color={s.owner_approved ? "green" : s.shopping_status === "quarantined" ? "red" : "orange"}>{s.owner_approved ? "Goedgekeurd" : s.shopping_status}</Badge>{!s.margin.complete && <Text size="xsmall" className="text-ui-fg-error">Ontbreekt: {s.margin.missing.join(", ")}</Text>}</div>
                <Button asChild variant="secondary" size="small"><a href={`/app/products/${product.id}`}>Open</a></Button>
              </div>})}</div>
          </div></div>
        )}
        <div className="flex items-center justify-between border-t px-6 py-4"><Text size="small" className="text-ui-fg-subtle">{number(payload.count ? offset + 1 : 0)}–{number(Math.min(offset + payload.products.length, payload.count))} van {number(payload.count)}</Text><div className="flex gap-2"><Button variant="secondary" size="small" disabled={loading || offset === 0} onClick={() => setOffset(Math.max(0, offset - pageSize))}><ChevronLeftMini />Vorige</Button><Button variant="secondary" size="small" disabled={loading || offset + pageSize >= payload.count} onClick={() => setOffset(offset + pageSize)}>Volgende<ChevronRightMini /></Button></div></div>
      </Container>
    </div>
  );
}

export const config = defineRouteConfig({ label: "Inkoop", icon: ShoppingBag });
