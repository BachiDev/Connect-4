import { LINKS } from '@/data/meta';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-zinc-500">
          © {year} Fabian Bachmayer · Built with Next.js &amp; Tailwind
        </p>
        <div className="flex items-center gap-1 text-sm">
          <a
            href={LINKS.work}
            className="rounded-full px-3 py-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
          >
            All work
          </a>
          <a
            href={LINKS.source}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-3 py-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
          >
            Source
          </a>
          <span className="px-3 py-2 font-mono text-xs text-zinc-600 uppercase">No tracking</span>
        </div>
      </div>
    </footer>
  );
}
