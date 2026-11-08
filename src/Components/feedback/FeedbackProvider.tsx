import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, ShieldAlert, X } from "lucide-react";
import { FeedbackContext, type FeedbackContextValue } from "./FeedbackContext";

type NoticeTone = "success" | "error" | "info";

interface Notice {
  id: number;
  message: string;
  tone: NoticeTone;
}

interface Confirmation extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

type ConfirmOptions = Parameters<FeedbackContextValue["confirm"]>[0];

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const noticeId = useRef(0);

  const notify = useCallback((message: string, tone: NoticeTone = "info") => {
    noticeId.current += 1;
    setNotice({ id: noticeId.current, message, tone });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    setConfirmation({ ...options, resolve });
  }), []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 5200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function finishConfirmation(confirmed: boolean) {
    confirmation?.resolve(confirmed);
    setConfirmation(null);
  }

  const NoticeIcon = notice?.tone === "success" ? CheckCircle2 : notice?.tone === "error" ? AlertCircle : Info;

  return (
    <FeedbackContext.Provider value={{ notify, confirm }}>
      {children}
      {notice && (
        <div className={`app-toast app-toast-${notice.tone}`} key={notice.id} role={notice.tone === "error" ? "alert" : "status"}>
          <NoticeIcon size={19} className="shrink-0" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm leading-5">{notice.message}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification" className="app-toast-close"><X size={16} /></button>
        </div>
      )}
      {confirmation && (
        <div className="app-dialog-backdrop" onKeyDown={(event) => { if (event.key === "Escape") finishConfirmation(false); }} onMouseDown={(event) => { if (event.target === event.currentTarget) finishConfirmation(false); }}>
          <section className="app-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
            <span className={`app-confirm-icon ${confirmation.danger ? "is-danger" : ""}`}><ShieldAlert size={21} aria-hidden="true" /></span>
            <h2 id="confirm-title" className="mt-5 text-xl font-medium tracking-tight text-[var(--app-text)]">{confirmation.title}</h2>
            <p id="confirm-message" className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">{confirmation.message}</p>
            <div className="mt-7 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button type="button" autoFocus onClick={() => finishConfirmation(false)} className="app-confirm-cancel rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-surface-secondary)]">{confirmation.cancelLabel ?? "Keep it"}</button>
              <button type="button" onClick={() => finishConfirmation(true)} className={`app-confirm-accept rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${confirmation.danger ? "is-danger" : ""}`}>{confirmation.confirmLabel ?? "Continue"}</button>
            </div>
          </section>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

