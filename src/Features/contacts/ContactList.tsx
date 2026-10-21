
import ContactCard from './ContactCard'
import type { Contact } from './types'

interface ContactListProps {
  contacts: Contact[]
  onDelete: (contactId: string) => void
}

function ContactList({ contacts, onDelete }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <section className="surface overflow-hidden rounded-2xl border border-dashed border-[var(--app-border)] px-6 py-14 text-center sm:py-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-2xl text-[var(--app-accent)]">
          ♡
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
          Your people
        </p>

        <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--app-text)]">
          Your circle starts here
        </h3>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--app-text-muted)]">
          Add someone important to you and start building a more thoughtful way
          to stay connected. Kinora helps you make room for the people who matter.
        </p>

        <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-2 text-xs text-[var(--app-text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)]" />
          <span>Start with one person</span>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Your contacts">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--app-text)]">
            Your people
          </h3>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            The people you want to stay close to.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-xs font-medium text-[var(--app-text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)]" />
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  )
}

export default ContactList
