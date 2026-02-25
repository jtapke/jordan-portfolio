import type { TopicCategory, FeedSource } from './types';

const TOPIC_KEYWORDS: Record<Exclude<TopicCategory, 'General'>, string[]> = {
  'BSA/AML': [
    'bsa', 'aml', 'anti-money laundering', 'bank secrecy',
    'suspicious activity', 'sar ', 'ctr ', 'currency transaction',
    'beneficial ownership', 'boi', 'cdd', 'customer due diligence',
    'money laundering', 'illicit finance', 'financial crimes',
    'shell company', 'know your customer', 'kyc',
  ],
  'Sanctions': [
    'sanction', 'ofac', 'sdn', 'specially designated',
    'blocked person', 'embargo', 'designation',
  ],
  'Consumer Protection': [
    'consumer', 'udaap', 'unfair', 'deceptive',
    'abusive', 'complaint', 'disclosure', 'tila',
    'truth in lending', 'reg z', 'reg e', 'electronic fund',
    'credit card', 'debt collection', 'payday',
  ],
  'Fair Lending': [
    'fair lending', 'hmda', 'ecoa', 'equal credit',
    'redlining', 'discrimination', 'community reinvestment', 'cra',
  ],
  'Mortgage/RESPA': [
    'mortgage', 'respa', 'real estate settlement',
    'servicing', 'foreclosure', 'loss mitigation', 'escrow',
  ],
  'Bank Operations': [
    'capital', 'liquidity', 'stress test',
    'operational risk', 'risk management', 'examination',
    'supervisory', 'occ bulletin', 'safety and soundness',
    'basel', 'reserve requirement',
  ],
  'Enforcement': [
    'enforcement', 'consent order', 'civil money penalty',
    'cease and desist', 'formal agreement', 'fine',
    'penalty', 'violation', 'action against',
  ],
  'Cybersecurity/Privacy': [
    'cyber', 'data breach', 'information security',
    'privacy', 'glba', 'gramm-leach', 'incident',
    'ransomware', 'phishing',
  ],
};

export function categorizeUpdate(
  title: string,
  description: string,
  source: FeedSource,
): TopicCategory[] {
  const text = `${title} ${description}`.toLowerCase();
  const matched: TopicCategory[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(topic as TopicCategory);
    }
  }

  // Source-level defaults
  if (matched.length === 0) {
    if (source === 'fincen') return ['BSA/AML'];
    if (source === 'cfpb') return ['Consumer Protection'];
    return ['General'];
  }

  return matched;
}
