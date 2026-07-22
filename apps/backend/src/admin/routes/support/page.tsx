// @ts-nocheck -- Medusa Admin compiles React 18 separately from workspace React 19 types.
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ShoppingBag } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Select, Text, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";

type SupportCase = {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  order_id?: string;
  customer_id?: string;
  notification_status: "pending" | "sent" | "failed";
  notification_attempts: number;
  notification_last_error?: string;
  created_at: string;
};

const statuses = ["open", "in_progress", "waiting_customer", "resolved", "closed"];

const SupportPage = () => {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/admin/support/cases", { credentials: "include" });
      if (!response.ok) throw new Error("Laden mislukt");
      setCases((await response.json()).cases || []);
    } catch {
      toast.error("Supportcases konden niet worden geladen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const response = await fetch(`/admin/support/cases/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return toast.error("Status kon niet worden bijgewerkt");
    toast.success("Casestatus bijgewerkt");
    await load();
  };

  const retry = async (id: string) => {
    const response = await fetch(`/admin/support/cases/${id}/retry`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) return toast.error("Opnieuw verzenden mislukt");
    const payload = await response.json();
    payload.case?.notification_status === "sent"
      ? toast.success("Melding verzonden")
      : toast.error("SMTP-melding is nog niet verzonden; de case blijft bewaard");
    await load();
  };

  return (
    <div className="flex flex-col gap-3">
      <Container className="flex items-center justify-between p-6">
        <div>
          <Heading level="h1">LVRO Customer Support</Heading>
          <Text className="text-ui-fg-subtle">Veilige overdrachten uit de storefrontchat.</Text>
        </div>
        <Badge color={cases.some((item) => item.status === "open") ? "orange" : "green"}>
          {cases.filter((item) => item.status === "open").length} open
        </Badge>
      </Container>
      <Container className="p-0">
        {loading ? <Text className="p-6">Laden...</Text> : cases.length ? (
          <div className="divide-y">
            {cases.map((supportCase) => (
              <article key={supportCase.id} className="grid gap-4 p-6 lg:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Text weight="plus">{supportCase.subject}</Text>
                    <Badge>{supportCase.type}</Badge>
                    <Badge color={supportCase.notification_status === "sent" ? "green" : "red"}>
                      e-mail {supportCase.notification_status}
                    </Badge>
                  </div>
                  <Text className="mt-2 text-ui-fg-subtle">Case {supportCase.id}</Text>
                  <Text className="mt-3 whitespace-pre-wrap">{supportCase.message}</Text>
                  <Text className="mt-3 text-ui-fg-subtle">
                    Klant: {supportCase.customer_id || "gast"} · Bestelling: {supportCase.order_id || "geen"}
                  </Text>
                  {supportCase.notification_last_error && (
                    <Text className="mt-2 text-ui-fg-error">{supportCase.notification_last_error}</Text>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Select value={supportCase.status} onValueChange={(value) => updateStatus(supportCase.id, value)}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      {statuses.map((status) => <Select.Item key={status} value={status}>{status}</Select.Item>)}
                    </Select.Content>
                  </Select>
                  {supportCase.notification_status === "failed" && (
                    <Button variant="secondary" onClick={() => retry(supportCase.id)}>
                      Opnieuw verzenden
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : <Text className="p-6 text-ui-fg-subtle">Nog geen supportcases.</Text>}
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({ label: "Customer Support", icon: ShoppingBag });
export default SupportPage;
