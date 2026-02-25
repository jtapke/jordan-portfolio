import { useState, useEffect, useMemo } from 'preact/hooks';
import type { RegulatoryUpdate, FilterState } from '../../lib/types';
import { fetchAllFeeds } from '../../lib/feedFetcher';
import FilterBar from './FilterBar';
import FeedCard from './FeedCard';
import FloatingTicker from './FloatingTicker';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const PAGE_SIZE = 20;

export default function RegChangeTracker() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedSources: [],
    selectedTopics: [],
  });

  useEffect(() => {
    fetchAllFeeds()
      .then((data) => {
        setUpdates(data);
        setError(data.length === 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filteredUpdates = useMemo(() => {
    return updates.filter((u) => {
      // Source filter
      if (
        filters.selectedSources.length > 0 &&
        !filters.selectedSources.includes(u.source)
      )
        return false;

      // Topic filter
      if (
        filters.selectedTopics.length > 0 &&
        !u.categories.some((c) => filters.selectedTopics.includes(c))
      )
        return false;

      // Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          u.title.toLowerCase().includes(q) ||
          u.description.toLowerCase().includes(q) ||
          u.sourceLabel.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [updates, filters]);

  const visibleUpdates = filteredUpdates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredUpdates.length;

  return (
    <div>
      {/* Ticker strip */}
      {!loading && updates.length > 0 && <FloatingTicker updates={updates} />}

      {/* Main content */}
      <div>
        {!loading && !error && (
          <FilterBar
            filters={filters}
            onFiltersChange={(f) => {
              setFilters(f);
              setVisibleCount(PAGE_SIZE);
            }}
            totalCount={updates.length}
            filteredCount={filteredUpdates.length}
          />
        )}

        {loading && <LoadingState />}
        {error && !loading && <ErrorState />}

        {!loading && !error && (
          <div class="space-y-3">
            {visibleUpdates.map((update) => (
              <FeedCard key={update.id} update={update} />
            ))}

            {filteredUpdates.length === 0 && (
              <div class="text-center py-12 text-text-secondary text-sm font-mono">
                No updates match your filters.
              </div>
            )}

            {hasMore && (
              <div class="text-center pt-4">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  class="inline-flex items-center gap-2 px-6 py-2.5 border border-border rounded-sm text-sm font-mono uppercase tracking-wider text-text-secondary hover:border-accent hover:text-accent transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
