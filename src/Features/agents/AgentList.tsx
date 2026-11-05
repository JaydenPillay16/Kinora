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
        <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-24 -z-10 h-80 w-80 rounded-full bg-[var(--app-accent)] opacity-[0.09] blur-3xl" />
        <div aria-hidden="true" className="agent-orbit agent-orbit-one pointer-events-none absolute right-10 top-1/2 hidden h-52 w-52 -translate-y-1/2 rounded-full border border-[var(--app-accent)]/10 lg:block" />
        <div aria-hidden="true" className="agent-orbit agent-orbit-two pointer-events-none absolute right-[4.6rem] top-1/2 hidden h-36 w-36 -translate-y-1/2 rounded-full border border-[var(--app-accent)]/15 lg:block" />

        <div className="relative flex flex-col gap-8 lg:min-h-[220px] lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="agent-empty-icon mb-6 flex h-14 w-14 items-center justify-center rounded-[19px] text-[var(--app-accent)] shadow-lg">
              <Bot size={27} strokeWidth={1.7} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-accent)]">A little help staying in touch</p>
            <h3 id="agent-empty-title" className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[var(--app-text)] sm:text-[28px]">Your first agent starts here.</h3>
            <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--app-text-muted)] sm:text-[15px]">
              Create a thoughtful messaging assistant for someone in your circle. Set its tone, choose a contact, and plan when to reach out.
            </p>
          </div>

          <div className="relative flex shrink-0 flex-col items-start gap-3 lg:mr-2">
            <button type="button" onClick={onCreate} className="agent-create-action group inline-flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]">
              <span className="agent-create-icon flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 transition duration-300 group-hover:rotate-90"><Plus size={17} strokeWidth={2.3} /></span>
              Create your first agent
              <ArrowRight size={16} className="agent-create-arrow transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <p className="pl-1 text-xs text-[var(--app-text-muted)]">Usually takes less than a minute</p>
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
