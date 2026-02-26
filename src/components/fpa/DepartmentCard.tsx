import type { DepartmentSummary } from '../../lib/fpaTypes';
import { formatCurrency, formatVariance, classForVariance } from './formatters';

interface Props {
  summary: DepartmentSummary;
  isActive: boolean;
  onClick: () => void;
}

export default function DepartmentCard({ summary, isActive, onClick }: Props) {
  // For expenses, under-budget (negative variance) is favorable
  const varianceClass = classForVariance(summary.variance, true);

  return (
    <button
      onClick={onClick}
      class={`w-full text-left bg-bg-secondary border rounded-sm p-4 transition-all hover:shadow-md ${
        isActive ? 'border-accent shadow-md' : 'border-border'
      }`}
    >
      <p class="mono-label text-xs text-text-secondary mb-1">{summary.department}</p>
      <div class="flex items-end justify-between gap-2">
        <div>
          <p class="text-lg font-semibold text-text-primary">{formatCurrency(summary.totalActual)}</p>
          <p class="text-xs text-text-secondary">
            Budget: {formatCurrency(summary.totalBudget)}
          </p>
        </div>
        <div class="text-right">
          <p class={`text-sm font-mono font-semibold ${varianceClass}`}>
            {formatVariance(summary.variance)}
          </p>
          <p class={`text-xs font-mono ${varianceClass}`}>
            {summary.variancePct.toFixed(1)}%
          </p>
        </div>
      </div>
    </button>
  );
}
