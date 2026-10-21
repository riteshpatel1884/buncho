const SIZES = {
  md: { gap: 'gap-2.5', box: 'h-8 w-8 rounded-[10px] text-[1.35rem]', word: 'text-[1.4rem]', nudge: '-translate-y-px' },
  xl: { gap: 'gap-5', box: 'h-24 w-24 rounded-[1.7rem] text-[4.25rem]', word: 'text-[4.25rem]', nudge: '-translate-y-1' },
};

const TONES = {
  // Follows the theme: black square + green b in light mode, green square + black b in dark mode
  auto: {
    box: 'bg-[#04140a] text-[#34d67b] dark:bg-[#34d67b] dark:text-[#04140a]',
    word: 'text-ink',
    dot: 'text-[#34d67b]',
  },
  // Fixed colours for use on top of a green background
  dark: {
    box: 'bg-[#04140a] text-[#34d67b]',
    word: 'text-[#04140a]',
    dot: 'text-white',
  },
};

export default function Logo({ size = 'md', tone = 'auto', className = '' }) {
  const s = SIZES[size] ?? SIZES.md;
  const t = TONES[tone] ?? TONES.auto;
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center font-extrabold leading-none transition-colors ${s.box} ${t.box}`}
      >
        <span className={s.nudge}>b</span>
      </span>
      <span className={`font-extrabold leading-none tracking-tight ${s.word} ${t.word}`}>
        buncho<span className={t.dot}>.</span>
      </span>
    </span>
  );
}