
import ContactCard from './ContactCard'
import type { Contact } from './types'
import { Heart } from 'lucide-react'

interface ContactListProps {
  contacts: Contact[]
  onDelete: (contactId: string) => void
}

function ContactList({ contacts, onDelete }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <section className="surface overflow-hidden rounded-2xl border border-dashed border-[var(--app-border)] px-6 py-14 text-center sm:py-16">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-[var(--app-accent)]">
          <Heart size={19} strokeWidth={1.7} aria-hidden="true" />
        </div>

        <h3 className="mt-4 text-xl font-medium text-[var(--app-text)]">
          Your circle starts here
        </h3>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--app-text-muted)]">
          Add someone you want to keep in touch with, along with the details you want to remember.
        </p>

      </section>
    )
  }

  return (
    <section aria-label="Your contacts">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium tracking-tight text-[var(--app-text)]">
            Saved contacts
          </h3>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
          People and details you have saved.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text-muted)] shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)]" />
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </span>
      </div>

      <div className={`grid grid-cols-1 gap-4 sm:gap-5 ${contacts.length === 1 ? "lg:max-w-[620px]" : "md:grid-cols-2 2xl:grid-cols-3"}`}>
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
