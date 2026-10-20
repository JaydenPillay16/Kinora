export type AgentStatus = 'active' | 'paused' | 'draft'

export interface Agent {
  id: string
  name: string
  contactId: string
  contactName: string
  instructions: string
  messageTemplate: string
  status: AgentStatus
  nextScheduledAt: string | null
  createdAt: string
}