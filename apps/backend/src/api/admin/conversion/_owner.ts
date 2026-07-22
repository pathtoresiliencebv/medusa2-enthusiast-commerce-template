import type { AuthenticatedMedusaRequest } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

const DEFAULT_OWNER = "owner@example.com";

export async function requireSourcingOwner(req: AuthenticatedMedusaRequest) {
  const actorId = req.auth_context?.actor_id;
  if (!actorId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Log eerst in.");
  }

  const query = req.scope.resolve("query") as any;
  const { data } = await query.graph({
    entity: "user",
    fields: ["id", "email"],
    filters: { id: actorId },
  });
  const user = data?.[0];
  const owners = (process.env.SOURCING_OWNER_EMAILS || DEFAULT_OWNER)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!user?.email || !owners.includes(String(user.email).toLowerCase())) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Alleen de eigenaar heeft toegang tot inkoopgegevens.",
    );
  }

  return { id: actorId, email: String(user.email).toLowerCase() };
}
