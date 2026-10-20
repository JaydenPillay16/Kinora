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
        contactId: contactId,
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
      contactId: contactId,
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

  return (
    <div className="rounded-2xl border border-kinora-border bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold">
          {isEditing ? "Edit agent" : "Create a messaging agent"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-kinora-muted">
          Update who your agent is for and how it should prepare messages.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="agent-name"
            className="mb-2 block text-sm font-medium"
          >
            Agent name
          </label>
          <input
            id="agent-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Birthday reminders"
            required
            maxLength={60}
            className="w-full rounded-xl border border-kinora-border px-4 py-3 outline-none focus:border-kinora-accent focus:ring-2 focus:ring-kinora-mint"
          />
        </div>

        <div>
          <label
            htmlFor="agent-contact"
            className="mb-2 block text-sm font-medium"
          >
            Contact *
          </label>

          <select
            id="agent-contact"
            value={contactId}
            onChange={(event) => {
              const selectedId = event.target.value;
              setContactId(selectedId);

              const selectedContact = contacts.find(
                (contact) => contact.id === selectedId,
              );

              setContactName(selectedContact?.name ?? "");
            }}
            required
            className="w-full rounded-xl border border-kinora-border bg-white px-4 py-3 outline-none focus:border-kinora-accent focus:ring-2 focus:ring-kinora-mint"
          >
            <option value="">Choose a contact</option>

            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>

          {contacts.length === 0 && (
            <p className="mt-2 text-sm text-kinora-muted">
              Add a contact in My Contacts before creating an agent.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="agent-instructions"
            className="mb-2 block text-sm font-medium"
          >
            Agent instructions
          </label>
          <textarea
            id="agent-instructions"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Describe the tone, purpose, and style of messages..."
            required
            maxLength={1000}
            rows={4}
            className="w-full resize-y rounded-xl border border-kinora-border px-4 py-3 outline-none focus:border-kinora-accent focus:ring-2 focus:ring-kinora-mint"
          />
        </div>

        <div>
          <label
            htmlFor="message-template"
            className="mb-2 block text-sm font-medium"
          >
            Example message
          </label>
          <textarea
            id="message-template"
            value={messageTemplate}
            onChange={(event) => setMessageTemplate(event.target.value)}
            placeholder="Write an example message for this agent..."
            required
            maxLength={2000}
            rows={3}
            className="w-full resize-y rounded-xl border border-kinora-border px-4 py-3 outline-none focus:border-kinora-accent focus:ring-2 focus:ring-kinora-mint"
          />
          <p className="mt-2 text-xs text-kinora-muted">
            Draft only. Saving an agent will not send a message.
          </p>
        </div>

        <div className="rounded-2xl border border-kinora-border bg-kinora-background p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="font-semibold text-kinora-text">Message preview</h4>
            <span className="rounded-full bg-kinora-mint px-3 py-1 text-xs font-semibold text-kinora-primary">
              Draft
            </span>
          </div>

          <div className="max-w-lg rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-medium text-kinora-muted">
              To:{" "}
              {contacts.find((contact) => contact.id === contactId)?.name ??
                "Choose a contact"}
            </p>

            <p className="whitespace-pre-wrap text-sm leading-6 text-kinora-text">
              {messageTemplate.trim() ||
                "Your example message will appear here as you type."}
            </p>
          </div>

          <p className="mt-3 text-xs text-kinora-muted">
            Preview only. Nothing is sent from this form.
          </p>
        </div>

        <div>
          <label
            htmlFor="agent-schedule"
            className="mb-2 block text-sm font-medium"
          >
            Schedule next message (optional)
          </label>

          <input
            id="agent-schedule"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            min={toLocalDateTimeValue(new Date())}
            className="w-full rounded-xl border border-kinora-border bg-white px-4 py-3 outline-none focus:border-kinora-accent focus:ring-2 focus:ring-kinora-mint"
          />

          <p className="mt-2 text-sm text-kinora-muted">
            Choose when this agent's next message should be prepared. Scheduling
            does not send messages yet.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-kinora-border pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-kinora-border px-5 py-3 text-sm font-semibold hover:bg-kinora-background"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-kinora-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            {isEditing ? "Save changes" : "Create agent"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgentForm;
