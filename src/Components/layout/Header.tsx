
function Header() {
  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-kinora-border bg-white px-5 sm:px-8">
      <div>
        <p className="text-sm text-kinora-muted">Workspace / Overview</p>
        <h1 className="mt-1 text-lg font-semibold">Your dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-kinora-border text-kinora-muted transition hover:bg-kinora-background"
        >
          ♧
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kinora-mint text-sm font-bold text-kinora-primary">
          Y
        </div>
      </div>
    </header>
  )
}

export default Header
