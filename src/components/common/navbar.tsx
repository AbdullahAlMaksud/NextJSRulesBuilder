export default function Navbar() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-5 text-[color:var(--theme-muted)] md:px-8">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-[color:var(--theme-accent)] shadow-[0_0_18px_var(--theme-shadow)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.34em] text-[color:var(--theme-accent)]">
          Abdullah Al Maksud
        </span>
      </div>
      <span className="hidden rounded-full border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] px-3 py-1 text-xs backdrop-blur md:inline">
        Next.js 16 App Router
      </span>
    </header>
  );
}
