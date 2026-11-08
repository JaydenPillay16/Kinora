import { useState } from "react";
import { BookUser, Search } from "lucide-react";
import ContactCard from "./ContactCard";
import type { Contact } from "./types";

interface Props {
  contacts: Contact[];
  onMessage: (id: string) => void;
  onDelete: (id: string) => void;
}

const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();

export default function ContactList({ contacts, onMessage, onDelete }: Props) {
  const [query, setQuery] = useState("");
  const term = normalize(query.trim());
  const digits = /^[+\d\s()-]+$/.test(term) ? term.replace(/\D/g, "") : "";
  const matches = contacts.filter(c =>
    normalize([c.name, c.relationship, c.phoneNumber].join(" ")).includes(term)
    || Boolean(digits && c.phoneNumber?.replace(/\D/g, "").includes(digits))
  ).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  if (!contacts.length) return <div className="directory-empty">
    <BookUser size={28} aria-hidden="true" /><h3>Your address book is empty</h3>
    <p>Add a contact above to keep their number and personal notes together.</p>
  </div>;

  return <section className="directory" aria-label="Address book">
    <div className="directory-tools">
      <label className="directory-search"><Search size={18} aria-hidden="true" />
        <span className="sr-only">Find a contact by name, relationship, or number</span>
        <input type="search" placeholder="Find a contact…" value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <span role="status">{term ? `${matches.length} of ${contacts.length}` : contacts.length} {contacts.length === 1 ? "contact" : "contacts"}</span>
    </div>
    {matches.length ? <ul>{matches.map(contact =>
      <li key={contact.id}><ContactCard contact={contact} onMessage={onMessage} onDelete={onDelete} /></li>)}</ul> :
      <div className="directory-empty"><h3>No matching contacts</h3><p>Try their name, relationship, or phone number.</p>
        <button type="button" onClick={() => setQuery("")}>Clear search</button></div>}
  </section>;
}
