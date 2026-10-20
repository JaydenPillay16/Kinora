import Sidebar from "./Components/layout/Sidebar";
import Header from "./Components/layout/Header";
import AgentList from "./Features/agents/AgentList";
import type { Agent } from "./Features/agents/types";
import { useEffect, useState } from "react";
import AgentForm from "./Features/agents/AgentForm";
import ContactForm from "./Features/contacts/ContactForm";
import ContactList from "./Features/contacts/ContactList";
import type { Contact } from "./Features/contacts/types";

const sampleAgents: Agent[] = [
  {
    id: "1",
    name: "Daily Check-in",
    contactId: "",
    contactName: "Sample Contact A",
    instructions: "Check in daily and ask how their day is going.",
    messageTemplate: "Hey! Just checking in. How are you doing today?",
    status: "active",
    nextScheduledAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Weekly Catch-up",
    contactId: "",
    contactName: "Sample Contact B",
    instructions: "Send a friendly weekly catch-up message.",
    messageTemplate: "Hey! How has your week been?",
    status: "paused",
    nextScheduledAt: null,
    createdAt: new Date().toISOString(),
  },
];

function App() {
  const [agents, setAgents] = useState<Agent[]>(() => {
    const savedAgents = localStorage.getItem("kinora-agents");

    if (savedAgents) {
      return JSON.parse(savedAgents) as Agent[];
    }

    return sampleAgents;
  });
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const savedContacts = localStorage.getItem("kinora-contacts");

    if (savedContacts) {
      return JSON.parse(savedContacts) as Contact[];
    }

    return [];
  });

  const [isCreatingContact, setIsCreatingContact] = useState(false);

  useEffect(() => {
    localStorage.setItem("kinora-agents", JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem("kinora-contacts", JSON.stringify(contacts));
  }, [contacts]);

  function handleCreateAgent(agent: Agent) {
    setAgents((currentAgents) => [agent, ...currentAgents]);
    setIsCreatingAgent(false);
  }

  function handleUpdateAgent(updatedAgent: Agent) {
    setAgents((currentAgents) =>
      currentAgents.map((agent) =>
        agent.id === updatedAgent.id ? updatedAgent : agent,
      ),
    );

    setEditingAgent(null);
  }

  function handleToggleAgentStatus(agentId: string) {
    setAgents((currentAgents) =>
      currentAgents.map((agent) => {
        if (agent.id !== agentId) {
          return agent;
        }

        return {
          ...agent,
          status: agent.status === "active" ? "paused" : "active",
        };
      }),
    );
  }

  function handleDeleteAgent(agentId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this agent? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setAgents((currentAgents) =>
      currentAgents.filter((agent) => agent.id !== agentId),
    );
  }

  function handleCreateContact(contact: Contact) {
    setContacts((currentContacts) => [contact, ...currentContacts]);
    setIsCreatingContact(false);
  }

  function handleDeleteContact(contactId: string) {
    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== contactId),
    );
  }

  return (
    <div className="flex min-h-screen bg-kinora-background text-kinora-text">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-kinora-primary">
              Tuesday, October 20, 2026
            </p>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Good morning!
                </h2>
                <p className="mt-2 text-kinora-muted">
                  Here's what's happening with your personal messaging.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingAgent(true)}
                className="rounded-xl bg-kinora-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                + Create an agent
              </button>
            </div>

            {(isCreatingAgent || editingAgent) && (
              <section className="mt-8">
                <AgentForm
                  key={editingAgent?.id ?? "new-agent"}
                  contacts={contacts}
                  initialAgent={editingAgent ?? undefined}
                  onCreate={handleCreateAgent}
                  onUpdate={handleUpdateAgent}
                  onCancel={() => {
                    setIsCreatingAgent(false);
                    setEditingAgent(null);
                  }}
                />
              </section>
            )}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Active agents",
                  value: "0",
                  detail: "Your personal assistants",
                },
                {
                  label: "Scheduled messages",
                  value: "0",
                  detail: "Messages coming up",
                },
                {
                  label: "Messages sent",
                  value: "0",
                  detail: "Across all your agents",
                },
                {
                  label: "Contacts",
                  value: "0",
                  detail: "People who matter to you",
                },
              ].map((stat) => (
                <section
                  key={stat.label}
                  className="rounded-2xl border border-kinora-border bg-white p-5"
                >
                  <p className="text-sm text-kinora-muted">{stat.label}</p>
                  <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                  <p className="mt-2 text-xs text-kinora-muted">
                    {stat.detail}
                  </p>
                </section>
              ))}
            </div>

            <section className="mt-6 rounded-2xl border border-kinora-border bg-white p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kinora-mint text-xl text-kinora-primary">
                ✳
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                Your next meaningful moment starts here
              </h3>

              <p className="mt-2 max-w-xl leading-7 text-kinora-muted">
                Create your first messaging agent to plan thoughtful messages,
                manage schedules, and stay connected with the people who matter.
              </p>

              <button
                type="button"
                className="mt-5 rounded-xl border border-kinora-border px-4 py-2.5 text-sm font-semibold transition hover:bg-kinora-background"
              >
                Explore your workspace
              </button>
            </section>

            <section className="mt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">My Agents</h2>
                  <p className="mt-1 text-sm text-kinora-muted">
                    Your personal messaging assistants.
                  </p>
                </div>

                <span className="text-sm text-kinora-muted">
                  {agents.length} agents
                </span>
              </div>

              <AgentList
                agents={agents}
                onEdit={(agent) => {
                  setIsCreatingAgent(false);
                  setEditingAgent(agent);
                }}
                onToggleStatus={handleToggleAgentStatus}
                onDelete={handleDeleteAgent}
              />
            </section>
            <section className="mt-10">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-kinora-text">
                    My Contacts
                  </h2>
                  <p className="mt-1 text-sm text-kinora-muted">
                    Manage the people you want to stay connected with.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingContact(true)}
                  className="rounded-xl bg-kinora-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  + Add contact
                </button>
              </div>

              {isCreatingContact && (
                <div className="mb-6">
                  <ContactForm
                    onCreate={handleCreateContact}
                    onCancel={() => setIsCreatingContact(false)}
                  />
                </div>
              )}

              <ContactList contacts={contacts} onDelete={handleDeleteContact} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
