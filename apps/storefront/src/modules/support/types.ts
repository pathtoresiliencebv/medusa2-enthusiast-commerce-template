export type SupportMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  created_at?: string | null
}

export type SupportOrder = {
  id: string
  display_id?: string | number
  created_at?: string
}

export type CaseType = "general" | "cancellation" | "return" | "damage" | "delivery" | "payment"
