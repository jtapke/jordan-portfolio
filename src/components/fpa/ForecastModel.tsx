import { useState, useMemo } from 'preact/hooks';
import type { ForecastAssumptions } from '../../lib/fpaTypes';
import { BASE_ASSUMPTIONS, SCENARIO_PRESETS } from '../../lib/fpaData';
import { computeForecast } from '../../lib/fpaCalculations';
import { formatCurrency, formatPercent } from './formatters';
import ForecastSlider from './ForecastSlider';
import ScenarioToggle from './ScenarioToggle';
import MiniSparkline from './MiniSparkline';
import ScenarioComparisonTable from './ScenarioComparisonTable';

function assumptionsMatch(a: ForecastAssumptions, b: ForecastAssumptions): boolean {
  return (
    a.revenueGrowthRate === b.revenueGrowthRate &&
    a.averageDealSize === b.averageDealSize &&
    a.headcountAdditions === b.headcountAdditions &&
    a.salaryInflation === b.salaryInflation &&
    a.marketingSpendPct === b.marketingSpendPct
  );
}

export default function ForecastModel() {
  const [assumptions, setAssumptions] = useState<ForecastAssumptions>({ ...BASE_ASSUMPTIONS });

  const activeScenario = useMemo(() => {
    for (const preset of SCENARIO_PRESETS) {
      if (assumptionsMatch(assumptions, preset.assumptions)) return preset.name;
    }
    return null;
  }, [assumptions]);

  const result = useMemo(() => computeForecast(assumptions), [assumptions]);

  const update = (key: keyof ForecastAssumptions, value: number) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div class="space-y-8">
      {/* Scenario Toggle */}
      <div>
        <h3 class="heading-md text-text-primary mb-3">Scenario Presets</h3>
        <ScenarioToggle
          presets={SCENARIO_PRESETS}
          activeScenario={activeScenario}
          onSelect={(preset) => setAssumptions({ ...preset.assumptions })}
        />
      </div>

      {/* Sliders + Results */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Assumption Sliders */}
        <div class="space-y-5">
          <h3 class="heading-md text-text-primary mb-1">Assumptions</h3>
          <ForecastSlider
            label="Revenue Growth Rate"
            value={assumptions.revenueGrowthRate}
            min={0}
            max={25}
            step={1}
            unit="%"
            onChange={(v) => update('revenueGrowthRate', v)}
          />
          <ForecastSlider
            label="Average Deal Size"
            value={assumptions.averageDealSize}
            min={20}
            max={80}
            step={5}
            unit="$"
            onChange={(v) => update('averageDealSize', v)}
          />
          <ForecastSlider
            label="Headcount Additions"
            value={assumptions.headcountAdditions}
            min={0}
            max={30}
            step={1}
            unit=""
            onChange={(v) => update('headcountAdditions', v)}
          />
          <ForecastSlider
            label="Salary Inflation"
            value={assumptions.salaryInflation}
            min={0}
            max={8}
            step={0.5}
            unit="%"
            onChange={(v) => update('salaryInflation', v)}
          />
          <ForecastSlider
            label="Marketing Spend (% Rev)"
            value={assumptions.marketingSpendPct}
            min={3}
            max={15}
            step={0.5}
            unit="%"
            onChange={(v) => update('marketingSpendPct', v)}
          />
        </div>

        {/* Right: Forecast Results */}
        <div class="space-y-4">
          <h3 class="heading-md text-text-primary mb-1">Forecast Results</h3>

          <div class="bg-bg-secondary border border-border rounded-sm p-4 space-y-3">
            <ResultRow label="Total Revenue" value={formatCurrency(result.totalRevenue)}>
              <MiniSparkline data={result.monthlyRevenue} />
            </ResultRow>
            <ResultRow label="Gross Profit" value={formatCurrency(result.grossProfit)} />
            <ResultRow
              label="Gross Margin"
              value={formatPercent(result.grossMargin)}
            />
            <div class="border-t border-border" />
            <ResultRow label="Total OpEx" value={formatCurrency(result.totalOpex)} />
            <ResultRow label="Op. Income" value={formatCurrency(result.operatingIncome)} highlight>
              <MiniSparkline data={result.monthlyOpIncome} color={result.operatingIncome >= 0 ? '#2E7D32' : '#C62828'} />
            </ResultRow>
            <ResultRow
              label="Op. Margin"
              value={formatPercent(result.operatingMargin)}
              highlight
            />
            <div class="border-t border-border" />
            <ResultRow label="Headcount" value={result.headcount.toString()} />
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div>
        <h3 class="heading-md text-text-primary mb-4">Scenario Comparison</h3>
        <ScenarioComparisonTable presets={SCENARIO_PRESETS} />
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight = false,
  children,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  children?: preact.ComponentChildren;
}) {
  return (
    <div class="flex items-center justify-between gap-2">
      <span class={`text-sm ${highlight ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
        {label}
      </span>
      <div class="flex items-center gap-3">
        {children}
        <span class={`font-mono text-sm ${highlight ? 'font-semibold text-accent' : 'text-text-primary'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
