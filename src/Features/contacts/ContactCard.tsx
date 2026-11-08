import { Heart, Phone, Plus, Trash2 } from "lucide-react";
import type { Contact } from "./types";

interface ContactCardProps {
  contact: Contact;
  onDelete: (contactId: string) => void;
}

function ContactCard({ contact, onDelete }: ContactCardProps) {
  const initials = contact.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const relationship = contact.relationship?.trim() || "Contact";

  return (
    <article className="contact-card surface group flex h-full flex-col overflow-hidden">
      <div className="flex-1 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-sm font-medium text-[var(--app-text)]">
            {initials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="break-words text-base font-medium text-[var(--app-text)]">
                {contact.name}
              </h3>
              <Heart className="contact-mark shrink-0" size={14} strokeWidth={1.7} aria-label="In your circle" />
            </div>
            <span className="mt-2 inline-flex max-w-full items-center rounded-md border border-[var(--app-border)] bg-[var(--app-surface-secondary)] px-2 py-1 text-xs font-medium text-[var(--app-text-muted)]">
              {relationship}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-4 border-t border-[var(--app-border)] pt-4">
          <div className="flex items-start gap-3">
            <Phone size={16} className="mt-0.5 shrink-0 text-[var(--app-text-muted)]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-[var(--app-text-muted)]">Phone number</p>
              <p className="mt-1 break-words text-sm text-[var(--app-text)]">
                {contact.phoneNumber || "Not added yet"}
              </p>
            </div>
          </div>

          {contact.notes?.trim() ? (
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-secondary)] p-3">
              <p className="text-xs font-medium text-[var(--app-text-muted)]">Personal notes</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--app-text)]">
                {contact.notes}
              </p>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
              <Plus size={14} aria-hidden="true" />
              Add notes when you have something to remember
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--app-border)] px-5 py-3">
        <p className="text-xs text-[var(--app-text-muted)]">In your circle</p>
        <button
          type="button"
          onClick={() => onDelete(contact.id)}
          aria-label={`Delete ${contact.name}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--app-text-muted)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-negative)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-negative)]"
        >
          <Trash2 size={15} aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  );
}

export default ContactCard;
