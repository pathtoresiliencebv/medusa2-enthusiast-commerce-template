import type { MedusaContainer } from "@medusajs/framework/types";

import { SUPPORT_MODULE } from "../modules/support";

export default async function supportRetention(container: MedusaContainer) {
  const support = container.resolve(SUPPORT_MODULE) as any;
  const conversationCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const caseCutoff = new Date(Date.now() - 24 * 30.4375 * 24 * 60 * 60 * 1000);
  const oldConversations = await support.listSupportConversations({
    last_activity_at: { $lt: conversationCutoff },
  });
  const oldCases = await support.listSupportCases({ created_at: { $lt: caseCutoff } });
  if (oldConversations.length) await support.deleteSupportConversations(oldConversations.map((item: any) => item.id));
  if (oldCases.length) await support.deleteSupportCases(oldCases.map((item: any) => item.id));
}

export const config = {
  name: "support-retention",
  schedule: "17 3 * * *",
};
