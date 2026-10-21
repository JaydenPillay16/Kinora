import type { ScheduledMessage } from "./types";

interface UpcomingMessagesProps {
  messages: ScheduledMessage[];
  isLoading: boolean;
  onCancel: (messageId: string) => void;
}

function UpcomingMessages({
  messages,
  isLoading,
  onCancel,
}: UpcomingMessagesProps) {
  function formatScheduledDate(dateString: string) {
    const date = new Date(dateString);

    return {
      date: date.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--app-text)]">
            Upcoming Messages
          </h2>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            Thoughtful messages planned for the people who matter.
          </p>
        </div>

        <span className="rounded-full bg-kinora-mint px-3 py-1 text-sm font-semibold text-kinora-primary">
          {messages.length} pending
        </span>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-kinora-border bg-[var(--app-surface)] p-8 text-center">
          <p className="text-sm text-[var(--app-text-muted)]">
            Loading your upcoming messages...
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-kinora-border bg-[var(--app-surface)] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-kinora-mint text-xl text-kinora-primary">
            <span aria-hidden="true">✉</span>
          </div>

          <h3 className="mt-4 font-semibold text-[var(--app-text)]">
            Nothing scheduled just yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--app-text-muted)]">
            Once you create an active agent with a future schedule, its planned
            message will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const scheduled = formatScheduledDate(message.scheduledAt);

            return (
              <article
                key={message.id}
                className="rounded-2xl border border-kinora-border bg-[var(--app-surface)] p-5 transition hover:shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-kinora-mint px-2.5 py-1 text-xs font-semibold text-kinora-primary">
                        Pending
                      </span>

                      <span className="text-sm text-kinora-muted">
                        {scheduled.date} at {scheduled.time}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-kinora-text">
                      {message.contactName}
                    </h3>

                    <p className="mt-1 text-sm text-kinora-muted">
                      Via {message.agentName}
                    </p>

                    <div className="mt-4 rounded-xl bg-kinora-background p-4">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-kinora-text">
                        {message.messageText}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onCancel(message.id)}
                    className="shrink-0 self-start rounded-xl border border-kinora-border px-4 py-2.5 text-sm font-semibold text-kinora-text transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    Cancel message
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
