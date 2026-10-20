
import ContactCard from './ContactCard'
import type { Contact } from './types'

interface ContactListProps {
  contacts: Contact[]
  onDelete: (contactId: string) => void
}

function ContactList({ contacts, onDelete }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-kinora-border bg-white px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-kinora-mint text-xl text-kinora-primary">
          ♡
        </div>
        <h3 className="mt-4 font-semibold text-kinora-text">
          No contacts yet
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-kinora-muted">
          Add your first contact to start building your personal network in Kinora.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default ContactList
