import { useMemo } from 'preact/hooks';
import type { PLSummary, Month } from '../../lib/fpaTypes';
import { MONTHS } from '../../lib/fpaTypes';
import { computeYTD, computeVariance } from '../../lib/fpaCalculations';
import PLTableRow from './PLTableRow';

interface Props {
  pl: PLSummary;
  selectedMonth: Month;
  onMonthChange: (month: Month) => void;
}

export default function PLSummaryView({ pl, selectedMonth, onMonthChange }: Props) {
  const revenueItems = pl.lineItems.filter((l) => l.category === 'revenue');
  const cogsItems = pl.lineItems.filter((l) => l.category === 'cogs');
  const opexItems = pl.lineItems.filter((l) => l.category === 'opex');

  // Compute gross profit & operating income
  const revTotal = pl.lineItems.find((l) => l.id === 'rev-total')!;
  const cogsTotal = pl.lineItems.find((l) => l.id === 'cogs-total')!;
  const revYTD = computeYTD(revTotal, selectedMonth);
  const cogsYTD = computeYTD(cogsTotal, selectedMonth);
  const gpBudget = revYTD.budget - cogsYTD.budget;
  const gpActual = revYTD.actual - cogsYTD.actual;

  let opexBudget = 0;
  let opexActual = 0;
  for (const item of opexItems) {
    const ytd = computeYTD(item, selectedMonth);
    opexBudget += ytd.budget;
    opexActual += ytd.actual;
  }
  const oiBudget = gpBudget - opexBudget;
  const oiActual = gpActual - opexActual;

  // Find max absolute variance for bar scaling
  const maxAbsVariance = useMemo(() => {
    let max = 0;
    for (const item of pl.lineItems) {
      const ytd = computeYTD(item, selectedMonth);
      const { variance } = computeVariance(ytd.budget, ytd.actual);
      max = Math.max(max, Math.abs(variance));
    }
    return max;
  }, [pl, selectedMonth]);

  return (
    <div>
      {/* Month Selector */}
      <div class="flex flex-wrap gap-1 mb-6">
        {MONTHS.map((m) => (
          <button
            key={m}
            onClick={() => onMonthChange(m)}
            class={`mono-label text-xs px-2.5 py-1.5 rounded-sm transition-colors ${
              selectedMonth === m
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* P&L Table */}
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b-2 border-border">
              <th class="py-2 px-3 text-xs mono-label text-text-secondary w-[200px]">
                YTD through {selectedMonth}
              </th>
              <th class="py-2 px-3 text-xs mono-label text-text-secondary text-right">Budget</th>
              <th class="py-2 px-3 text-xs mono-label text-text-secondary text-right">Actual</th>
              <th class="py-2 px-3 text-xs mono-label text-text-secondary text-right">Var ($)</th>
              <th class="py-2 px-3 text-xs mono-label text-text-secondary text-right">Var (%)</th>
              <th class="py-2 px-3 text-xs mono-label text-text-secondary hidden md:table-cell">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Revenue Section */}
            <tr>
              <td colSpan={6} class="pt-4 pb-1 px-3 text-xs mono-label text-accent font-semibold">
                Revenue
              </td>
            </tr>
            {revenueItems.map((item) => (
              <PLTableRow
                key={item.id}
                item={item}
                throughMonth={selectedMonth}
                maxAbsVariance={maxAbsVariance}
              />
            ))}

            {/* COGS Section */}
            <tr>
              <td colSpan={6} class="pt-6 pb-1 px-3 text-xs mono-label text-accent font-semibold">
                Cost of Goods Sold
              </td>
            </tr>
            {cogsItems.map((item) => (
              <PLTableRow
                key={item.id}
                item={item}
                throughMonth={selectedMonth}
                maxAbsVariance={maxAbsVariance}
              />
            ))}

            {/* Gross Profit */}
            <GrossProfitRow
              label="Gross Profit"
              budget={gpBudget}
              actual={gpActual}
            />

            {/* OpEx Section */}
            <tr>
              <td colSpan={6} class="pt-6 pb-1 px-3 text-xs mono-label text-accent font-semibold">
                Operating Expenses
              </td>
            </tr>
            {opexItems.map((item) => (
              <PLTableRow
                key={item.id}
                item={item}
                throughMonth={selectedMonth}
                maxAbsVariance={maxAbsVariance}
              />
            ))}

            {/* Total OpEx */}
            <SummaryRow
              label="Total OpEx"
              budget={opexBudget}
              actual={opexActual}
              isExpense
            />

            {/* Operating Income */}
            <SummaryRow
              label="Operating Income"
              budget={oiBudget}
              actual={oiActual}
              isFinal
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GrossProfitRow({ label, budget, actual }: { label: string; budget: number; actual: number }) {
  const { variance, variancePct } = computeVariance(budget, actual);
  const cls = variance >= 0 ? 'text-green-700' : 'text-red-700';
  return (
    <tr class="border-t-2 border-border bg-bg-secondary/50">
      <td class="py-2 px-3 text-sm font-semibold text-text-primary">{label}</td>
      <td class="py-2 px-3 text-sm text-text-primary text-right font-mono font-semibold">
        ${(budget / 1000).toFixed(0)}K
      </td>
      <td class="py-2 px-3 text-sm text-text-primary text-right font-mono font-semibold">
        ${(actual / 1000).toFixed(0)}K
      </td>
      <td class={`py-2 px-3 text-sm text-right font-mono font-semibold ${cls}`}>
        {variance >= 0 ? '+' : ''}${(variance / 1000).toFixed(0)}K
      </td>
      <td class={`py-2 px-3 text-sm text-right font-mono font-semibold ${cls}`}>
        {variancePct.toFixed(1)}%
      </td>
      <td class="py-2 px-3 hidden md:table-cell" />
    </tr>
  );
}

function SummaryRow({
  label,
  budget,
  actual,
  isExpense = false,
  isFinal = false,
}: {
  label: string;
  budget: number;
  actual: number;
  isExpense?: boolean;
  isFinal?: boolean;
}) {
  const { variance, variancePct } = computeVariance(budget, actual);
  const favorable = isExpense ? variance <= 0 : variance >= 0;
  const cls = variance === 0 ? 'text-text-secondary' : favorable ? 'text-green-700' : 'text-red-700';
  const border = isFinal ? 'border-t-2 border-double border-border' : 'border-t border-border';
  return (
    <tr class={`${border} bg-bg-secondary/50`}>
      <td class="py-2 px-3 text-sm font-bold text-text-primary">{label}</td>
      <td class="py-2 px-3 text-sm text-text-primary text-right font-mono font-bold">
        ${(budget / 1000).toFixed(0)}K
      </td>
      <td class="py-2 px-3 text-sm text-text-primary text-right font-mono font-bold">
        ${(actual / 1000).toFixed(0)}K
      </td>
      <td class={`py-2 px-3 text-sm text-right font-mono font-bold ${cls}`}>
        {variance >= 0 ? '+' : ''}${(variance / 1000).toFixed(0)}K
      </td>
      <td class={`py-2 px-3 text-sm text-right font-mono font-bold ${cls}`}>
        {variancePct.toFixed(1)}%
      </td>
      <td class="py-2 px-3 hidden md:table-cell" />
    </tr>
  );
}
