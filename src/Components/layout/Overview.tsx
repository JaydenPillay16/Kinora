import { ArrowUpRight, CalendarDays, PenLine, Plus } from "lucide-react";
import type { ScheduledMessage } from "../../Features/scheduling/types";

interface Props {
  plan?: ScheduledMessage;
  loading: boolean;
  failed: boolean;
  onCreate: () => void;
}

export default function Overview({ plan, loading, failed, onCreate }: Props) {
  return (
    <section id="overview" className="letterhead scroll-mt-28" aria-labelledby="circle-title">
      <div className="letterhead-intro">
        <h2 id="circle-title">Your circle</h2>
        <p>People, messages, and the moments you want to remember.</p>
        <div className="letterhead-actions">
          <a href="#whatsapp-composer"><PenLine size={17} />Compose a message</a>
          <button type="button" onClick={onCreate}><Plus size={16} />Create an agent</button>
        </div>
      </div>
      <div className="plan-slip">
        <div className="slip-label"><CalendarDays size={16} />Next saved plan</div>
        <p className="slip-title">{loading ? "Checking your plans…" : failed ? "Schedule unavailable" : plan ? plan.contactName : "An open calendar"}</p>
        <p>{!loading && !failed && plan ? new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(plan.scheduledAt)) : !loading && !failed ? "Add a time to a message draft to see it here." : "Your schedule has more details."}</p>
        <a href="#schedule">View schedule <ArrowUpRight size={15} /></a>
      </div>
    </section>
  );
}
