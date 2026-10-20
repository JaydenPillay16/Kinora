
const navigationItems = [
  { label: 'Overview', icon: '◫' },
  { label: 'My Agents', icon: '✳' },
  { label: 'Contacts', icon: '♙' },
  { label: 'Schedule', icon: '◷' },
  { label: 'History', icon: '↺' },
  { label: 'Analytics', icon: '▥' },
]

function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-kinora-border bg-white p-5">
      <a href="#" className="mb-10 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kinora-primary text-lg font-bold text-white">
          K
        </span>
        <span className="text-xl font-bold tracking-tight">
          kinora<span className="text-kinora-accent">.</span>
        </span>
      </a>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-kinora-muted">
        Workspace
      </p>

      <nav className="flex flex-col gap-1">
        {navigationItems.map((item, index) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              index === 0
                ? 'bg-kinora-mint text-kinora-primary'
                : 'text-kinora-muted hover:bg-kinora-background hover:text-kinora-text'
            }`}
          >
            <span className="w-5 text-center text-lg">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-kinora-background p-4">
        <p className="text-sm font-semibold">Your personal space</p>
        <p className="mt-1 text-xs leading-5 text-kinora-muted">
          Keep the moments that matter close.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
