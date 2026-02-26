import { useState, useMemo } from 'preact/hooks';
import type { PLSummary, Month, Department } from '../../lib/fpaTypes';
import { buildDepartmentSummaries, computeYTD, computeVariance } from '../../lib/fpaCalculations';
import { formatCurrency, formatVariance, formatPercent, classForVariance } from './formatters';
import DepartmentCard from './DepartmentCard';

interface Props {
  pl: PLSummary;
  throughMonth: Month;
}

export default function DepartmentDrillDown({ pl, throughMonth }: Props) {
  const [activeDept, setActiveDept] = useState<Department>('Sales');

  const summaries = useMemo(
    () => buildDepartmentSummaries(pl, throughMonth),
    [pl, throughMonth]
  );

  const active = summaries.find((s) => s.department === activeDept)!;

  return (
    <div class="space-y-6">
      {/* Department Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        {summaries.map((summary) => (
          <DepartmentCard
            key={summary.department}
            summary={summary}
            isActive={activeDept === summary.department}
            onClick={() => setActiveDept(summary.department)}
          />
        ))}
      </div>

      {/* Detail View */}
      <div class="bg-bg-secondary border border-border rounded-sm p-5">
        <h3 class="heading-md text-text-primary mb-4">
          {active.department} — Line Item Detail
        </h3>

        {/* Line items table */}
        <div class="overflow-x-auto mb-6">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b-2 border-border">
                <th class="py-2 px-3 text-xs mono-label text-text-secondary">Line Item</th>
                <th class="py-2 px-3 text-xs mono-label text-text-secondary text-right">Budget</th>
                <th class="py-2 px-3 text-xs mono-label text-text-secondary text-right">Actual</th>
                <th class="py-2 px-3 text-xs mono-label text-text-secondary text-right">Var ($)</th>
                <th class="py-2 px-3 text-xs mono-label text-text-secondary text-right">Var (%)</th>
              </tr>
            </thead>
            <tbody>
              {active.lineItems.map((item) => {
                const ytd = computeYTD(item, throughMonth);
                const { variance, variancePct } = computeVariance(ytd.budget, ytd.actual);
                const cls = classForVariance(variance, true);
                return (
                  <tr key={item.id} class="border-b border-border/50 hover:bg-bg-primary/30 transition-colors">
                    <td class="py-2 px-3 text-sm text-text-primary">{item.label}</td>
                    <td class="py-2 px-3 text-sm text-text-primary text-right font-mono">
                      {formatCurrency(ytd.budget)}
                    </td>
                    <td class="py-2 px-3 text-sm text-text-primary text-right font-mono">
                      {formatCurrency(ytd.actual)}
                    </td>
                    <td class={`py-2 px-3 text-sm text-right font-mono ${cls}`}>
                      {formatVariance(variance)}
                    </td>
                    <td class={`py-2 px-3 text-sm text-right font-mono ${cls}`}>
                      {formatPercent(variancePct)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Biggest Variances */}
        <div>
          <h4 class="mono-label text-xs text-text-secondary mb-3">Biggest Variances</h4>
          <div class="space-y-2">
            {active.biggestVariances.map((v, i) => (
              <div
                key={i}
                class="flex items-center justify-between bg-bg-primary border border-border/50 rounded-sm px-4 py-2"
              >
                <div class="flex items-center gap-2">
                  <span
                    class={`w-2 h-2 rounded-full ${
                      v.direction === 'favorable' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  />
                  <span class="text-sm text-text-primary">{v.lineItemLabel}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span
                    class={`text-sm font-mono font-semibold ${
                      v.direction === 'favorable' ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {formatVariance(v.variance)}
                  </span>
                  <span
                    class={`mono-label text-xs px-1.5 py-0.5 rounded-sm ${
                      v.direction === 'favorable'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {v.direction}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
