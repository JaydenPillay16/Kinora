import { useEffect, useState } from "react";
import { CheckCheck, Clock3, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

type DeliveryStatus = "sending" | "accepted" | "sent" | "delivered" | "read" | "failed" | "unknown";
interface Message {
  id: string;
  contact_name: string;
  mode: "template" | "custom";
  message_text: string | null;
  template_name: string | null;
  status: DeliveryStatus;
  error_code: number | null;
  error_message: string | null;
  created_at: string;
  provider_status_at: string | null;
  provider_message_id: string | null;
}

const labels: Record<DeliveryStatus, string> = { sending: "Sending", accepted: "Accepted", sent: "Sent", delivered: "Delivered", read: "Read", failed: "Failed", unknown: "Unconfirmed" };
const explanations: Record<DeliveryStatus, string> = {
  sending: "Waiting for the send request to complete. Check the receiving phone before retrying if this persists.",
  accepted: "WhatsApp accepted the request. Waiting for delivery confirmation.",
  sent: "WhatsApp sent the message. Delivery to the receiving phone is not confirmed yet.",
  delivered: "Meta confirmed delivery to the receiving phone.",
  read: "Meta reported that this message was read.",
  failed: "WhatsApp reported a failure.",
  unknown: "The request was interrupted. Check the receiving phone before retrying.",
};
function failureDescription(message: Message) {
  if (message.error_code === 131047) return "The 24-hour reply window was closed. Use an approved greeting or ask the recipient to message your business number first.";
  if (message.error_code === 131030) return "This number needs verification in Meta's test recipient list.";
  if (message.error_code === 131026) return "WhatsApp could not deliver the message. Check the recipient's WhatsApp number and availability.";
  return message.error_message ?? explanations.failed;
}

export default function MessageHistory({ userId, refreshKey, onDeliveredCount }: { userId: string; refreshKey: number; onDeliveredCount: (count: number) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    async function load() {
      if (inFlight) return;
      inFlight = true;
      try {
        const [history, delivered] = await Promise.all([
          supabase.from("whatsapp_messages").select("id,contact_name,mode,message_text,template_name,status,error_code,error_message,created_at,provider_status_at,provider_message_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(25),
          supabase.from("whatsapp_messages").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["delivered", "read"]),
        ]);
        if (cancelled) return;
        if (history.error || delivered.error) {
          const code = history.error?.code ?? delivered.error?.code;
          setError(code === "PGRST205" || code === "42P01" ? "Delivery history is not connected yet. Complete the WhatsApp tracking setup to see message updates here." : "Could not refresh delivery history. Try again shortly.");
          return;
        }
        setMessages((history.data ?? []) as Message[]);
        onDeliveredCount(delivered.count ?? 0);
        setUpdatedAt(new Date());
        setError("");
      } catch {
        if (!cancelled) setError("Could not refresh delivery history. Check your connection and try again.");
      } finally {
        inFlight = false;
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    const interval = window.setInterval(() => { if (!document.hidden) void load(); }, 10000);
    const onFocus = () => { if (!document.hidden) void load(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => { cancelled = true; window.clearInterval(interval); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onFocus); };
  }, [userId, refreshKey, retry, onDeliveredCount]);

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--app-text-muted)]">
      <p>{updatedAt ? `Last checked ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · refreshes every 10 seconds` : "Delivery updates come from WhatsApp."}</p>
      <button type="button" onClick={() => { setLoading(true); setRetry((value) => value + 1); }} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 font-semibold"><RefreshCw size={13} className={loading ? "animate-spin" : ""} />Refresh</button>
    </div>
    {error && <p role="alert" className="surface rounded-2xl p-4 text-sm text-[var(--app-text-muted)]">{error}{messages.length > 0 ? " Showing the last loaded results." : ""}</p>}
    {loading && !updatedAt && <p role="status" className="surface rounded-2xl p-5 text-sm">Loading your messages…</p>}
    {!loading && !error && messages.length === 0 && <div className="surface rounded-2xl p-6"><CheckCheck className="mb-3 text-[var(--app-accent)]" /><p className="font-semibold">Your next message starts this history.</p><p className="muted-text mt-2 text-sm">New sends appear here once tracking is connected. Earlier test messages are not backfilled.</p></div>}
    {messages.map((message) => <article key={message.id} className="history-entry surface space-y-4 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="font-semibold">{message.contact_name}</h3><p className="muted-text mt-1 text-sm">{new Date(message.created_at).toLocaleString()} · {message.mode === "custom" ? "Custom message" : "Personalized greeting"}</p></div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${message.status === "failed" ? "border-rose-500/30 text-rose-600 dark:text-rose-300" : "border-[var(--app-border)] text-[var(--app-accent)]"}`}>{["delivered", "read"].includes(message.status) ? <CheckCheck size={14} /> : <Clock3 size={14} />}{labels[message.status] ?? "Unconfirmed"}</span>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.message_text ?? `WhatsApp template: ${message.template_name}`}</p>
      <p className="muted-text text-sm leading-6">{message.status === "failed" ? failureDescription(message) : explanations[message.status]}{message.error_code != null ? ` (Code ${message.error_code})` : ""}</p>
      {message.provider_status_at && <p className="muted-text text-sm">WhatsApp update: {new Date(message.provider_status_at).toLocaleString()}</p>}
      {message.provider_message_id && <details className="muted-text text-xs"><summary className="cursor-pointer">Message reference</summary><p className="mt-2 break-all">{message.provider_message_id}</p></details>}
    </article>)}
    {messages.length === 25 && <p className="muted-text text-xs">Showing your latest 25 messages.</p>}
  </div>;
}
