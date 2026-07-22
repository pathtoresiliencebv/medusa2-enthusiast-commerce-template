import { assertConversationOwner, hashGuestSession, redactForModel, safeConversationPayload } from "../_utils";

describe("support model redaction", () => {
  test("removes common direct identifiers before LLM processing", () => {
    const result = redactForModel(
      "Mail mij op klant@example.nl of bel 0612345678. Kaart 4111 1111 1111 1111, postcode 1234 AB Hoofdstraat 10."
    );
    expect(result).not.toContain("klant@example.nl");
    expect(result).not.toContain("0612345678");
    expect(result).not.toContain("4111 1111 1111 1111");
    expect(result).not.toContain("1234 AB");
  });

  test("hard-limits model input to 2,000 characters", () => {
    expect(redactForModel("x".repeat(2500))).toHaveLength(2000);
  });

  test("maps Enthusiast history without exposing internal message types", () => {
    expect(safeConversationPayload({ history: [
      { id: 1, type: "human", text: "Vraag" },
      { id: 2, type: "function", text: "secret tool output" },
      { id: 3, type: "ai", text: "<think>hidden</think>Antwoord" },
    ] }).messages).toEqual([
      { id: "1", role: "user", content: "Vraag", created_at: null },
      { id: "3", role: "assistant", content: "Antwoord", created_at: null },
    ]);
  });

  test("never reopens a customer conversation to a logged-out guest", async () => {
    process.env.SUPPORT_BFF_SECRET = "bff-test-secret";
    process.env.SUPPORT_INTERNAL_SECRET = "internal-test-secret";
    const session = "guest-session-with-at-least-thirty-two-characters";
    const service = {
      listSupportConversations: jest.fn().mockResolvedValue([{
        id: "sc_1",
        external_conversation_id: "1",
        customer_id: "cus_owner",
        guest_session_hash: hashGuestSession(session),
        status: "active",
      }]),
    };
    const req = {
      auth_context: {},
      headers: { "x-support-bff-secret": "bff-test-secret", "x-support-session": session },
      scope: { resolve: () => service },
    } as any;
    await expect(assertConversationOwner(req, "sc_1")).rejects.toThrow("Gesprek niet gevonden");
  });
});
