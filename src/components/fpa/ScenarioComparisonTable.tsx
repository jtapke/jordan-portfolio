import type { ForecastResult, ScenarioPreset } from '../../lib/fpaTypes';
import { computeForecast } from '../../lib/fpaCalculations';
import { formatCurrency, formatPercent } from './formatters';

interface Props {
  presets: ScenarioPreset[];
}

export default function ScenarioComparisonTable({ presets }: Props) {
  const rows: { label: string; values: (result: ForecastResult) => string }[] = [
    { label: 'Revenue', values: (r) => formatCurrency(r.totalRevenue) },
    { label: 'COGS', values: (r) => formatCurrency(r.totalCOGS) },
    { label: 'Gross Profit', values: (r) => formatCurrency(r.grossProfit) },
    { label: 'Gross Margin', values: (r) => formatPercent(r.grossMargin) },
    { label: 'Total OpEx', values: (r) => formatCurrency(r.totalOpex) },
    { label: 'Op. Income', values: (r) => formatCurrency(r.operatingIncome) },
    { label: 'Op. Margin', values: (r) => formatPercent(r.operatingMargin) },
    { label: 'Headcount', values: (r) => r.headcount.toString() },
  ];

  const results = presets.map((p) => computeForecast(p.assumptions));

  return (
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b-2 border-border">
            <th class="py-2 px-3 text-xs mono-label text-text-secondary">Metric</th>
            {presets.map((p) => (
              <th
                key={p.name}
                class="py-2 px-3 text-xs mono-label text-right"
                style={{ color: p.color }}
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} class="border-b border-border/50 hover:bg-bg-secondary/30">
              <td class="py-2 px-3 text-sm text-text-primary">{row.label}</td>
              {results.map((result, i) => (
                <td
                  key={i}
                  class="py-2 px-3 text-sm text-right font-mono"
                  style={{ color: presets[i].color }}
                >
                  {row.values(result)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
