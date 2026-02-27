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

const PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const cache = new Map<string, { data: RegulatoryUpdate[]; timestamp: number }>();

async function fetchWithProxy(url: string, proxyFn: (url: string) => string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(proxyFn(url), { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

async function fetchFeed(config: FeedConfig): Promise<RegulatoryUpdate[]> {
  const cached = cache.get(config.url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  for (const proxyFn of PROXIES) {
    try {
      const xml = await fetchWithProxy(config.url, proxyFn);
      if (!xml || !xml.includes('<')) continue;
      const updates = parseRSSFeed(xml, config.source, config.label);
      if (updates.length > 0) {
        cache.set(config.url, { data: updates, timestamp: Date.now() });
        return updates;
      }
    } catch {
      continue;
    }
  }

  return [];
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
