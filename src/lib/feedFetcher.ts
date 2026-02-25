import type { RegulatoryUpdate, FeedConfig } from './types';
import { parseRSSFeed } from './feedParser';

export const FEED_CONFIGS: FeedConfig[] = [
  {
    source: 'cfpb',
    label: 'CFPB',
    url: 'https://www.consumerfinance.gov/feed/',
    color: '#2E8540',
  },
  {
    source: 'occ',
    label: 'OCC',
    url: 'https://www.occ.gov/static/news-issuances/ews/occ-news-issuances.xml',
    color: '#003366',
  },
  {
    source: 'fincen',
    label: 'FinCEN',
    url: 'https://www.federalregister.gov/api/v1/documents.rss?conditions[agencies][]=financial-crimes-enforcement-network',
    color: '#8B0000',
  },
  {
    source: 'frb',
    label: 'FRB',
    url: 'https://www.federalreserve.gov/feeds/press_all.xml',
    color: '#1B3A5C',
  },
];

const PROXY_URL = 'https://api.allorigins.win/raw?url=';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const cache = new Map<string, { data: RegulatoryUpdate[]; timestamp: number }>();

async function fetchFeed(config: FeedConfig): Promise<RegulatoryUpdate[]> {
  const cached = cache.get(config.url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(
      `${PROXY_URL}${encodeURIComponent(config.url)}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const updates = parseRSSFeed(xml, config.source, config.label);

    cache.set(config.url, { data: updates, timestamp: Date.now() });
    return updates;
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

export async function fetchAllFeeds(): Promise<RegulatoryUpdate[]> {
  const results = await Promise.allSettled(
    FEED_CONFIGS.map((config) => fetchFeed(config)),
  );

  const allUpdates: RegulatoryUpdate[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allUpdates.push(...result.value);
    }
  }

  return allUpdates.sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );
}
