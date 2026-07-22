import { createHash, timingSafeEqual } from "node:crypto";

import type { AuthenticatedMedusaRequest } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import Redis from "ioredis";

import { SUPPORT_MODULE } from "../../../modules/support";

type SupportConversation = {
  id: string;
  external_conversation_id: string;
  customer_id?: string | null;
  guest_session_hash?: string | null;
  status: string;
  locale: string;
};

let redis: Redis | null = null;

export const getSupportService = (req: AuthenticatedMedusaRequest) =>
  req.scope.resolve(SUPPORT_MODULE) as any;

export const getEnthusiastService = (req: AuthenticatedMedusaRequest) =>
  req.scope.resolve("enthusiast") as any;

export function requireBff(req: AuthenticatedMedusaRequest) {
  const expected = process.env.SUPPORT_BFF_SECRET;
  const supplied = String(req.headers["x-support-bff-secret"] || "");
  if (!expected || !supplied || expected.length !== supplied.length) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Ongeldige supportgateway.");
  }
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Ongeldige supportgateway.");
  }
}

export function hashGuestSession(session: string) {
  if (!session || session.length < 32 || session.length > 160) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Ongeldige supportsessie.");
  }
  const pepper = process.env.SUPPORT_SESSION_PEPPER || process.env.SUPPORT_INTERNAL_SECRET;
  if (!pepper) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Support is niet geconfigureerd.");
  }
  return createHash("sha256").update(`${pepper}:${session}`).digest("hex");
}

export function getOwner(req: AuthenticatedMedusaRequest) {
  const customerId = req.auth_context?.actor_id || null;
  const rawSession = String(req.headers["x-support-session"] || "");
  const guestHash = rawSession ? hashGuestSession(rawSession) : null;
  if (!customerId && !guestHash) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Supportsessie ontbreekt.");
  }
  return { customerId, guestHash };
}

export async function assertConversationOwner(
  req: AuthenticatedMedusaRequest,
  conversationId: string,
): Promise<SupportConversation> {
  requireBff(req);
  const { customerId, guestHash } = getOwner(req);
  const service = getSupportService(req);
  const matches = await service.listSupportConversations({ id: conversationId });
  const conversation = matches?.[0] as SupportConversation | undefined;
  if (!conversation || conversation.status !== "active") {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Gesprek niet gevonden.");
  }
  const customerOwns = Boolean(customerId && conversation.customer_id === customerId);
  const guestOwns = Boolean(!conversation.customer_id && guestHash && conversation.guest_session_hash === guestHash);
  if (!customerOwns && !guestOwns) {
    // Do not disclose whether this identifier belongs to somebody else.
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Gesprek niet gevonden.");
  }
  if (!conversation.customer_id && customerId && guestOwns) {
    await service.updateSupportConversations({ id: conversation.id, customer_id: customerId });
    conversation.customer_id = customerId;
  }
  return conversation;
}

export function redactForModel(input: string) {
  return input
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[e-mail verwijderd]")
    .replace(/(?:\+31|0031|0)[\s.-]?(?:\d[\s.-]?){8,10}/g, "[telefoon verwijderd]")
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[betaalgegevens verwijderd]")
    .replace(/\b\d{4}\s?[A-Z]{2}\b(?:\s+[^,.;\n]{1,60})?/gi, "[adres verwijderd]")
    .slice(0, 2000)
    .trim();
}

export function clientIp(req: AuthenticatedMedusaRequest) {
  const trusted = String(req.headers["x-support-client-ip"] || "").split(",")[0].trim();
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return trusted || forwarded || req.ip || "unknown";
}

function getRedis() {
  if (!process.env.REDIS_URL) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Rate limiting is niet beschikbaar.");
  }
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    redis.on("error", () => undefined);
  }
  return redis;
}

export async function consumeLimit(key: string, limit: number, windowSeconds: number) {
  const client = getRedis();
  if (client.status === "wait") await client.connect();
  const bucket = `lvro:support:${key}`;
  const tx = client.multi().incr(bucket).ttl(bucket);
  const result = await tx.exec();
  const count = Number(result?.[0]?.[1] || 0);
  const ttl = Number(result?.[1]?.[1] || -1);
  if (ttl < 0) await client.expire(bucket, windowSeconds);
  if (count > limit) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Te veel verzoeken. Probeer het later opnieuw.");
  }
}

export async function assertFeatureAccess(req: AuthenticatedMedusaRequest) {
  const mode = (process.env.SUPPORT_CHAT_MODE || "off").toLowerCase();
  if (mode === "off") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "De supportchat is tijdelijk uitgeschakeld.");
  }
  if (mode !== "canary") return;
  const customerId = req.auth_context?.actor_id;
  if (!customerId) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "De supportchat is nog in testfase.");
  }
  const query = req.scope.resolve("query") as any;
  const { data } = await query.graph({ entity: "customer", fields: ["email"], filters: { id: customerId } });
  const allow = (process.env.SUPPORT_CHAT_CANARY_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!data?.[0]?.email || !allow.includes(String(data[0].email).toLowerCase())) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "De supportchat is nog in testfase.");
  }
}

export function safeConversationPayload(input: any) {
  const rawMessages = Array.isArray(input?.history)
    ? input.history
    : Array.isArray(input?.messages)
      ? input.messages
      : Array.isArray(input?.results)
        ? input.results
        : [];
  const messages = rawMessages.flatMap((message: any, index: number) => {
    const role = message.role || message.type || message.sender;
    if (!["user", "human", "assistant", "ai"].includes(String(role).toLowerCase())) return [];
    const content = message.content ?? message.text ?? message.message;
    const text = typeof content === "string" ? content : content?.text;
    if (!text || typeof text !== "string") return [];
    return [{
      id: String(message.id || `${role}-${message.created_at || index}`),
      role: ["assistant", "ai"].includes(String(role).toLowerCase()) ? "assistant" : "user",
      content: text.replace(/<think>.*?<\/think>/gis, "").trim(),
      created_at: message.created_at || null,
    }];
  });
  return { messages };
}

export async function resolveSupportAgentId(enthusiast: any) {
  const configured = Number(process.env.SUPPORT_ENTHUSIAST_AGENT_ID || 0);
  if (configured) return configured;
  const datasetId = Number(process.env.SUPPORT_ENTHUSIAST_DATASET_ID || 1);
  const agents = await enthusiast.listAgents(datasetId);
  const list = Array.isArray(agents) ? agents : agents?.results || [];
  const agent = list.find((item: any) => item?.name === "LVRO Customer Support" || item?.agent_type === "lvro-customer-support");
  if (!agent?.id) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Supportagent is niet actief.");
  }
  return Number(agent.id);
}
