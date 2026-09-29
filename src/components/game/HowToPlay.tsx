import { HOW_TO_PLAY } from '@/data/meta';

export default function HowToPlay() {
  return (
    <details className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium text-zinc-200">How to play</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-400">
        {HOW_TO_PLAY.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </details>
  );
}
