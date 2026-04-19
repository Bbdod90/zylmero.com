export type EmbeddedChatTone = "kort" | "vriendelijk" | "zakelijk";

export type EmbeddedChatbotSourceType = "text" | "url";

export type EmbeddedChatbotRow = {
  id: string;
  company_id: string;
  name: string;
  tone: EmbeddedChatTone;
  instructions: string;
  created_at: string;
  updated_at: string;
};

export type EmbeddedChatbotSourceRow = {
  id: string;
  chatbot_id: string;
  type: EmbeddedChatbotSourceType;
  content: string;
  created_at: string;
};
