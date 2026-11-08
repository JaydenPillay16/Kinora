import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  LoaderCircle,
  LogOut,
  Plus,
  UserRoundPlus,
} from "lucide-react";

import Sidebar from "./Components/layout/Sidebar";
import Header from "./Components/layout/Header";
import KinoraLogo from "./Components/branding/KinoraLogo";
import { useFeedback } from "./Components/feedback/FeedbackContext";
import LoadError from "./Components/feedback/LoadError";
import AgentList from "./Features/agents/AgentList";
import type { Agent } from "./Features/agents/types";
import AgentForm from "./Features/agents/AgentForm";
import ContactForm from "./Features/contacts/ContactForm";
import ContactList from "./Features/contacts/ContactList";
import type { Contact } from "./Features/contacts/types";
import AuthForm from "./Features/auth/AuthForm";
import { supabase } from "./lib/supabaseClient";
import type { ScheduledMessage } from "./Features/scheduling/types";
import { syncScheduledMessage } from "./Features/scheduling/schedulingService";
import UpcomingMessages from "./Features/scheduling/UpcomingMessages";
import WhatsAppTest from "./Features/whatsapp/WhatsAppTest";
import MessageHistory from "./Features/whatsapp/MessageHistory";

function App() {
  const { notify, confirm } = useFeedback();
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const accountCreationInProgress = useRef(false);

  const [scheduledMessageCount, setScheduledMessageCount] = useState(0);
  const [sentMessageCount, setSentMessageCount] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessage[]
  >([]);
  const [isLoadingScheduledMessages, setIsLoadingScheduledMessages] =
    useState(true);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [agentsLoadError, setAgentsLoadError] = useState(false);
  const [agentsRetryCount, setAgentsRetryCount] = useState(0);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [sendDraft, setSendDraft] = useState<{ contactId: string; message: string; agentName: string; key: number } | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [contactsLoadError, setContactsLoadError] = useState(false);
  const [contactsRetryCount, setContactsRetryCount] = useState(0);
  const [scheduledLoadError, setScheduledLoadError] = useState(false);
  const [scheduledRetryCount, setScheduledRetryCount] = useState(0);
  const [isCreatingContact, setIsCreatingContact] = useState(false);

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

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
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (accountCreationInProgress.current && event === "SIGNED_IN") return;
      setSession(newSession);
      setIsAuthLoading(false);
      setIsMobileMenuOpen(false);
      if (event === "SIGNED_OUT") {
        setSendDraft(null);
        setScheduledMessageCount(0);
        setSentMessageCount(0);
        setScheduledMessages([]);
        setAgents([]);
        setContacts([]);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    const sectionIds = ["overview", "analytics", "agents", "contacts", "schedule", "history"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
        if (visibleSections[0]) setActiveSection(visibleSections[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.1, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [session]);

  // --------------------------------------------------
  // SCHEDULED MESSAGE STATISTICS
  // --------------------------------------------------

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
      notify("Could not refresh the number of upcoming messages.", "error");
      return;
    }

    setScheduledMessageCount(count ?? 0);
  }

  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    async function loadMessageStats() {
      const scheduledResult = await supabase
          .from("scheduled_messages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session!.user.id)
          .eq("status", "pending");

      if (!isMounted) return;

      if (scheduledResult.error) {
        console.error(
          "Failed to load scheduled message count:",
          scheduledResult.error.message,
        );
        notify("Could not load your upcoming-message total.", "error");
      } else {
        setScheduledMessageCount(scheduledResult.count ?? 0);
      }

    }

    void loadMessageStats();

    return () => {
      isMounted = false;
    };
  }, [session, notify]);

  // --------------------------------------------------
  // CONTACTS
  // --------------------------------------------------

  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    async function loadContacts() {
      setIsLoadingContacts(true);
      setContactsLoadError(false);

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load contacts:", error.message);
        setContactsLoadError(true);
        notify("Could not load your contacts. Refresh the page to try again.", "error");
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
      setContactsLoadError(false);

      setIsLoadingContacts(false);
    }

    void loadContacts();

    return () => {
      isMounted = false;
    };
  }, [session, notify, contactsRetryCount]);

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
      notify("Could not save the contact. Please try again.", "error");
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
    notify("Contact added to your circle.", "success");
  }

  async function handleDeleteContact(contactId: string) {
    if (!session) return;

    const confirmed = await confirm({
      title: "Delete this contact?",
      message: "This contact will be removed from your Kinora circle. If an agent uses this contact, review that agent after deletion.",
      cancelLabel: "Keep contact",
      confirmLabel: "Delete contact",
      danger: true,
    });

    if (!confirmed) return;

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contactId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Failed to delete contact:", error.message);
      notify("Could not delete the contact. Please try again.", "error");
      return;
    }

    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== contactId),
    );
    notify("Contact removed from your circle.", "success");
  }

  // --------------------------------------------------
  // AGENTS
  // --------------------------------------------------

  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    async function loadAgents() {
      setIsLoadingAgents(true);
      setAgentsLoadError(false);

      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load agents:", error.message);
        setAgentsLoadError(true);
        notify("Could not load your messaging agents. Refresh the page to try again.", "error");
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
      setAgentsLoadError(false);
      setIsLoadingAgents(false);
    }

    void loadAgents();

    return () => {
      isMounted = false;
    };
  }, [session, contacts, notify, agentsRetryCount]);

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
      notify("Could not save the agent. Please try again.", "error");
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

    let scheduleSynced = true;
    try {
      await syncScheduledMessage({
        userId: session.user.id,
        agent: savedAgent,
      });

      await refreshScheduledMessageCount();
    } catch (error) {
      console.error("Scheduling failed:", error);
      scheduleSynced = false;
    }

    setAgents((currentAgents) => [savedAgent, ...currentAgents]);

    setIsCreatingAgent(false);
    notify(
      scheduleSynced
        ? "Your messaging agent has been created."
        : "Agent created, but its scheduled message needs attention.",
      scheduleSynced ? "success" : "error",
    );
  }

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
      notify("Could not update the agent. Please try again.", "error");
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

    let scheduleSynced = true;
    try {
      await syncScheduledMessage({
        userId: session.user.id,
        agent: savedAgent,
      });

      await refreshScheduledMessageCount();
    } catch (error) {
      console.error("Scheduling failed:", error);
      scheduleSynced = false;
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
    notify(
      scheduleSynced
        ? "Agent details saved."
        : "Agent saved, but its scheduled message needs attention.",
      scheduleSynced ? "success" : "error",
    );
  }

  async function handleToggleAgentStatus(agentId: string) {
    if (!session) return;

    const agent = agents.find((item) => item.id === agentId);

    if (!agent) return;

    const newStatus = agent.status === "active" ? "paused" : "active";

    const { error } = await supabase
      .from("agents")
      .update({ status: newStatus })
      .eq("id", agentId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Failed to change agent status:", error.message);
      notify("Could not update the agent status. Please try again.", "error");
      return;
    }

    const updatedAgent: Agent = {
      ...agent,
      status: newStatus,
    };

    let scheduleSynced = true;
    try {
      await syncScheduledMessage({
        userId: session.user.id,
        agent: updatedAgent,
      });

      await refreshScheduledMessageCount();
    } catch (error) {
      console.error("Failed to sync scheduled message:", error);
      scheduleSynced = false;
    }

    setAgents((currentAgents) =>
      currentAgents.map((item) => (item.id === agentId ? updatedAgent : item)),
    );
    notify(
      scheduleSynced
        ? `Agent ${newStatus === "active" ? "activated" : "paused"}.`
        : `Agent ${newStatus === "active" ? "activated" : "paused"}, but its schedule needs attention.`,
      scheduleSynced ? "success" : "error",
    );
  }

  async function handleDeleteAgent(agentId: string) {
    if (!session) return;

    const agentToDelete = agents.find((agent) => agent.id === agentId);
    const confirmed = await confirm({
      title: "Delete this agent?",
      message: `Delete ${agentToDelete?.name ?? "this agent"} and cancel any pending messages linked to it?`,
      cancelLabel: "Keep agent",
      confirmLabel: "Delete agent",
      danger: true,
    });

    if (!confirmed) return;

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

      notify("The agent was not deleted because its scheduled messages could not be cancelled.", "error");

      return;
    }

    const { error: deleteError } = await supabase
      .from("agents")
      .delete()
      .eq("id", agentId)
      .eq("user_id", session.user.id);

    if (deleteError) {
      console.error("Failed to delete agent:", deleteError.message);

      notify("The pending message was cancelled, but the agent could not be deleted. Please try again.", "error");

      return;
    }

    setAgents((currentAgents) =>
      currentAgents.filter((agent) => agent.id !== agentId),
    );

    setScheduledMessages((currentMessages) =>
      currentMessages.filter((message) => message.agentId !== agentId),
    );

    await refreshScheduledMessageCount();
    notify("Agent deleted and pending messages cancelled.", "success");
  }

  // --------------------------------------------------
  // SCHEDULED MESSAGES
  // --------------------------------------------------

  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    async function loadScheduledMessages() {
      setIsLoadingScheduledMessages(true);
      setScheduledLoadError(false);

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
        setScheduledLoadError(true);
        notify("Could not load your upcoming messages. Refresh the page to try again.", "error");

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
      setScheduledLoadError(false);
      setIsLoadingScheduledMessages(false);
    }

    void loadScheduledMessages();

    return () => {
      isMounted = false;
    };
  }, [session, contacts, agents, notify, scheduledRetryCount]);

  async function handleCancelScheduledMessage(messageId: string) {
    if (!session) return;

    const confirmed = await confirm({
      title: "Cancel this message?",
      message: "It will be removed from your upcoming schedule. You can plan a new one at any time.",
      cancelLabel: "Keep message",
      confirmLabel: "Cancel message",
      danger: true,
    });

    if (!confirmed) return;

    const { error } = await supabase
      .from("scheduled_messages")
      .update({ status: "cancelled" })
      .eq("id", messageId)
      .eq("user_id", session.user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Failed to cancel scheduled message:", error.message);

      notify("Could not cancel the message. Please try again.", "error");
      return;
    }

    setScheduledMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== messageId),
    );

    await refreshScheduledMessageCount();
    notify("Scheduled message cancelled.", "success");
  }

  // --------------------------------------------------
  // LOADING AND AUTHENTICATION SCREENS
  // --------------------------------------------------

  if (isAuthLoading) {
    return (
      <div className="auth-loading-screen app-transition flex min-h-screen flex-col items-center justify-center gap-5 bg-[var(--app-background)] text-[var(--app-text)]">
        <KinoraLogo size={52} showTagline />
        <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]"><LoaderCircle size={16} className="animate-spin text-[var(--app-accent)]" />Preparing your space…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthForm
        onAccountCreationStart={() => { accountCreationInProgress.current = true; }}
        onAccountCreationComplete={() => { accountCreationInProgress.current = false; }}
      />
    );
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (
    <div className="app-transition app-shell flex min-h-screen bg-[var(--app-background)] text-[var(--app-text)]">
      {/* Mobile navigation backdrop and drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-[2px]"
          />

          <div className="app-transition absolute inset-y-0 left-0 max-w-[85vw] overflow-y-auto">
            <Sidebar activeSection={activeSection} onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 self-start lg:block">
        <Sidebar activeSection={activeSection} />
      </div>

      {/* Main application area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          activeSection={activeSection}
          isMobileMenuOpen={isMobileMenuOpen}
          onMenuClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-[1440px]">
            {/* Welcome section */}
            <div id="overview" className="dashboard-intro scroll-mt-28 relative flex flex-col gap-7 overflow-hidden rounded-2xl border border-[var(--app-border)] px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-9">
              <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-[var(--app-accent)] opacity-[0.10] blur-3xl" />
              <div className="min-w-0">
                <h2 className="greeting-title text-4xl font-medium tracking-[-0.035em] text-[var(--app-text)] sm:text-5xl">
                  Your circle
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--app-text-muted)] sm:text-base">
                  Keep important details close and make time for the messages you plan to send.
                </p>
              </div>

              <div className="relative flex shrink-0 flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();

                    if (error) {
                      console.error("Sign out failed:", error.message);
                      notify("Could not sign out. Please try again.", "error");
                    }
                  }}
                  className="hero-secondary-action group inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-medium text-[var(--app-text-muted)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
                >
                  <LogOut size={16} className="hero-button-icon" aria-hidden="true" />
                  Sign out
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingAgent(null);
                    setIsCreatingAgent(true);
                  }}
                    className="primary-action hero-primary-action group inline-flex items-center justify-center gap-2.5 rounded-lg bg-[var(--app-primary)] px-5 py-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
                >
                  <span aria-hidden="true" className="hero-plus flex h-6 w-6 items-center justify-center rounded-lg bg-white/15">
                    <Plus size={16} strokeWidth={2.3} />
                  </span>
                  Create an agent
                </button>
              </div>
            </div>

            {/* Agent creation and editing form */}
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

            {/* Dashboard statistics */}
            <section id="analytics" aria-label="Workspace totals" className="analytics-grid mt-8 scroll-mt-28 grid grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Active agents",
                  value: agents.filter((agent) => agent.status === "active")
                    .length,
                  detail: "Currently active",
                },
                {
                  label: "Scheduled messages",
                  value: scheduledMessageCount,
                  detail: "Saved plans awaiting delivery",
                },
                {
                  label: "Messages delivered",
                  value: sentMessageCount,
                  detail: "Confirmed by WhatsApp",
                },
                {
                  label: "Contacts",
                  value: contacts.length,
                  detail: "Saved people",
                },
              ].map((stat) => {
                return (
                  <div key={stat.label} className="stat-card relative min-w-0 p-5 sm:p-6">
                    <div>
                      <p className="text-sm font-medium text-[var(--app-text-muted)]">
                        {stat.label}
                      </p>

                      <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--app-text)] tabular-nums">
                        {stat.value}
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm leading-5 text-[var(--app-text-muted)]">
                        {stat.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* My agents */}
            <section id="agents" className="agent-section content-section mt-10 scroll-mt-28">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-medium text-[var(--app-text)] sm:text-[26px]">
                    My agents
                  </h2>

                  <p className="mt-1.5 text-sm text-[var(--app-text-muted)]">
                    Draft messages and plan when to reach out.
                  </p>
                </div>

                <span className="agent-count-badge inline-flex shrink-0 items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-xs font-medium text-[var(--app-text-muted)]">
                  {agents.length} {agents.length === 1 ? "agent" : "agents"}
                </span>
              </div>

              {agentsLoadError ? (
                <LoadError title="Your agents" onRetry={() => setAgentsRetryCount((count) => count + 1)} />
              ) : isLoadingAgents ? (
                <p className="text-sm text-[var(--app-text-muted)]">
                  Loading your agents...
                </p>
              ) : (
                <AgentList
                  onSendNow={(agent) => {
                    setSendDraft({ contactId: agent.contactId, message: agent.messageTemplate, agentName: agent.name, key: Date.now() });
                    document.getElementById("whatsapp-composer")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
                  }}
                  agents={agents}
                  onCreate={() => {
                    setEditingAgent(null);
                    setIsCreatingAgent(true);
                  }}
                  onEdit={(agent) => {
                    setIsCreatingAgent(false);
                    setEditingAgent(agent);
                  }}
                  onToggleStatus={handleToggleAgentStatus}
                  onDelete={handleDeleteAgent}
                />
              )}
            </section>

            {/* My contacts */}
            <section id="contacts" className="content-section mt-12 scroll-mt-28">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-2xl font-medium text-[var(--app-text)] sm:text-[28px]">
                    Contacts
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--app-text-muted)]">
                    Keep their details and the things you want to remember in one place.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingContact(true)}
                  className="contact-add-action group relative inline-flex items-center justify-center gap-2 self-start overflow-hidden rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)] sm:self-auto"
                >
                  <span aria-hidden="true" className="contact-add-icon flex h-5 w-5 items-center justify-center">
                    <UserRoundPlus size={16} strokeWidth={2} />
                  </span>
                  <span>Add contact</span>
                  <span aria-hidden="true" className="contact-add-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] opacity-0 transition duration-700 group-hover:left-[130%] group-hover:opacity-100" />
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

              {contactsLoadError ? (
                <LoadError title="Your contacts" onRetry={() => setContactsRetryCount((count) => count + 1)} />
              ) : isLoadingContacts ? (
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

            {/* Upcoming scheduled messages */}
            <UpcomingMessages
              messages={scheduledMessages}
              isLoading={isLoadingScheduledMessages}
              loadError={scheduledLoadError}
              onRetry={() => setScheduledRetryCount((count) => count + 1)}
              onCancel={handleCancelScheduledMessage}
              onCreatePlan={() => {
                setEditingAgent(null);
                setIsCreatingAgent(true);
              }}
            />

            <section id="history" className="history-section mt-12 scroll-mt-28">
              <div className="mb-5">
                <h2 className="text-2xl font-medium text-[var(--app-text)] sm:text-[26px]">Message history</h2>
                <p className="mt-1.5 text-sm text-[var(--app-text-muted)]">Check whether WhatsApp accepted, sent, delivered, or read a message.</p>
              </div>
              <MessageHistory userId={session.user.id} refreshKey={historyRefreshKey} onDeliveredCount={setSentMessageCount} />
            </section>

            {/* WhatsApp Cloud API integration test */}
            <section id="whatsapp-composer" className="mt-10 scroll-mt-28">
              <WhatsAppTest key={sendDraft?.key ?? "manual"} contacts={contacts} initialDraft={sendDraft ?? undefined} onSendComplete={() => setHistoryRefreshKey((value) => value + 1)} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
