import { PenLine, Trash2 } from "lucide-react";
import type { Contact } from "./types";

interface Props {
  contact: Contact;
  onMessage: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ContactCard({ contact, onMessage, onDelete }: Props) {
  const initials = contact.name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join("").toUpperCase();
  return <article className="directory-row">
    <div aria-hidden="true" className="directory-avatar">{initials}</div>
    <div className="directory-person">
      <h3>{contact.name}</h3>
      <p>{[contact.relationship, contact.phoneNumber].filter(Boolean).join(" · ") || "No phone number saved"}</p>
      {contact.notes?.trim() && <details><summary>Personal notes</summary><p>{contact.notes}</p></details>}
    </div>
    <div className="directory-actions">
      {contact.phoneNumber?.trim() && <button type="button" className="compose-contact" onClick={() => onMessage(contact.id)} aria-label={`Compose a message to ${contact.name}`}><PenLine size={15} />Compose</button>}
      <button className="delete-contact" type="button" onClick={() => onDelete(contact.id)} title={`Delete ${contact.name}`} aria-label={`Delete ${contact.name}`}><Trash2 size={16} /></button>
    </div>
  </article>;
}
