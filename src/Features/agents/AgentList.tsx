import { ArrowRight, Bot, Plus } from "lucide-react";
import AgentCard from "./AgentCard";
import type { Agent } from "./types";

interface AgentListProps {
  agents: Agent[];
  onCreate: () => void;
  onEdit: (agent: Agent) => void;
  onToggleStatus: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onSendNow: (agent: Agent) => void;
}

function AgentList({ agents, onCreate, onEdit, onToggleStatus, onDelete, onSendNow }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <section className="agent-empty-state relative isolate overflow-hidden rounded-[26px] border border-[var(--app-border)] p-6 sm:p-8 lg:p-10" aria-labelledby="agent-empty-title">

        <div className="relative flex flex-col gap-8 lg:min-h-[220px] lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="agent-empty-icon mb-4 flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-accent)]">
              <Bot size={27} strokeWidth={1.7} />
            </div>
            <h3 id="agent-empty-title" className="text-2xl font-medium text-[var(--app-text)] sm:text-[28px]">Create a message plan</h3>
            <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--app-text-muted)] sm:text-[15px]">
              Choose a contact, save a personal message draft, and optionally set a time to reach out.
            </p>
          </div>

          <div className="relative flex shrink-0 flex-col items-start gap-3 lg:mr-2">
            <button type="button" onClick={onCreate} className="agent-create-action group inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]">
              <Plus size={16} strokeWidth={1.8} />
              Create an agent
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {agents.map((agent, index) => (
        <div key={agent.id} className="agent-card-enter" style={{ animationDelay: `${Math.min(index, 5) * 70}ms` }}>
          <AgentCard agent={agent} onEdit={onEdit} onToggleStatus={onToggleStatus} onDelete={onDelete} onSendNow={onSendNow} />
        </div>
      ))}
    </div>
  );
}

export default AgentList;
