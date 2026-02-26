export function formatCurrency(value: number, compact = true): string {
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) {
      return `${value < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(1)}M`;
    }
    if (abs >= 1_000) {
      return `${value < 0 ? '-' : ''}$${(abs / 1_000).toFixed(0)}K`;
    }
    return `${value < 0 ? '-' : ''}$${abs.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '' : ''}${value.toFixed(1)}%`;
}

export function formatVariance(value: number): string {
  const prefix = value >= 0 ? '+' : '-';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${prefix}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${prefix}$${(abs / 1_000).toFixed(0)}K`;
  }
  return `${prefix}$${abs.toFixed(0)}`;
}

export function classForVariance(value: number, reverse = false): string {
  if (value === 0) return 'text-text-secondary';
  const favorable = reverse ? value < 0 : value > 0;
  return favorable ? 'text-green-700' : 'text-red-700';
}
