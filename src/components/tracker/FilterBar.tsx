import type { FilterState, FeedSource, TopicCategory } from '../../lib/types';
import { FEED_CONFIGS } from '../../lib/feedFetcher';

const ALL_TOPICS: TopicCategory[] = [
  'BSA/AML',
  'Sanctions',
  'Consumer Protection',
  'Fair Lending',
  'Enforcement',
  'Bank Operations',
  'Cybersecurity/Privacy',
  'Mortgage/RESPA',
];

interface Props {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export default function FilterBar({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: Props) {
  const toggleSource = (source: FeedSource) => {
    const selected = filters.selectedSources.includes(source)
      ? filters.selectedSources.filter((s) => s !== source)
      : [...filters.selectedSources, source];
    onFiltersChange({ ...filters, selectedSources: selected });
  };

  const toggleTopic = (topic: TopicCategory) => {
    const selected = filters.selectedTopics.includes(topic)
      ? filters.selectedTopics.filter((t) => t !== topic)
      : [...filters.selectedTopics, topic];
    onFiltersChange({ ...filters, selectedTopics: selected });
  };

  const hasFilters =
    filters.searchQuery ||
    filters.selectedSources.length > 0 ||
    filters.selectedTopics.length > 0;

  return (
    <div class="space-y-4 mb-8">
      {/* Search */}
      <input
        type="text"
        placeholder="Search updates..."
        value={filters.searchQuery}
        onInput={(e) =>
          onFiltersChange({
            ...filters,
            searchQuery: (e.target as HTMLInputElement).value,
          })
        }
        class="w-full bg-bg-primary border border-border rounded-sm px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors font-mono"
      />

      {/* Source Filters */}
      <div class="flex flex-wrap gap-2">
        <span class="text-xs text-text-secondary font-mono uppercase tracking-wider self-center mr-1">
          Source:
        </span>
        {FEED_CONFIGS.map((config) => {
          const active = filters.selectedSources.includes(config.source);
          return (
            <button
              key={config.source}
              onClick={() => toggleSource(config.source)}
              class={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-sm transition-colors ${
                active
                  ? 'bg-accent text-bg-primary'
                  : 'bg-accent-light/50 text-accent hover:bg-accent-light'
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Topic Filters */}
      <div class="flex flex-wrap gap-2">
        <span class="text-xs text-text-secondary font-mono uppercase tracking-wider self-center mr-1">
          Topic:
        </span>
        {ALL_TOPICS.map((topic) => {
          const active = filters.selectedTopics.includes(topic);
          return (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              class={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-sm transition-colors ${
                active
                  ? 'bg-accent text-bg-primary'
                  : 'bg-accent-light/50 text-accent hover:bg-accent-light'
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>

      {/* Status bar */}
      <div class="flex items-center justify-between text-xs text-text-secondary font-mono">
        <span>
          {filteredCount === totalCount
            ? `${totalCount} updates`
            : `${filteredCount} of ${totalCount} updates`}
        </span>
        {hasFilters && (
          <button
            onClick={() =>
              onFiltersChange({
                searchQuery: '',
                selectedSources: [],
                selectedTopics: [],
              })
            }
            class="text-accent hover:text-accent-hover transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
