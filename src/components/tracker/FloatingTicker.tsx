import { useMemo } from 'preact/hooks';
import type { RegulatoryUpdate } from '../../lib/types';

interface Props {
  updates: RegulatoryUpdate[];
}

function formatTickerDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FloatingTicker({ updates }: Props) {
  const tickerText = useMemo(() => {
    return updates
      .slice(0, 15)
      .map((u) => `${formatTickerDate(u.pubDate)}: ${u.title}`)
      .join('  \u2022  ');
  }, [updates]);

  if (updates.length === 0) return null;

  return (
    <div class="overflow-hidden border-y border-border/50 mb-6" aria-hidden="true">
      <div
        class="whitespace-nowrap font-mono text-xs text-text-secondary py-2.5"
        style={{
          animation: `ticker-scroll 35s linear infinite`,
        }}
      >
        {tickerText}
        <span class="ml-8">{tickerText}</span>
      </div>
    </div>
  );
}
