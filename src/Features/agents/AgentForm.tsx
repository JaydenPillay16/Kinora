import { useState } from "react";
import type { FormEvent } from "react";
import type { Agent } from "./types";
import type { Contact } from "../contacts/types";

interface AgentFormProps {
  contacts: Contact[];
  onCreate: (agent: Agent) => void;
  onCancel: () => void;
  initialAgent?: Agent;
  onUpdate?: (agent: Agent) => void;
}

function toLocalDateTimeValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

const inputStyles =
  "w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-focus-ring)] focus:ring-2 focus:ring-[var(--app-focus-ring)]/20";

const labelStyles = "mb-2 block text-sm font-semibold text-[var(--app-text)]";

function AgentForm({
  contacts,
  onCreate,
  onCancel,
  initialAgent,
  onUpdate,
}: AgentFormProps) {
  const [name, setName] = useState(initialAgent?.name ?? "");
  const [contactName, setContactName] = useState(
    initialAgent?.contactName ?? "",
  );
  const [instructions, setInstructions] = useState(
    initialAgent?.instructions ?? "",
  );
  const [messageTemplate, setMessageTemplate] = useState(
    initialAgent?.messageTemplate ?? "",
  );
  const [contactId, setContactId] = useState(initialAgent?.contactId ?? "");
  const [scheduledAt, setScheduledAt] = useState(() =>
    initialAgent?.nextScheduledAt
      ? toLocalDateTimeValue(new Date(initialAgent.nextScheduledAt))
      : "",
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (scheduledAt && new Date(scheduledAt).getTime() <= Date.now()) {
      window.alert("Please choose a future date and time.");
      return;
    }

    if (
      !name.trim() ||
      !contactId ||
      !contactName.trim() ||
      !instructions.trim() ||
      !messageTemplate.trim()
    ) {
      return;
    }

    if (initialAgent && onUpdate) {
      onUpdate({
        ...initialAgent,
        name: name.trim(),
        contactId,
        contactName: contactName.trim(),
        instructions: instructions.trim(),
        nextScheduledAt: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : null,
        messageTemplate: messageTemplate.trim(),
      });
      return;
    }

    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name: name.trim(),
      contactId,
      contactName: contactName.trim(),
      instructions: instructions.trim(),
      messageTemplate: messageTemplate.trim(),
      status: "draft",
      nextScheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      createdAt: new Date().toISOString(),
    };

    onCreate(newAgent);
  }

  const isEditing = Boolean(initialAgent);
  const selectedContact = contacts.find((contact) => contact.id === contactId);

  return (
    <section className="surface p-5 sm:p-8">
      {/* Form heading */}

      {/* Form heading */}
      <div className="mb-8 border-b border-[var(--app-border)] pb-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-xl text-[var(--app-accent)]">
          ✳
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
          Agent configuration
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--app-text)] sm:text-3xl">
          {isEditing ? "Edit your agent" : "Create a messaging agent"}
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--app-text-muted)]">
          {isEditing
            ? "Fine-tune your agent's instructions, recipient, and next scheduled message."
            : "Give your agent a purpose, choose who it's for, and create a message that feels personal."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Agent details */}
        <section className="space-y-5">
          <div className="border-b border-[var(--app-border)] pb-3">
            <h3 className="font-semibold text-[var(--app-text)]">
              Agent details
            </h3>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">
              Name your agent and choose the person it is for.
            </p>
          </div>

          <div>
            <label htmlFor="agent-name" className={labelStyles}>
              Agent name
            </label>
            <input
              id="agent-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Birthday reminders"
              required
              maxLength={60}
              className={inputStyles}
            />
            <p className="mt-1.5 text-right text-xs text-[var(--app-text-muted)]">
              {name.length}/60
            </p>
          </div>

          <div>
            <label htmlFor="agent-contact" className={labelStyles}>
              Contact
            </label>
            <select
              id="agent-contact"
              value={contactId}
              onChange={(event) => {
                const selectedId = event.target.value;
                setContactId(selectedId);

                const selected = contacts.find(
                  (contact) => contact.id === selectedId,
                );

                setContactName(selected?.name ?? "");
              }}
              required
              className={inputStyles}
            >
              <option value="">Choose a contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>

            {contacts.length === 0 && (
              <p className="mt-2 text-sm text-[var(--app-text-muted)]">
                Add a contact in My Contacts before creating an agent.
              </p>
            )}
          </div>
        </section>

        {/* Instructions */}
        <section className="space-y-5">
          <div className="border-b border-[var(--app-border)] pb-3">
            <h3 className="font-semibold text-[var(--app-text)]">
              Personality and instructions
            </h3>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">
              Explain the tone and purpose your agent should follow.
            </p>
          </div>

          <div>
            <label htmlFor="agent-instructions" className={labelStyles}>
              Agent instructions
            </label>
            <textarea
              id="agent-instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="e.g. Keep messages warm, genuine, and personal. Remember important milestones and avoid overly formal language."
              required
              maxLength={1000}
              rows={4}
              className={`${inputStyles} resize-y leading-6`}
            />
            <p className="mt-1.5 text-right text-xs text-[var(--app-text-muted)]">
              {instructions.length}/1000
            </p>
          </div>
        </section>

        {/* Message preview */}
        <section className="space-y-5">
          <div className="border-b border-[var(--app-border)] pb-3">
            <h3 className="font-semibold text-[var(--app-text)]">
              Example message
            </h3>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">
              Write an example to see how the message will look.
            </p>
          </div>

          <div>
            <label htmlFor="message-template" className={labelStyles}>
              Message template
            </label>
            <textarea
              id="message-template"
              value={messageTemplate}
              onChange={(event) => setMessageTemplate(event.target.value)}
              placeholder="Write a thoughtful example message..."
              required
              maxLength={2000}
              rows={4}
              className={`${inputStyles} resize-y leading-6`}
            />
            <p className="mt-1.5 text-right text-xs text-[var(--app-text-muted)]">
              {messageTemplate.length}/2000
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--app-border)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--app-border)] bg-[var(--app-surface-secondary)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--app-text)]">
                  Message preview
                </p>
                <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
                  {selectedContact
                    ? `To: ${selectedContact.name}`
                    : "Choose a contact to get started"}
                </p>
              </div>

              <span className="rounded-full border border-[var(--app-border)] px-2.5 py-1 text-xs font-semibold text-[var(--app-text-muted)]">
                Draft
              </span>
            </div>

            <div className="bg-[var(--app-background)] p-4 sm:p-5">
              <div className="max-w-lg rounded-2xl rounded-tl-sm border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--app-text)]">
                  {messageTemplate.trim() ||
                    "Your example message will appear here as you type."}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs leading-5 text-[var(--app-text-muted)]">
            Preview only. Saving this agent will not send a message.
          </p>
        </section>

        {/* Schedule */}
        <section className="space-y-4">
          <div className="border-b border-[var(--app-border)] pb-3">
            <h3 className="font-semibold text-[var(--app-text)]">Scheduling</h3>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">
              Optionally choose when the next message should be prepared.
            </p>
          </div>

          <div>
            <label htmlFor="agent-schedule" className={labelStyles}>
              Next message date and time
            </label>
            <input
              id="agent-schedule"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              min={toLocalDateTimeValue(new Date())}
              className={inputStyles}
            />
            <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
              This sets the next scheduled message. It does not send messages
              automatically from this form.
            </p>
          </div>
        </section>

        {/* Form actions */}
        <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--app-border)] pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="app-transition rounded-xl border border-[var(--app-border)] px-5 py-3 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-surface-secondary)]"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="app-transition rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)] dark:text-[#0b1713]"
          >
            {isEditing ? "Save changes" : "Create agent"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AgentForm;
