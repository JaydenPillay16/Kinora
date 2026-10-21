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

  const relationshipStyles: Record<string, string> = {
    Partner:
      "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    Family:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    Friend: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    Colleague:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    Other:
      "border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)]",
    Contact:
      "border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)]",
  };

  const relationship = contact.relationship?.trim() || "Contact";

  const relationshipStyle =
    relationshipStyles[relationship] ??
    "border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)]";

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${contact.name} from your contacts? This action cannot be undone here.`,
    );

    if (confirmed) {
      onDelete(contact.id);
    }
  }

  return (
    <article className="surface group flex h-full flex-col overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Contact profile */}
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-lg font-bold tracking-wide text-[var(--app-primary)] ring-1 ring-inset ring-[var(--app-border)] transition duration-200 group-hover:scale-[1.03] dark:text-[var(--app-accent)]">
            {initials || "?"}
            <span
              aria-hidden="true"
              className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-accent)]"
            />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="break-words text-base font-semibold tracking-tight text-[var(--app-text)]">
              {contact.name}
            </h3>

            <span
              className={`mt-2 inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-medium ${relationshipStyle}`}
            >
              {relationship}
            </span>
          </div>

          <span
            className="shrink-0 pt-1 text-[var(--app-text-muted)] opacity-60 transition group-hover:opacity-100"
            title="Kinora contact"
            aria-label="Kinora contact"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20v-1.5a7 7 0 0 1 14 0V20z" />
            </svg>
          </span>
        </div>

        {/* Contact details */}
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-[var(--app-accent)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1z" />
              </svg>
            </span>

            <div className="min-w-0 flex-1 py-0.5">
              <p className="text-xs font-medium text-[var(--app-text-muted)]">
                Phone number
              </p>
              {contact.phoneNumber ? (
                <p className="mt-1 break-words text-sm font-medium text-[var(--app-text)]">
                  {contact.phoneNumber}
                </p>
              ) : (
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                  Not added yet
                </p>
              )}
            </div>
          </div>

          {contact.notes?.trim() ? (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-secondary)]/60 p-4">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-[var(--app-accent)]"
                  aria-hidden="true"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                </svg>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                  Personal notes
                </p>
              </div>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--app-text)]">
                {contact.notes}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--app-border)] px-3 py-3 text-sm text-[var(--app-text-muted)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add personal notes when needed
            </div>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between gap-3 border-t border-[var(--app-border)] bg-[var(--app-surface-secondary)]/30 px-5 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--app-text-muted)]">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-accent)]"
            aria-hidden="true"
          />
          <span>In your circle</span>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${contact.name}`}
          className="app-transition inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--app-text-muted)] hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:hover:text-red-400"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="m19 6-1 14H6L5 6" />
            <path d="M10 11v5M14 11v5" />
          </svg>
          Delete
        </button>
      </div>
    </article>
  );
}

export default ContactCard;
