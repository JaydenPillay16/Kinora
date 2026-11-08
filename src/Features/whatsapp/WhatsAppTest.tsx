
import { useEffect, useState, type FormEvent } from "react";
import { Clock3, LoaderCircle, MessageSquareText, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import type { Contact } from "../contacts/types";

export default function WhatsAppTest({ contacts, initialDraft, onSendComplete }: { contacts: Contact[]; initialDraft?: { contactId: string; message: string; agentName: string }; onSendComplete: () => void }) {
  const [selectedContactId, setSelectedContactId] = useState(initialDraft?.contactId ?? "");
  const [sendMode, setSendMode] = useState<"template" | "custom">(initialDraft ? "custom" : "template");
  const [customMessage, setCustomMessage] = useState(initialDraft?.message ?? "");
  const [customReady, setCustomReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [isError, setIsError] = useState(false);
  const [messageId, setMessageId] = useState("");

  useEffect(() => {
    let cancelled = false;
    void supabase.functions.invoke("send-whatsapp-message", { body: { action: "capabilities" } }).then(({ data, error }) => {
      if (!cancelled) {
        setCustomReady(!error && data?.customText === true);
        setChecking(false);
      }
    }).catch(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);

  const sendTestMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult("");
    setIsError(false);
    setMessageId("");

    if (sending) return;
    if (sendMode === "custom" && (!customReady || !customMessage.trim() || customMessage.length > 4096)) {
      setIsError(true);
      setResult(customReady ? "Write a message of up to 4,096 characters." : "Custom sending needs the updated WhatsApp function deployed in Supabase.");
      return;
    }

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
            contactId: selectedContact.id,
            name: selectedContact.name.trim().split(/\s+/)[0],
            mode: sendMode,
            message: sendMode === "custom" ? customMessage.trim() : undefined,
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
        data.trackingWarning ?? "Accepted by WhatsApp. Delivery is not confirmed yet; check Message history for updates.",
      );
      setMessageId(data.messageId ?? "");
    } catch (error) {
      setIsError(true);
      setResult(
        error instanceof Error ? error.message : "Unknown error occurred.",
      );
    } finally {
      setSending(false);
      onSendComplete();
    }
  };

  return (
    <section className="surface space-y-5 rounded-2xl p-5 sm:p-7">
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--app-accent)]">WhatsApp</p>
        <h2 className="text-xl font-medium tracking-tight">Send a message</h2>
        <p className="muted-text mt-1 text-sm">
          {initialDraft ? `Review the message from ${initialDraft.agentName}. Sending now does not change its saved plan.` : "Choose a contact, review your message, and send when you are ready."}
        </p>
      </div>

      <form onSubmit={sendTestMessage} className="grid gap-4">
        <fieldset disabled={sending} className="grid min-w-0 gap-4 disabled:opacity-70">
        <div className="space-y-2">
          <label htmlFor="whatsapp-test-contact" className="block text-sm font-medium text-[var(--app-text)]">Recipient</label>
          <select id="whatsapp-test-contact" required value={selectedContactId} onChange={(event) => setSelectedContactId(event.target.value)} className="auth-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition">
            <option value="">Choose a saved contact</option>
            {contacts.filter((contact) => contact.phoneNumber.trim()).map((contact) => (
              <option key={contact.id} value={contact.id}>{contact.name} · {contact.phoneNumber}</option>
            ))}
          </select>
          <p className="text-xs leading-5 text-[var(--app-text-muted)]">For now, the Edge Function only allows your configured test recipient.</p>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <span className="block text-sm font-semibold text-[var(--app-text)]">Message type</span>
          <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Message type">
            <button type="button" onClick={() => { setSendMode("template"); setResult(""); }} aria-pressed={sendMode === "template"} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${sendMode === "template" ? "border-[var(--app-accent)] bg-[var(--app-surface-secondary)]" : "border-[var(--app-border)] hover:border-[var(--app-accent)]"}`}>
              <Send size={17} className="mt-0.5 shrink-0 text-[var(--app-accent)]" />
              <span><span className="block text-sm font-semibold">Personalized greeting</span><span className="muted-text mt-0.5 block text-xs">Uses your approved Kinora template</span></span>
            </button>
            <button type="button" onClick={() => { setSendMode("custom"); setResult(""); }} aria-pressed={sendMode === "custom"} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${sendMode === "custom" ? "border-[var(--app-accent)] bg-[var(--app-surface-secondary)]" : "border-[var(--app-border)] hover:border-[var(--app-accent)]"}`}>
              <MessageSquareText size={17} className="mt-0.5 shrink-0 text-[var(--app-accent)]" />
              <span><span className="block text-sm font-semibold">Custom message</span><span className="muted-text mt-0.5 block text-xs">Write a one-off personal message</span></span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {sendMode === "custom" ? <>
            <label htmlFor="whatsapp-custom-message" className="block text-sm font-semibold text-[var(--app-text)]">Your message</label>
            <textarea id="whatsapp-custom-message" value={customMessage} onChange={(event) => setCustomMessage(event.target.value)} required maxLength={4096} rows={5} placeholder="Write a personal message…" className="auth-input w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition" />
            <p className="text-right text-xs text-[var(--app-text-muted)]">{customMessage.length}/4096</p>
            {!customReady && <p role="status" className="rounded-xl border border-[var(--app-border)] p-3 text-sm text-[var(--app-text-muted)]">{checking ? "Checking custom sending availability…" : "Your draft is ready. Deploy the updated WhatsApp function in Supabase to enable custom sending."}</p>}
            <p className="flex items-start gap-2 text-xs leading-5 text-[var(--app-text-muted)]"><Clock3 size={14} className="mt-0.5 shrink-0" />Custom messages can only be sent within 24 hours after the recipient messages your WhatsApp business number. Outside that window, use an approved template.</p>
          </> : <>
            <p className="block text-sm font-semibold text-[var(--app-text)]">Greeting preview</p>
            <p className="text-xs text-[var(--app-text-muted)]">Meta sends the currently approved version of kinora_daily_greeting. This preview may differ while your edit is under review.</p>
            <div className="auth-input min-h-[108px] rounded-xl border px-4 py-3 text-sm leading-6" aria-live="polite">
              Good morning, {contacts.find((contact) => contact.id === selectedContactId)?.name.trim().split(/\s+/)[0] || "there"}.<br />
              Wishing you a good day. I hope something makes you smile.<br />
              <span className="text-[var(--app-text-muted)]">Sent with Kinora</span>
            </div>
          </>}
        </div>
        </fieldset>

        <div className="flex flex-col items-start gap-3 lg:col-span-2 sm:flex-row sm:items-center">
          <button type="submit" disabled={sending || (sendMode === "custom" && !customReady)} className="auth-submit inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-60">
            {sending ? <><LoaderCircle size={16} className="animate-spin" />Sending…</> : <><Send size={15} />{sendMode === "custom" ? "Send custom message" : "Send greeting"}</>}
          </button>

          {result && <p role={isError ? "alert" : "status"} className={`text-sm leading-5 ${isError ? "text-rose-600 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>{result}</p>}
        </div>
        {messageId && <details className="text-xs text-[var(--app-text-muted)]"><summary className="cursor-pointer">Message reference</summary><p className="mt-2 break-all">{messageId}</p></details>}
      </form>
    </section>
  );
}
