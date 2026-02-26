import type {
  LineItem,
  PLSummary,
  WaterfallSegment,
  ForecastAssumptions,
  ForecastResult,
  DepartmentSummary,
  VarianceCallout,
  Department,
  Month,
} from './fpaTypes';
import { MONTHS } from './fpaTypes';
import { BASE_HEADCOUNT, BASE_ANNUAL_REVENUE } from './fpaData';

// ── Helpers ─────────────────────────────────────────────────────

function sumRange(data: { budget: number; actual: number }[], start: number, end: number) {
  let budget = 0;
  let actual = 0;
  for (let i = start; i <= end; i++) {
    budget += data[i].budget;
    actual += data[i].actual;
  }
  return { budget, actual };
}

export function monthIndex(month: Month): number {
  return MONTHS.indexOf(month);
}

// ── Variance helpers ────────────────────────────────────────────

export function computeVariance(budget: number, actual: number) {
  const variance = actual - budget;
  const variancePct = budget !== 0 ? (variance / Math.abs(budget)) * 100 : 0;
  return { variance, variancePct };
}

// ── YTD totals for a single line item through a given month ─────

export function computeYTD(item: LineItem, throughMonth: Month) {
  const end = monthIndex(throughMonth);
  return sumRange(item.monthlyData, 0, end);
}

// ── Full-year totals for a line item ────────────────────────────

export function computeFullYear(item: LineItem) {
  return sumRange(item.monthlyData, 0, 11);
}

// ── KPI strip values ────────────────────────────────────────────

export function computeKPIs(pl: PLSummary, throughMonth: Month) {
  const revLine = pl.lineItems.find((l) => l.id === 'rev-total')!;
  const cogsLine = pl.lineItems.find((l) => l.id === 'cogs-total')!;
  const opexItems = pl.lineItems.filter((l) => l.category === 'opex');

  const rev = computeYTD(revLine, throughMonth);
  const cogs = computeYTD(cogsLine, throughMonth);

  let opexBudget = 0;
  let opexActual = 0;
  for (const item of opexItems) {
    const ytd = computeYTD(item, throughMonth);
    opexBudget += ytd.budget;
    opexActual += ytd.actual;
  }

  const grossProfitBudget = rev.budget - cogs.budget;
  const grossProfitActual = rev.actual - cogs.actual;
  const opIncomeBudget = grossProfitBudget - opexBudget;
  const opIncomeActual = grossProfitActual - opexActual;

  return {
    revenue: { budget: rev.budget, actual: rev.actual },
    grossProfit: { budget: grossProfitBudget, actual: grossProfitActual },
    opIncome: { budget: opIncomeBudget, actual: opIncomeActual },
    totalVariance: opIncomeActual - opIncomeBudget,
  };
}

// ── Waterfall bridge: Budget Op Income → Actual Op Income ───────

export function buildWaterfallSegments(pl: PLSummary, throughMonth: Month): WaterfallSegment[] {
  const kpis = computeKPIs(pl, throughMonth);

  const revLine = pl.lineItems.find((l) => l.id === 'rev-total')!;
  const cogsLine = pl.lineItems.find((l) => l.id === 'cogs-total')!;
  const opexItems = pl.lineItems.filter((l) => l.category === 'opex');

  const revYTD = computeYTD(revLine, throughMonth);
  const cogsYTD = computeYTD(cogsLine, throughMonth);

  const revVariance = revYTD.actual - revYTD.budget;
  const cogsVariance = -(cogsYTD.actual - cogsYTD.budget); // negative COGS variance = unfavorable

  // Group opex by department
  const depts: Department[] = ['Sales', 'Engineering', 'G&A'];
  const deptVariances: { dept: Department; variance: number }[] = [];
  for (const dept of depts) {
    const items = opexItems.filter((l) => l.department === dept);
    let budgetSum = 0;
    let actualSum = 0;
    for (const item of items) {
      const ytd = computeYTD(item, throughMonth);
      budgetSum += ytd.budget;
      actualSum += ytd.actual;
    }
    // For expenses, negative variance (under budget) is favorable
    deptVariances.push({ dept, variance: -(actualSum - budgetSum) });
  }

  const segments: WaterfallSegment[] = [];
  let running = kpis.opIncome.budget;

  // Start bar
  segments.push({
    label: 'Budget Op. Income',
    value: kpis.opIncome.budget,
    startValue: 0,
    endValue: kpis.opIncome.budget,
    type: 'start',
  });

  // Revenue variance
  segments.push({
    label: 'Revenue',
    value: revVariance,
    startValue: running,
    endValue: running + revVariance,
    type: revVariance >= 0 ? 'positive' : 'negative',
  });
  running += revVariance;

  // COGS variance
  segments.push({
    label: 'COGS',
    value: cogsVariance,
    startValue: running,
    endValue: running + cogsVariance,
    type: cogsVariance >= 0 ? 'positive' : 'negative',
  });
  running += cogsVariance;

  // Department variances
  for (const { dept, variance } of deptVariances) {
    segments.push({
      label: dept,
      value: variance,
      startValue: running,
      endValue: running + variance,
      type: variance >= 0 ? 'positive' : 'negative',
    });
    running += variance;
  }

  // End bar
  segments.push({
    label: 'Actual Op. Income',
    value: kpis.opIncome.actual,
    startValue: 0,
    endValue: kpis.opIncome.actual,
    type: 'total',
  });

  return segments;
}

// ── Forecast model ──────────────────────────────────────────────

export function computeForecast(assumptions: ForecastAssumptions): ForecastResult {
  const {
    revenueGrowthRate,
    averageDealSize,
    headcountAdditions,
    salaryInflation,
    marketingSpendPct,
  } = assumptions;

  // Base: ~$53M annual revenue growing at revenueGrowthRate
  const totalRevenue = BASE_ANNUAL_REVENUE * (1 + revenueGrowthRate / 100);

  // COGS scales ~25% of revenue
  const totalCOGS = totalRevenue * 0.25;

  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin = (grossProfit / totalRevenue) * 100;

  // OpEx components
  const headcount = BASE_HEADCOUNT + headcountAdditions;
  const avgSalary = 110; // $110K average fully-loaded
  const personnelCost = headcount * avgSalary * (1 + salaryInflation / 100);
  const marketingCost = totalRevenue * (marketingSpendPct / 100);
  const otherOpex = 3800; // fixed G&A, rent, insurance, etc.
  const totalOpex = personnelCost + marketingCost + otherOpex;

  const operatingIncome = grossProfit - totalOpex;
  const operatingMargin = (operatingIncome / totalRevenue) * 100;

  // Monthly distribution (slight ramp through the year)
  const monthlyRevenue: number[] = [];
  const monthlyOpIncome: number[] = [];
  for (let i = 0; i < 12; i++) {
    const weight = 0.075 + (i * 0.004); // ~7.5% in Jan, ~9.9% in Dec
    const mRev = totalRevenue * weight;
    const mOpex = totalOpex / 12;
    const mCogs = totalCOGS / 12;
    monthlyRevenue.push(Math.round(mRev));
    monthlyOpIncome.push(Math.round(mRev - mCogs - mOpex));
  }

  return {
    totalRevenue: Math.round(totalRevenue),
    totalCOGS: Math.round(totalCOGS),
    grossProfit: Math.round(grossProfit),
    grossMargin: Math.round(grossMargin * 10) / 10,
    totalOpex: Math.round(totalOpex),
    operatingIncome: Math.round(operatingIncome),
    operatingMargin: Math.round(operatingMargin * 10) / 10,
    headcount,
    monthlyRevenue,
    monthlyOpIncome,
  };
}

// ── Department summaries ────────────────────────────────────────

export function buildDepartmentSummaries(pl: PLSummary, throughMonth: Month): DepartmentSummary[] {
  const depts: Department[] = ['Sales', 'Engineering', 'G&A'];

  return depts.map((dept) => {
    const items = pl.lineItems.filter(
      (l) => l.category === 'opex' && l.department === dept
    );

    let totalBudget = 0;
    let totalActual = 0;
    const variances: VarianceCallout[] = [];

    for (const item of items) {
      const ytd = computeYTD(item, throughMonth);
      totalBudget += ytd.budget;
      totalActual += ytd.actual;

      const { variance, variancePct } = computeVariance(ytd.budget, ytd.actual);
      variances.push({
        lineItemLabel: item.label,
        variance,
        variancePct,
        // For expenses: actual > budget is unfavorable
        direction: variance > 0 ? 'unfavorable' : 'favorable',
      });
    }

    const { variance, variancePct } = computeVariance(totalBudget, totalActual);

    // Sort by absolute variance descending, take top 3
    const biggestVariances = [...variances]
      .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
      .slice(0, 3);

    return {
      department: dept,
      totalBudget,
      totalActual,
      variance,
      variancePct,
      lineItems: items,
      biggestVariances,
    };
  });
}

// ── Top variances across all line items ─────────────────────────

export function getTopVariances(pl: PLSummary, throughMonth: Month, count = 5): VarianceCallout[] {
  const allCallouts: VarianceCallout[] = [];

  for (const item of pl.lineItems) {
    if (item.isSubtotal) continue;

    const ytd = computeYTD(item, throughMonth);
    const { variance, variancePct } = computeVariance(ytd.budget, ytd.actual);

    const isExpense = item.category === 'cogs' || item.category === 'opex';
    const direction: 'favorable' | 'unfavorable' = isExpense
      ? variance > 0
        ? 'unfavorable'
        : 'favorable'
      : variance >= 0
        ? 'favorable'
        : 'unfavorable';

    allCallouts.push({
      lineItemLabel: item.label,
      variance,
      variancePct,
      direction,
    });
  }

  return allCallouts
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, count);
}
