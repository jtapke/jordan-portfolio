import { useState } from 'preact/hooks';
import type { DashboardTab, Month } from '../../lib/fpaTypes';
import { PL_DATA } from '../../lib/fpaData';
import { computeKPIs } from '../../lib/fpaCalculations';
import { formatCurrency, formatVariance } from './formatters';
import TabBar from './TabBar';
import KPICard from './KPICard';
import PLSummaryView from './PLSummaryView';
import VarianceWaterfall from './VarianceWaterfall';
import ForecastModel from './ForecastModel';
import DepartmentDrillDown from './DepartmentDrillDown';

export default function FPADashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('pl-summary');
  const [selectedMonth, setSelectedMonth] = useState<Month>('Dec');

  const kpis = computeKPIs(PL_DATA, selectedMonth);
  const totalVariance = kpis.totalVariance;
  const varianceFavorable = totalVariance >= 0;

  return (
    <div class="space-y-6">
      {/* KPI Strip */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label="Total Revenue"
          value={formatCurrency(kpis.revenue.actual)}
          trend={{
            value: formatVariance(kpis.revenue.actual - kpis.revenue.budget) + ' vs budget',
            favorable: kpis.revenue.actual >= kpis.revenue.budget,
          }}
        />
        <KPICard
          label="Gross Profit"
          value={formatCurrency(kpis.grossProfit.actual)}
          trend={{
            value: formatVariance(kpis.grossProfit.actual - kpis.grossProfit.budget) + ' vs budget',
            favorable: kpis.grossProfit.actual >= kpis.grossProfit.budget,
          }}
        />
        <KPICard
          label="Op. Income"
          value={formatCurrency(kpis.opIncome.actual)}
          trend={{
            value: formatVariance(totalVariance) + ' vs budget',
            favorable: varianceFavorable,
          }}
        />
        <KPICard
          label="Op. Margin"
          value={
            ((kpis.opIncome.actual / kpis.revenue.actual) * 100).toFixed(1) + '%'
          }
          trend={{
            value:
              (((kpis.opIncome.actual / kpis.revenue.actual) -
                (kpis.opIncome.budget / kpis.revenue.budget)) *
                100
              ).toFixed(1) + 'pp vs budget',
            favorable:
              kpis.opIncome.actual / kpis.revenue.actual >=
              kpis.opIncome.budget / kpis.revenue.budget,
          }}
        />
      </div>

      {/* Tab Navigation */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Active View */}
      <div>
        {activeTab === 'pl-summary' && (
          <PLSummaryView
            pl={PL_DATA}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        )}
        {activeTab === 'variance' && (
          <VarianceWaterfall pl={PL_DATA} throughMonth={selectedMonth} />
        )}
        {activeTab === 'forecast' && <ForecastModel />}
        {activeTab === 'departments' && (
          <DepartmentDrillDown pl={PL_DATA} throughMonth={selectedMonth} />
        )}
      </div>
    </div>
  );
}
