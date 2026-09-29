import { Bot, Undo2, Users } from 'lucide-react';
import { HERO } from '@/data/meta';
import Pill from '@/components/ui/Pill';
import GameIsland from '@/components/game/GameIsland';

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-12 md:pt-8">
      <section className="pb-5">
        <p className="font-mono text-xs tracking-widest text-violet-400 uppercase">{HERO.kicker}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
          {HERO.title}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-zinc-400">{HERO.lede}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill icon={<Users size={14} aria-hidden="true" />}>2-player local</Pill>
          <Pill icon={<Bot size={14} aria-hidden="true" />}>Minimax AI</Pill>
          <Pill icon={<Undo2 size={14} aria-hidden="true" />}>Undo / Redo</Pill>
        </div>
      </section>

      <GameIsland />
    </div>
  );
}
