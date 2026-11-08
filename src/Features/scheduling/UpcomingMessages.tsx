import { ArrowRight, CalendarDays, Clock3, MessageCircle, MessageSquareText, X } from "lucide-react";
import LoadError from "../../Components/feedback/LoadError";
import type { ScheduledMessage } from "./types";

interface UpcomingMessagesProps {
  messages: ScheduledMessage[];
  isLoading: boolean;
  loadError: boolean;
  onRetry: () => void;
  onCancel: (messageId: string) => void;
  onCreatePlan: () => void;
}

function UpcomingMessages({ messages, isLoading, loadError, onRetry, onCancel, onCreatePlan }: UpcomingMessagesProps) {
  function formatScheduledDate(dateString: string) {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString("en-ZA", { day: "2-digit" }),
      month: date.toLocaleDateString("en-ZA", { month: "short" }),
      fullDate: date.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      time: date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
    };
  }

  return (
    <section id="schedule" className="upcoming-section mt-12 scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-[var(--app-text)] sm:text-[26px]">Upcoming messages</h2>
          <p className="mt-1.5 text-sm text-[var(--app-text-muted)]">Saved plans for reaching out.</p>
        </div>

        <span className="schedule-count inline-flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-xs font-medium text-[var(--app-text-muted)]">
          <span className="schedule-count-dot h-1.5 w-1.5 rounded-full bg-[var(--app-accent)]" />
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </div>

      <p className="mb-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-sm leading-6 text-[var(--app-text-muted)]">These are saved plans. Automatic delivery still needs the server scheduler connected. Custom text also needs an open WhatsApp 24-hour reply window at the sending time; approved templates support outreach outside that window.</p>

      {isLoading ? (
        <div className="surface rounded-xl p-5" aria-live="polite">
          <p className="text-sm text-[var(--app-text-muted)]">Loading upcoming messages…</p>
        </div>
      ) : loadError ? (
        <LoadError title="Upcoming messages" onRetry={onRetry} />
      ) : messages.length === 0 ? (
        <div className="schedule-empty relative isolate overflow-hidden rounded-[26px] border border-[var(--app-border)] p-6 sm:p-8 lg:p-10">

          <div className="relative flex flex-col gap-8 lg:min-h-[210px] lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="schedule-empty-icon mb-4 flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-accent)]"><MessageCircle size={19} strokeWidth={1.7} /></div>
              <h3 className="text-2xl font-medium text-[var(--app-text)] sm:text-[28px]">No messages planned yet</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--app-text-muted)] sm:text-[15px]">
                Add a future date to an agent to keep a message plan in this list.
              </p>
            </div>

            <div className="relative flex shrink-0 flex-col items-start gap-3 lg:mr-2">
              <button type="button" onClick={onCreatePlan} className="schedule-create-action group inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]">
                <CalendarDays size={16} />
                Plan a message
                <ArrowRight size={15} />
              </button>
              <p className="pl-1 text-xs text-[var(--app-text-muted)]">Choose a person and a time to reach out</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative space-y-4">
          <span aria-hidden="true" className="schedule-timeline absolute bottom-7 left-[27px] top-7 hidden w-px sm:block" />
          {messages.map((message) => {
            const scheduled = formatScheduledDate(message.scheduledAt);
            return (
              <article key={message.id} className="schedule-card surface group relative overflow-hidden rounded-xl p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="schedule-date-tile relative z-[1] flex h-[62px] w-[62px] shrink-0 flex-col items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                    <span className="text-xs font-medium text-[var(--app-accent)]">{scheduled.month}</span>
                    <span className="text-lg font-medium leading-6 text-[var(--app-text)] tabular-nums">{scheduled.day}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="schedule-status inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"><span className="schedule-count-dot h-1.5 w-1.5 rounded-full bg-current" />Pending</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--app-text-muted)]"><Clock3 size={13} aria-hidden="true" />{scheduled.fullDate} · {scheduled.time}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-[var(--app-text)]">{message.contactName}</h3>
                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">Via <span className="font-medium text-[var(--app-text)]">{message.agentName}</span></p>

                    <div className="schedule-message-preview mt-4 flex gap-3 rounded-2xl border border-[var(--app-border)] p-4 sm:p-5">
                      <MessageSquareText size={16} className="mt-0.5 shrink-0 text-[var(--app-accent)]" aria-hidden="true" />
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--app-text-muted)]">{message.messageText}</p>
                    </div>
                  </div>

                  <button type="button" onClick={() => onCancel(message.id)} className="schedule-cancel-action group/cancel inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[var(--app-border)] px-3.5 py-2.5 text-sm font-semibold text-[var(--app-text-muted)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
                    <X size={15} className="transition-transform duration-300 group-hover/cancel:rotate-90" aria-hidden="true" />
                    Cancel
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default UpcomingMessages;
