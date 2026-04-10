import type {
  ConversationSummaryResult,
  LeadProgressionResult,
} from "@/lib/types";

export type { ConversationSummaryResult, LeadProgressionResult };

export interface QuoteJson {
  title: string;
  description: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
  subtotal: number;
  vat: number;
  total: number;
  notes: string;
}
