
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Contact } from './types'

interface ContactFormProps {
  onCreate: (contact: Contact) => void
  onCancel: () => void
}

const inputStyles =
  'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-focus-ring)] focus:ring-2 focus:ring-[var(--app-focus-ring)]/20'

const labelStyles =
  'mb-2 block text-sm font-semibold text-[var(--app-text)]'

function ContactForm({ onCreate, onCancel }: ContactFormProps) {
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) return

    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: trimmedName,
      relationship: relationship.trim(),
      phoneNumber: phoneNumber.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    }

    onCreate(newContact)
  }

  return (
    <section className="surface overflow-hidden rounded-2xl p-5 sm:p-8">
      {/* Form heading */}
      <div className="mb-8 border-b border-[var(--app-border)] pb-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-secondary)] text-xl text-[var(--app-accent)]">
          ♙
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
          Your people
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--app-text)] sm:text-3xl">
          Add a contact
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--app-text-muted)]">
          Make room for the people who matter. Add a few details to help Kinora
          make staying connected feel more natural and personal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic information */}
        <section className="space-y-5">
          <div className="border-b border-[var(--app-border)] pb-3">
            <h3 className="font-semibold text-[var(--app-text)]">
              Basic information
            </h3>
            <p className="mt-1 text-sm leading-5 text-[var(--app-text-muted)]">
              Start with their name and how you know them.
            </p>
          </div>

          <div>
            <label htmlFor="contact-name" className={labelStyles}>
              Full name
            </label>

            <input
              id="contact-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Alex Smith"
              required
              maxLength={100}
              autoComplete="name"
              className={inputStyles}
            />

            <p className="mt-1.5 text-right text-xs tabular-nums text-[var(--app-text-muted)]">
              {name.length}/100
            </p>
          </div>

          <div>
            <label htmlFor="contact-relationship" className={labelStyles}>
              Relationship
              <span className="ml-2 font-normal text-[var(--app-text-muted)]">
                Optional
              </span>
            </label>

            <select
              id="contact-relationship"
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
              className={inputStyles}
            >
              <option value="">Select a relationship</option>
              <option value="Partner">Partner</option>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Colleague">Colleague</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </section>

        {/* Contact details */}
        <section className="space-y-5">
          <div className="border-b border-[var(--app-border)] pb-3">
            <h3 className="font-semibold text-[var(--app-text)]">
              Contact details
            </h3>
            <p className="mt-1 text-sm leading-5 text-[var(--app-text-muted)]">
              Add useful details to make their profile more personal.
            </p>
          </div>

          <div>
            <label htmlFor="contact-phone" className={labelStyles}>
              Phone number
              <span className="ml-2 font-normal text-[var(--app-text-muted)]">
                Optional
              </span>
            </label>

            <input
              id="contact-phone"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+27 00 000 0000"
              maxLength={25}
              autoComplete="tel"
              className={inputStyles}
            />

            <p className="mt-1.5 text-xs leading-5 text-[var(--app-text-muted)]">
              Include a country code if you may use this number for messaging.
            </p>
          </div>

          <div>
            <label htmlFor="contact-notes" className={labelStyles}>
              Personal notes
              <span className="ml-2 font-normal text-[var(--app-text-muted)]">
                Optional
              </span>
            </label>

            <textarea
              id="contact-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Their interests, important dates, preferences, or things you'd like to remember..."
              maxLength={1000}
              rows={4}
              className={`${inputStyles} resize-y leading-6`}
            />

            <p className="mt-1.5 text-right text-xs tabular-nums text-[var(--app-text-muted)]">
              {notes.length}/1000
            </p>
          </div>
        </section>

        {/* Privacy note */}
        <div className="flex gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-secondary)] p-4 sm:p-5">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-sm text-[var(--app-accent)]"
          >
            ◈
          </span>

          <div>
            <p className="text-sm font-semibold text-[var(--app-text)]">
              Keep personal details thoughtful
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--app-text-muted)]">
              Only store information you have a good reason to keep. Your
              privacy depends on your account access and the security policies
              protecting your stored data.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-[var(--app-border)] pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="app-transition rounded-xl border border-[var(--app-border)] px-5 py-3 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-surface-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="app-transition rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)] dark:text-[#0b1713]"
          >
            Save contact
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </button>
        </div>
      </form>
    </section>
  )
}

export default ContactForm
