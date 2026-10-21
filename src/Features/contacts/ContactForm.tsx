
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Contact } from './types'

interface ContactFormProps {
  onCreate: (contact: Contact) => void
  onCancel: () => void
}

function ContactForm({ onCreate, onCancel }: ContactFormProps) {
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) return

    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: name.trim(),
      relationship: relationship.trim(),
      phoneNumber: phoneNumber.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    }

    onCreate(newContact)
  }

  return (
    <div className="rounded-2xl border border-kinora-border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-kinora-text">
          Add a contact
        </h3>
        <p className="mt-2 text-sm text-kinora-muted">
          Add someone you want Kinora to help you stay connected with.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">
            Full name *
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Alex Smith"
            required
            maxLength={100}
            className="w-full rounded-xl border border-kinora-border px-4 py-3 outline-none focus:border-kinora-accent focus:ring-2 focus:ring-kinora-mint"
          />
        </div>

        <div>
          <label htmlFor="contact-relationship" className="mb-2 block text-sm font-medium">
            Relationship
          </label>
          <select
            id="contact-relationship"
            value={relationship}
            onChange={(event) => setRelationship(event.target.value)}
            className="w-full rounded-xl border border-kinora-border bg-white px-4 py-3 outline-none focus:border-kinora-accent focus:ring-2 focus:ring-kinora-mint"
          >
            <option value="">Select a relationship</option>
            <option value="Partner">Partner</option>
            <option value="Family">Family</option>
            <option value="Friend">Friend</option>
            <option value="Colleague">Colleague</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium">
            Phone number (optional)
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+27..."
            maxLength={25}
            autoComplete="tel"
            className="w-full rounded-xl border border-kinora-border px-4 py-3 outline-none focus:border-kinora-accent focus:ring-2 focus:ring-kinora-mint"
          />
        </div>

        <div>
          <label htmlFor="contact-notes" className="mb-2 block text-sm font-medium">
            Notes (optional)
          </label>
          <textarea
            id="contact-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Interests, preferences, or useful context..."
            maxLength={1000}
            rows={3}
            className="w-full resize-y rounded-xl border border-kinora-border px-4 py-3 outline-none focus:border-kinora-accent focus:ring-2 focus:ring-kinora-mint"
          />
        </div>

        <p className="text-xs text-kinora-muted">
          Contact details are stored on a secure server and are only accessible to you. Kinora does not share your contacts with anyone.
        </p>

        <div className="flex justify-end gap-3 border-t border-kinora-border pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-kinora-border px-5 py-3 text-sm font-semibold hover:bg-kinora-background"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-kinora-primary px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Save contact
          </button>
        </div>
      </form>
    </div>
  )
}

export default ContactForm
