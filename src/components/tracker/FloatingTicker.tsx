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
  const tickerItems = useMemo(() => {
    // Pick up to 20 recent items, spread across random heights
    const items = updates.slice(0, 20);
    return items.map((update, i) => ({
      text: `${formatTickerDate(update.pubDate)}: ${update.title}`,
      top: 5 + ((i * 37 + i * i * 13) % 85), // pseudo-random distribution 5-90%
      duration: 25 + ((i * 7) % 20), // 25-44s, varied speeds
      delay: -(i * 3.5), // stagger start times
    }));
  }, [updates]);

  if (tickerItems.length === 0) return null;

  return (
    <div
      class="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {tickerItems.map((item, i) => (
        <div
          key={i}
          class="absolute whitespace-nowrap font-mono text-xs text-text-primary"
          style={{
            top: `${item.top}%`,
            opacity: 0.15,
            animation: `ticker-scroll ${item.duration}s linear ${item.delay}s infinite`,
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
