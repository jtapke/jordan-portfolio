import type { RegulatoryUpdate, FeedSource } from './types';
import { categorizeUpdate } from './categorizer';

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent?.trim() ?? '';
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function parseRSSFeed(
  xmlText: string,
  source: FeedSource,
  label: string,
): RegulatoryUpdate[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) return [];

  const items = doc.querySelectorAll('item');

  return Array.from(items).map((item) => {
    const title = item.querySelector('title')?.textContent?.trim() ?? '';
    const link = item.querySelector('link')?.textContent?.trim() ?? '';
    const description = item.querySelector('description')?.textContent?.trim() ?? '';
    const pubDateStr = item.querySelector('pubDate')?.textContent?.trim() ?? '';

    const cleanDescription = stripHtml(description).slice(0, 300);

    return {
      id: hashString(link || title),
      title,
      description: cleanDescription,
      link,
      pubDate: pubDateStr ? new Date(pubDateStr) : new Date(),
      source,
      sourceLabel: label,
      categories: categorizeUpdate(title, cleanDescription, source),
    };
  });
}
