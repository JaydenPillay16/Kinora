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
import KinoraLogo from "./Components/branding/KinoraLogo";
import ThemeToggle from "./Components/branding/ThemeToggle";

import {
  Activity,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";

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

    setAgents((currentAgents) => {
      const alreadyExists = currentAgents.some(
        (agent) => agent.id === savedAgent.id,
      );

      if (!alreadyExists) {
        return [savedAgent, ...currentAgents];
      }

      return currentAgents.map((agent) =>
        agent.id === savedAgent.id ? savedAgent : agent,
      );
    });

    setIsCreatingAgent(false);
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
      <div className="app-transition flex min-h-screen items-center justify-center bg-[var(--app-background)] text-[var(--app-text)]">
        <p className="text-[var(--app-text-muted)]">Loading Kinora...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="app-transition flex min-h-screen bg-[var(--app-background)] text-[var(--app-text)]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-3 sm:px-8">
          <KinoraLogo size={40} showTagline />
          <ThemeToggle />
        </div>

        <Header />

        <main className="flex-1 px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-sm font-semibold text-[var(--app-accent)]">
              {new Date().toLocaleDateString("en-ZA", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--app-accent)]">
                  Your personal workspace
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--app-text)] sm:text-4xl">
                  {new Date().getHours() < 12
                    ? "Good morning!"
                    : new Date().getHours() < 18
                      ? "Good afternoon!"
                      : "Good evening!"}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--app-text-muted)] sm:text-base">
                  A little more thought, a little more connection. Here's your
                  overview of the people and messages that matter.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();

                    if (error) {
                      console.error("Sign out failed:", error.message);
                    }
                  }}
                  className="rounded-xl border border-[var(--app-border)] px-4 py-3 text-sm font-semibold text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text)]"
                >
                  Sign out
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingAgent(null);
                    setIsCreatingAgent(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
                >
                  <span aria-hidden="true" className="text-lg leading-none">
                    +
                  </span>
                  Create an agent
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

            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Active agents",
                  value: agents.filter((agent) => agent.status === "active")
                    .length,
                  detail: "Your personal assistants",
                  icon: Bot,
                  accent: "text-emerald-600 dark:text-emerald-300",
                  iconBg: "bg-emerald-500/10",
                },
                {
                  label: "Scheduled messages",
                  value: scheduledMessageCount,
                  detail: "Messages awaiting delivery",
                  icon: CalendarClock,
                  accent: "text-sky-600 dark:text-sky-300",
                  iconBg: "bg-sky-500/10",
                },
                {
                  label: "Messages sent",
                  value: sentMessageCount,
                  detail: "Successfully delivered",
                  icon: Send,
                  accent: "text-violet-600 dark:text-violet-300",
                  iconBg: "bg-violet-500/10",
                },
                {
                  label: "Contacts",
                  value: contacts.length,
                  detail: "People who matter to you",
                  icon: UsersRound,
                  accent: "text-rose-600 dark:text-rose-300",
                  iconBg: "bg-rose-500/10",
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <section
                    key={stat.label}
                    className="surface surface-hover group relative overflow-hidden rounded-2xl border border-[var(--app-border)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/[0.04] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--app-text-muted)]">
                          {stat.label}
                        </p>

                        <p className="mt-5 text-3xl font-bold tracking-tight text-[var(--app-text)] tabular-nums">
                          {stat.value}
                        </p>
                      </div>

                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.accent} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon size={21} strokeWidth={1.8} />
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${stat.iconBg.replace("/10", "")}`}
                      />
                      <p className="text-xs leading-5 text-[var(--app-text-muted)]">
                        {stat.detail}
                      </p>
                    </div>

                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[var(--app-accent)] transition-transform duration-300 group-hover:scale-x-100"
                    />
                  </section>
                );
              })}
            </div>

            <section className="surface relative mt-6 overflow-hidden rounded-3xl border border-[var(--app-border)] p-6 sm:p-8 lg:p-9">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[var(--app-accent)] opacity-[0.08] blur-3xl"
              />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-primary)] text-white shadow-lg shadow-emerald-950/10 dark:text-[#0b1713]">
                    <Heart size={25} strokeWidth={1.8} />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-accent)] text-white">
                      <Sparkles size={10} strokeWidth={2.5} />
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
                    {agents.length === 0
                      ? "A thoughtful start"
                      : "Your Kinora workspace"}
                  </p>

                  <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--app-text)] sm:text-2xl">
                    {agents.length === 0
                      ? "Make staying connected a little easier."
                      : "Small moments make meaningful connections."}
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--app-text-muted)]">
                    {agents.length === 0
                      ? "Create your first messaging agent to plan thoughtful messages, organise your schedule, and keep the people who matter close."
                      : "Manage your messaging assistants, review upcoming plans, and keep the important people in your life in mind."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingAgent(null);
                    setIsCreatingAgent(true);
                  }}
                  className="relative inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-3 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-surface-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)] sm:self-center"
                >
                  {agents.length === 0
                    ? "Create your first agent"
                    : "Create an agent"}
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[var(--app-text)]">
                    My Agents
                  </h2>
                  <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                    Your personal messaging assistants.
                  </p>
                </div>

                <span className="text-sm text-[var(--app-text-muted)]">
                  {agents.length} {agents.length === 1 ? "agent" : "agents"}
                </span>
              </div>

              {isLoadingAgents ? (
                <p className="text-sm text-[var(--app-text-muted)]">
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

            <section className="mt-12">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
                    Your personal circle
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--app-text)]">
                    My Contacts
                  </h2>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--app-text-muted)]">
                    Keep the important people in your life organised, with their
                    details and the little things you want to remember.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingContact(true)}
                  className="app-transition inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)] dark:text-[#0b1713] sm:self-auto"
                >
                  <span aria-hidden="true" className="text-lg leading-none">
                    +
                  </span>
                  Add contact
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
                <div className="surface rounded-2xl p-8">
                  <p className="text-sm text-[var(--app-text-muted)]">
                    Loading your contacts...
                  </p>
                </div>
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
