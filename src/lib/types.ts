export type FeedSource = 'fincen' | 'occ' | 'cfpb' | 'frb';

export type TopicCategory =
  | 'BSA/AML'
  | 'Sanctions'
  | 'Consumer Protection'
  | 'Fair Lending'
  | 'Mortgage/RESPA'
  | 'Bank Operations'
  | 'Enforcement'
  | 'Cybersecurity/Privacy'
  | 'General';

export interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  source: FeedSource;
  sourceLabel: string;
  categories: TopicCategory[];
}

export interface FeedConfig {
  source: FeedSource;
  label: string;
  url: string;
  color: string;
}

export interface FilterState {
  searchQuery: string;
  selectedSources: FeedSource[];
  selectedTopics: TopicCategory[];
}
