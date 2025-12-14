
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface TicketCreateBody {
  project_id: string;
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
  created_by: string;
}

export interface TicketUpdateBody {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
}

export const STATUS: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
export const PRIORITY: TicketPriority[] = ["low", "medium", "high", "critical"];

