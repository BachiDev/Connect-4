import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { LINKS } from '@/data/meta';

/** Mini portfolio chrome: back to all work + source link. */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
        <a
          href={LINKS.work}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All work
        </a>
        <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Connect-4</span>
        <a
          href={LINKS.source}
          target="_blank"
          rel="noreferrer"
          aria-label="View source code on GitHub"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
        >
          <Image src="./github.svg" alt="" width={20} height={20} className="invert" />
        </a>
      </div>
    </header>
  );
}
