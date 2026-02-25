import type { RegulatoryUpdate } from '../../lib/types';
import { FEED_CONFIGS } from '../../lib/feedFetcher';
import SourceBadge from './SourceBadge';

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface Props {
  update: RegulatoryUpdate;
}

export default function FeedCard({ update }: Props) {
  const config = FEED_CONFIGS.find((c) => c.source === update.source);
  const color = config?.color ?? '#6B6560';

  return (
    <article class="bg-bg-secondary border border-border rounded-sm p-5 hover:shadow-md hover:border-accent/30 transition-all duration-300">
      <div class="flex items-center justify-between mb-3">
        <SourceBadge label={update.sourceLabel} color={color} />
        <span class="text-xs text-text-secondary font-mono">
          {formatDate(update.pubDate)}
        </span>
      </div>

      <a
        href={update.link}
        target="_blank"
        rel="noopener noreferrer"
        class="block heading-md text-text-primary hover:text-accent transition-colors mb-2 leading-snug"
      >
        {update.title}
      </a>

      {update.description && (
        <p class="text-text-secondary text-sm leading-relaxed mb-3 line-clamp-2">
          {update.description}
        </p>
      )}

      <div class="flex flex-wrap gap-1.5">
        {update.categories.map((cat) => (
          <span
            key={cat}
            class="text-[10px] font-mono uppercase tracking-wider text-accent bg-accent-light/50 px-2 py-0.5 rounded-sm"
          >
            {cat}
          </span>
        ))}
      </div>
    </article>
  );
}
