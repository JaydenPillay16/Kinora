
export type ScheduledMessageStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'cancelled'

export interface ScheduledMessage {
  id: string
  agentId: string | null
  contactId: string | null
  contactName: string
  agentName: string
  messageText: string
  scheduledAt: string
  status: ScheduledMessageStatus
  createdAt: string
}
