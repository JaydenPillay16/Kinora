import Sidebar from "./Components/layout/Sidebar";
import Header from "./Components/layout/Header";
import AgentList from "./Features/agents/AgentList";
import type { Agent } from "./Features/agents/types";
import { useEffect, useState } from "react";
import AgentForm from "./Features/agents/AgentForm";
import ContactForm from "./Features/contacts/ContactForm";
import ContactList from "./Features/contacts/ContactList";
import type { Contact } from "./Features/contacts/types";
import AuthForm from "./Features/auth/AuthForm";
import { supabase } from "./lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import type { ScheduledMessage } from "./Features/scheduling/types";
import { syncScheduledMessage } from "./Features/scheduling/schedulingService";
import UpcomingMessages from "./Features/scheduling/UpcomingMessages";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [scheduledMessageCount, setScheduledMessageCount] = useState(0);
  const [sentMessageCount, setSentMessageCount] = useState(0);

  async function refreshScheduledMessageCount() {
    if (!session) return;

    const { count, error } = await supabase
      .from("scheduled_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("status", "pending");

    if (error) {
      console.error(
        "Failed to refresh scheduled message count:",
        error.message,
      );
      return;
    }

    setScheduledMessageCount(count ?? 0);
  }

  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessage[]
  >([]);
  const [isLoadingScheduledMessages, setIsLoadingScheduledMessages] =
    useState(true);

  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    async function loadMessageStats() {
      const [scheduledResult, sentResult] = await Promise.all([
        supabase
          .from("scheduled_messages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session!.user.id)
          .eq("status", "pending"),

        supabase
          .from("delivery_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session!.user.id)
          .eq("status", "sent"),
      ]);

      if (!isMounted) return;

      if (scheduledResult.error) {
        console.error(
          "Failed to load scheduled message count:",
          scheduledResult.error.message,
        );
      } else {
        setScheduledMessageCount(scheduledResult.count ?? 0);
      }

      if (sentResult.error) {
        console.error(
          "Failed to load sent message count:",
          sentResult.error.message,
        );
      } else {
        setSentMessageCount(sentResult.count ?? 0);
      }
    }

    void loadMessageStats();

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error("Could not load session:", error.message);
      }

      setSession(data.session);
      setIsAuthLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    async function loadContacts() {
      setIsLoadingContacts(true);

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load contacts:", error.message);
        setIsLoadingContacts(false);
        return;
      }

      setContacts(
        (data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          relationship: row.relationship,
          phoneNumber: row.phone_number,
          notes: row.notes,
          createdAt: row.created_at,
        })),
      );

      setIsLoadingContacts(false);
    }

    void loadContacts();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  const [isCreatingContact, setIsCreatingContact] = useState(false);

  async function handleCreateAgent(agent: Agent) {
    if (!session) return;

    const { data, error } = await supabase
      .from("agents")
      .insert({
        user_id: session.user.id,
        name: agent.name,
        contact_id: agent.contactId || null,
        instructions: agent.instructions,
        message_template: agent.messageTemplate,
        status: agent.status,
        next_scheduled_at: agent.nextScheduledAt || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create agent:", error.message);
      window.alert("Could not save agent. Please try again.");
      return;
    }

    const savedAgent: Agent = {
      id: data.id,
      name: data.name,
      contactId: data.contact_id ?? "",
      contactName:
        contacts.find((contact) => contact.id === data.contact_id)?.name ?? "",
      instructions: data.instructions,
      messageTemplate: data.message_template,
      status: data.status as Agent["status"],
      nextScheduledAt: data.next_scheduled_at,
      createdAt: data.created_at,
    };

    try {
      await syncScheduledMessage({
        userId: session.user.id,
        agent: savedAgent,
      });
      await refreshScheduledMessageCount();
    } catch (error) {
      console.error("Scheduling failed:", error);

      window.alert(
        "The agent was saved, but its scheduled message could not be created. Please try again.",
      );
    }

    setAgents((currentAgents) => [savedAgent, ...currentAgents]);
    setIsCreatingAgent(false);
  }

  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    async function loadAgents() {
      setIsLoadingAgents(true);

      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load agents:", error.message);
        setIsLoadingAgents(false);
        return;
      }

      const loadedAgents: Agent[] = (data ?? []).map((row) => {
        const linkedContact = contacts.find(
          (contact) => contact.id === row.contact_id,
        );

        return {
          id: row.id,
          name: row.name,
          contactId: row.contact_id ?? "",
          contactName: linkedContact?.name ?? "",
          instructions: row.instructions,
          messageTemplate: row.message_template,
          status: row.status as Agent["status"],
          nextScheduledAt: row.next_scheduled_at,
          createdAt: row.created_at,
        };
      });

      setAgents(loadedAgents);
      setIsLoadingAgents(false);
    }

    void loadAgents();

    return () => {
      isMounted = false;
    };
  }, [session, contacts]);

  async function handleUpdateAgent(updatedAgent: Agent) {
    if (!session) return;

    const { data, error } = await supabase
      .from("agents")
      .update({
        name: updatedAgent.name,
        contact_id: updatedAgent.contactId || null,
        instructions: updatedAgent.instructions,
        message_template: updatedAgent.messageTemplate,
        status: updatedAgent.status,
        next_scheduled_at: updatedAgent.nextScheduledAt || null,
      })
      .eq("id", updatedAgent.id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update agent:", error.message);
      window.alert("Could not update agent. Please try again.");
      return;
    }

    const savedAgent: Agent = {
      id: data.id,
      name: data.name,
      contactId: data.contact_id ?? "",
      contactName:
        contacts.find((contact) => contact.id === data.contact_id)?.name ?? "",
      instructions: data.instructions,
      messageTemplate: data.message_template,
      status: data.status as Agent["status"],
      nextScheduledAt: data.next_scheduled_at,
      createdAt: data.created_at,
    };

    try {
      await syncScheduledMessage({
        userId: session.user.id,
        agent: savedAgent,
      });
      await refreshScheduledMessageCount();
    } catch (error) {
      console.error("Scheduling failed:", error);

      window.alert(
        "The agent was saved, but its scheduled message could not be created. Please try again.",
      );
    }

    setAgents((currentAgents) => [savedAgent, ...currentAgents]);
    setIsCreatingAgent(false);

    setAgents((currentAgents) =>
      currentAgents.map((agent) =>
        agent.id === savedAgent.id ? savedAgent : agent,
      ),
    );

    setEditingAgent(null);
  }

  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    async function loadScheduledMessages() {
      setIsLoadingScheduledMessages(true);

      const { data, error } = await supabase
        .from("scheduled_messages")
        .select(
          `
        id,
        agent_id,
        contact_id,
        message_text,
        scheduled_at,
        status,
        created_at
      `,
        )
        .eq("user_id", session!.user.id)
        .eq("status", "pending")
        .order("scheduled_at", { ascending: true });

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load scheduled messages:", error.message);
        setIsLoadingScheduledMessages(false);
        return;
      }

      const loadedMessages: ScheduledMessage[] = (data ?? []).map((row) => ({
        id: row.id,
        agentId: row.agent_id,
        contactId: row.contact_id,
        contactName:
          contacts.find((contact) => contact.id === row.contact_id)?.name ??
          "Unknown contact",
        agentName:
          agents.find((agent) => agent.id === row.agent_id)?.name ??
          "Unknown agent",
        messageText: row.message_text,
        scheduledAt: row.scheduled_at,
        status: row.status as ScheduledMessage["status"],
        createdAt: row.created_at,
      }));

      setScheduledMessages(loadedMessages);
      setIsLoadingScheduledMessages(false);
    }

    void loadScheduledMessages();

    return () => {
      isMounted = false;
    };
  }, [session, contacts, agents]);

  async function handleCancelScheduledMessage(messageId: string) {
    if (!session) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this scheduled message?",
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("scheduled_messages")
      .update({ status: "cancelled" })
      .eq("id", messageId)
      .eq("user_id", session.user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Failed to cancel scheduled message:", error.message);
      window.alert("Could not cancel the message. Please try again.");
      return;
    }

    setScheduledMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== messageId),
    );

    await refreshScheduledMessageCount();
  }

  async function handleToggleAgentStatus(agentId: string) {
    if (!session) return;

    const agent = agents.find((item) => item.id === agentId);

    if (!agent) return;

    const newStatus = agent.status === "active" ? "paused" : "active";

    // First, save the new status in Supabase.
    const { error } = await supabase
      .from("agents")
      .update({ status: newStatus })
      .eq("id", agentId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Failed to change agent status:", error.message);
      window.alert("Could not update agent status.");
      return;
    }

    // Create an updated version of the agent.
    const updatedAgent: Agent = {
      ...agent,
      status: newStatus,
    };

    // Synchronise the scheduled message with the new status.
    try {
      await syncScheduledMessage({
        userId: session.user.id,
        agent: updatedAgent,
      });
      await refreshScheduledMessageCount();
    } catch (error) {
      console.error("Failed to sync scheduled message:", error);

      window.alert(
        "The agent status was updated, but its scheduled message could not be synchronised. Please check the schedule before continuing.",
      );
    }

    // Update the interface.
    setAgents((currentAgents) =>
      currentAgents.map((item) => (item.id === agentId ? updatedAgent : item)),
    );
  }

  async function handleDeleteAgent(agentId: string) {
    if (!session) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this agent? Any pending scheduled message will also be cancelled.",
    );

    if (!confirmed) return;

    // First, cancel any pending messages belonging to this agent.
    const { error: cancelError } = await supabase
      .from("scheduled_messages")
      .update({ status: "cancelled" })
      .eq("user_id", session.user.id)
      .eq("agent_id", agentId)
      .eq("status", "pending");

    if (cancelError) {
      console.error(
        "Failed to cancel the agent's scheduled messages:",
        cancelError.message,
      );

      window.alert(
        "Could not cancel the agent's scheduled messages. The agent was not deleted.",
      );
      return;
    }

    // Next, delete the agent from Supabase.
    const { error: deleteError } = await supabase
      .from("agents")
      .delete()
      .eq("id", agentId)
      .eq("user_id", session.user.id);

    if (deleteError) {
      console.error("Failed to delete agent:", deleteError.message);

      window.alert(
        "The scheduled message was cancelled, but the agent could not be deleted. Please try again.",
      );

      return;
    }

    // Update the interface after successful database operations.
    setAgents((currentAgents) =>
      currentAgents.filter((agent) => agent.id !== agentId),
    );

    setScheduledMessages((currentMessages) =>
      currentMessages.filter((message) => message.agentId !== agentId),
    );

    await refreshScheduledMessageCount();
  }

  async function handleCreateContact(contact: Contact) {
    if (!session) return;

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        user_id: session.user.id,
        name: contact.name,
        relationship: contact.relationship,
        phone_number: contact.phoneNumber,
        notes: contact.notes,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create contact:", error.message);
      window.alert("Could not save contact. Please try again.");
      return;
    }

    const savedContact: Contact = {
      id: data.id,
      name: data.name,
      relationship: data.relationship,
      phoneNumber: data.phone_number,
      notes: data.notes,
      createdAt: data.created_at,
    };

    setContacts((currentContacts) => [savedContact, ...currentContacts]);

    setIsCreatingContact(false);
  }

  async function handleDeleteContact(contactId: string) {
    if (!session) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?",
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contactId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Failed to delete contact:", error.message);
      window.alert("Could not delete contact. Please try again.");
      return;
    }

    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== contactId),
    );
  }

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kinora-background text-kinora-text">
        <p className="text-kinora-muted">Loading Kinora...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="flex min-h-screen bg-kinora-background text-kinora-text">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium text-kinora-primary">
              {new Date().toLocaleDateString("en-ZA", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {new Date().getHours() < 12
                    ? "Good morning!"
                    : new Date().getHours() < 18
                      ? "Good afternoon!"
                      : "Good evening!"}
                </h2>
                <p className="mt-2 text-kinora-muted">
                  Here's what's happening with your personal messaging.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();

                    if (error) {
                      console.error("Sign out failed:", error.message);
                    }
                  }}
                  className="rounded-xl border border-kinora-border px-4 py-3 text-sm font-semibold transition hover:bg-kinora-background"
                >
                  Sign out
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreatingAgent(true)}
                  className="rounded-xl bg-kinora-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  + Create an agent
                </button>
              </div>
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
                  value: String(
                    agents.filter((agent) => agent.status === "active").length,
                  ),
                  detail: "Your personal assistants",
                },
                {
                  label: "Scheduled messages",
                  value: String(scheduledMessageCount),
                  detail: "Pending messages",
                },
                {
                  label: "Messages sent",
                  value: String(sentMessageCount),
                  detail: "Successfully delivered",
                },
                {
                  label: "Contacts",
                  value: String(contacts.length),
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

              {isLoadingAgents ? (
                <p className="text-sm text-kinora-muted">
                  Loading your agents...
                </p>
              ) : (
                <AgentList
                  agents={agents}
                  onEdit={(agent) => {
                    setIsCreatingAgent(false);
                    setEditingAgent(agent);
                  }}
                  onToggleStatus={handleToggleAgentStatus}
                  onDelete={handleDeleteAgent}
                />
              )}
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

              {isLoadingContacts ? (
                <p className="text-sm text-kinora-muted">
                  Loading your contacts...
                </p>
              ) : (
                <ContactList
                  contacts={contacts}
                  onDelete={handleDeleteContact}
                />
              )}
            </section>

            <UpcomingMessages
              messages={scheduledMessages}
              isLoading={isLoadingScheduledMessages}
              onCancel={handleCancelScheduledMessage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
