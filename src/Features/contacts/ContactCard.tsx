
import type { Contact } from './types'

interface ContactCardProps {
  contact: Contact
  onDelete: (contactId: string) => void
}

function ContactCard({ contact, onDelete }: ContactCardProps) {
  const initials = contact.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return (
    <article className="rounded-2xl border border-kinora-border bg-white p-5 transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kinora-mint font-bold text-kinora-primary">
          {initials || '?'}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-kinora-text">{contact.name}</h3>
          <p className="mt-1 text-sm text-kinora-muted">
            {contact.relationship || 'Contact'}
          </p>
        </div>
      </div>

      {contact.phoneNumber && (
        <p className="mt-4 text-sm text-kinora-muted">
          {contact.phoneNumber}
        </p>
      )}

      {contact.notes && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-kinora-muted">
          {contact.notes}
        </p>
      )}

      <div className="mt-5 flex justify-end border-t border-kinora-border pt-4">
        <button
          type="button"
          onClick={() => {
            const confirmed = window.confirm(
              `Delete ${contact.name} from your contacts?`,
            )
            if (confirmed) onDelete(contact.id)
          }}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Delete contact
        </button>
      </div>
    </article>
  )
}

export default ContactCard
