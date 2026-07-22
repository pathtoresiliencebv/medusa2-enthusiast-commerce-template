import type { AuthenticatedMedusaRequest } from "@medusajs/framework/http";

import { sendSupportNotification } from "../../../../lib/support-notification";
import { getSupportService } from "../_utils";

export async function notifyCase(req: AuthenticatedMedusaRequest, supportCase: any) {
  const query = req.scope.resolve("query") as any;
  const [customerResult, orderResult] = await Promise.all([
    supportCase.customer_id
      ? query.graph({
          entity: "customer",
          fields: ["id", "email", "first_name", "last_name"],
          filters: { id: supportCase.customer_id },
        })
      : Promise.resolve({ data: [] }),
    supportCase.order_id
      ? query.graph({
          entity: "order",
          fields: ["id", "display_id"],
          filters: { id: supportCase.order_id },
        })
      : Promise.resolve({ data: [] }),
  ]);
  const service = getSupportService(req);
  const attempts = Number(supportCase.notification_attempts || 0) + 1;
  try {
    await sendSupportNotification({
      id: supportCase.id,
      type: supportCase.type,
      subject: supportCase.subject,
      message: supportCase.message,
      customer: customerResult.data?.[0] || null,
      order: orderResult.data?.[0] || null,
      transcript: supportCase.transcript_snapshot,
    });
    return await service.updateSupportCases({
      id: supportCase.id,
      notification_status: "sent",
      notification_attempts: attempts,
      notification_last_error: null,
      notification_sent_at: new Date(),
    });
  } catch (error) {
    return await service.updateSupportCases({
      id: supportCase.id,
      notification_status: "failed",
      notification_attempts: attempts,
      notification_last_error: error instanceof Error ? error.message.slice(0, 500) : "Onbekende SMTP-fout",
    });
  }
}
