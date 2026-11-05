
import { useState, type FormEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import type { Contact } from "../contacts/types";

export default function WhatsAppTest({ contacts }: { contacts: Contact[] }) {
  const [selectedContactId, setSelectedContactId] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [isError, setIsError] = useState(false);

  const sendTestMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult("");
    setIsError(false);

    const selectedContact = contacts.find((contact) => contact.id === selectedContactId);
    if (!selectedContact) {
      setIsError(true);
      setResult("Choose a saved contact first.");
      return;
    }

    const normalizedPhone = selectedContact.phoneNumber.replace(/\D/g, "");

    if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
      setIsError(true);
      setResult("Enter a valid international number with 8 to 15 digits, including the country code.");
      return;
    }

    setSending(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsError(true);
        setResult("You must be logged in to Kinora.");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "send-whatsapp-message",
        {
          body: {
            to: normalizedPhone,
            name: selectedContact.name.trim().split(/\s+/)[0],
          },
        },
      );

      if (error) {
        let details = error.message;

        if ("context" in error && error.context instanceof Response) {
          const responseBody = await error.context.json().catch(() => null);
          details = responseBody?.error ?? details;
        }

        throw new Error(details);
      }

      if (!data?.success) {
        throw new Error(data?.error ?? "Message was not accepted.");
      }

      setResult(
        `WhatsApp API accepted the message. ID: ${data.messageId ?? "N/A"}`,
      );
    } catch (error) {
      setIsError(true);
      setResult(
        error instanceof Error ? error.message : "Unknown error occurred.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="surface space-y-5 rounded-[24px] p-5 sm:p-7">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-accent)]">Integration check</p>
        <h2 className="text-xl font-semibold tracking-tight">WhatsApp connection</h2>
        <p className="muted-text mt-1 text-sm">
          Send a test message through Kinora's WhatsApp integration.
        </p>
      </div>

      <form onSubmit={sendTestMessage} className="grid gap-4 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-2">
          <label htmlFor="whatsapp-test-contact" className="block text-sm font-semibold text-[var(--app-text)]">Test recipient</label>
          <select id="whatsapp-test-contact" required value={selectedContactId} onChange={(event) => setSelectedContactId(event.target.value)} className="auth-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition">
            <option value="">Choose a saved contact</option>
            {contacts.filter((contact) => contact.phoneNumber.trim()).map((contact) => (
              <option key={contact.id} value={contact.id}>{contact.name} · {contact.phoneNumber}</option>
            ))}
          </select>
          <p className="text-xs leading-5 text-[var(--app-text-muted)]">For now, the Edge Function only allows your configured test recipient.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[var(--app-text)]">Template preview</label>
          <div className="auth-input min-h-[108px] rounded-xl border px-4 py-3 text-sm leading-6" aria-live="polite">
            Good morning, {contacts.find((contact) => contact.id === selectedContactId)?.name.trim().split(/\s+/)[0] || "there"}! 🌞 💚<br />
            Wishing you a wonderful day ahead. Hope today brings you happiness and positivity!<br />
            Sent with love through Kinora.<br /><span className="text-[var(--app-text-muted)]">Thanks</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:col-span-2 sm:flex-row sm:items-center">
          <button type="submit" disabled={sending} className="auth-submit inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60">
            {sending ? <><LoaderCircle size={16} className="animate-spin" />Sending test…</> : <><Send size={15} />Send test message</>}
          </button>

          {result && <p role={isError ? "alert" : "status"} className={`text-sm leading-5 ${isError ? "text-rose-600 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>{result}</p>}
        </div>
      </form>
    </section>
  );
}
