import type { LineItem, Month } from '../../lib/fpaTypes';
import { computeYTD, computeVariance } from '../../lib/fpaCalculations';
import { formatCurrency, formatVariance, formatPercent, classForVariance } from './formatters';
import VarianceBar from './VarianceBar';

interface Props {
  item: LineItem;
  throughMonth: Month;
  maxAbsVariance: number;
}

export default function PLTableRow({ item, throughMonth, maxAbsVariance }: Props) {
  const ytd = computeYTD(item, throughMonth);
  const { variance, variancePct } = computeVariance(ytd.budget, ytd.actual);

  // For expenses (COGS/OpEx), favorable = under budget (negative variance)
  const isExpense = item.category === 'cogs' || item.category === 'opex';
  const varianceClass = classForVariance(variance, isExpense);
  const barValue = isExpense ? -variance : variance;

  const rowClass = item.isSubtotal
    ? 'border-t border-border bg-bg-secondary/50'
    : '';
  const labelClass = item.isBold ? 'font-semibold' : '';

  return (
    <tr class={`${rowClass} hover:bg-bg-secondary/30 transition-colors`}>
      <td class={`py-2 px-3 text-sm text-text-primary ${labelClass} ${item.isSubtotal ? 'pl-3' : 'pl-6'}`}>
        {item.label}
      </td>
      <td class="py-2 px-3 text-sm text-text-primary text-right font-mono">
        {formatCurrency(ytd.budget)}
      </td>
      <td class="py-2 px-3 text-sm text-text-primary text-right font-mono">
        {formatCurrency(ytd.actual)}
      </td>
      <td class={`py-2 px-3 text-sm text-right font-mono ${varianceClass}`}>
        {formatVariance(variance)}
      </td>
      <td class={`py-2 px-3 text-sm text-right font-mono ${varianceClass}`}>
        {formatPercent(variancePct)}
      </td>
      <td class="py-2 px-3 hidden md:table-cell">
        <VarianceBar value={barValue} maxAbsValue={maxAbsVariance} />
      </td>
    </tr>
  );
}
