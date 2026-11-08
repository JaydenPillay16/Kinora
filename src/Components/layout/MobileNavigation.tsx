import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileNavigation({ activeSection, onDismiss }: { activeSection: string; onDismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const desktop = matchMedia("(min-width: 64rem)");
    const resize = () => { if (desktop.matches) dialog.close(); };
    dialog.showModal();
    desktop.addEventListener("change", resize);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      desktop.removeEventListener("change", resize);
      document.body.style.overflow = previous;
    };
  }, []);
  return <dialog ref={ref} aria-label="Workspace navigation" className="nav-drawer" onClose={onDismiss}
    onClick={(event) => { if (event.target === ref.current) ref.current?.close(); }}>
    <div className="relative">
      <button type="button" className="drawer-close" aria-label="Close navigation" onClick={() => ref.current?.close()}><X size={18} /></button>
      <Sidebar activeSection={activeSection} onNavigate={() => ref.current?.close()} />
    </div>
  </dialog>;
}
