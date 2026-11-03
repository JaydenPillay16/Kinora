
import { useState, type FormEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function WhatsAppTest() {
  const [message, setMessage] = useState("Hello from Kinora! 💚");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [isError, setIsError] = useState(false);

  const sendTestMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult("");
    setIsError(false);

    const normalizedPhone = phone.replace(/\D/g, "");

    if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
      setIsError(true);
      setResult("Enter a valid international number with 8 to 15 digits, including the country code.");
      return;
    }

    if (!message.trim()) return;

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
            message: message.trim(),
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
          <label htmlFor="whatsapp-test-phone" className="block text-sm font-semibold text-[var(--app-text)]">Test recipient</label>
          <input id="whatsapp-test-phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={24} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+27 82 123 4567" aria-describedby="whatsapp-phone-help" className="auth-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition" />
          <p id="whatsapp-phone-help" className="text-xs leading-5 text-[var(--app-text-muted)]">Include the country code, for example +27.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="whatsapp-test-message" className="block text-sm font-semibold text-[var(--app-text)]">Test message</label>
          <textarea id="whatsapp-test-message" value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={1000} rows={3} className="auth-input w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition" />
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
