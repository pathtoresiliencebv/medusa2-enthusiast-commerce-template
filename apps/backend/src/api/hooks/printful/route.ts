import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { CONVERSION_MODULE } from "../../../modules/conversion";

type PrintfulWebhook = {
  type?: string;
  created?: number;
  data?: {
    order?: { id?: number; external_id?: string; status?: string };
    shipment?: { id?: number; tracking_number?: string; tracking_url?: string };
  };
};

export async function POST(
  req: MedusaRequest<PrintfulWebhook>,
  res: MedusaResponse,
) {
  const expectedSecret = process.env.PRINTFUL_WEBHOOK_SECRET;
  const receivedSecret = req.headers["x-printful-secret"];

  if (expectedSecret && receivedSecret !== expectedSecret) {
    return res.status(401).json({ message: "Ongeldige webhookhandtekening." });
  }

  const service = req.scope.resolve(CONVERSION_MODULE) as any;
  const externalId = [
    req.body.type || "unknown",
    req.body.data?.order?.id || req.body.data?.shipment?.id || "none",
    req.body.created || Date.now(),
  ].join(":");
  const [existing] = await service.listPodWebhookEvents({
    external_id: externalId,
  });

  if (existing) {
    return res.json({ received: true, duplicate: true });
  }

  const event = await service.createPodWebhookEvents({
    external_id: externalId,
    event_type: req.body.type || "unknown",
    payload: req.body,
    processed: true,
    processed_at: new Date(),
  });

  res.status(201).json({ received: true, event_id: event.id });
}
