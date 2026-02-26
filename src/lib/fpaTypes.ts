export type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun'
  | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';

export const MONTHS: Month[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export type Department = 'Sales' | 'Engineering' | 'G&A';

export type LineItemCategory = 'revenue' | 'cogs' | 'opex';

export interface MonthlyFigure {
  month: Month;
  budget: number;
  actual: number;
}

export interface LineItem {
  id: string;
  label: string;
  category: LineItemCategory;
  department?: Department;
  isSubtotal?: boolean;
  isBold?: boolean;
  monthlyData: MonthlyFigure[];
}

export interface PLSummary {
  fiscalYear: number;
  companyName: string;
  lineItems: LineItem[];
}

export interface WaterfallSegment {
  label: string;
  value: number;
  startValue: number;
  endValue: number;
  type: 'start' | 'positive' | 'negative' | 'total';
}

export interface ForecastAssumptions {
  revenueGrowthRate: number;
  averageDealSize: number;
  headcountAdditions: number;
  salaryInflation: number;
  marketingSpendPct: number;
}

export interface ForecastResult {
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  grossMargin: number;
  totalOpex: number;
  operatingIncome: number;
  operatingMargin: number;
  headcount: number;
  monthlyRevenue: number[];
  monthlyOpIncome: number[];
}

export interface ScenarioPreset {
  name: 'Base' | 'Upside' | 'Downside';
  assumptions: ForecastAssumptions;
  color: string;
}

export interface DepartmentSummary {
  department: Department;
  totalBudget: number;
  totalActual: number;
  variance: number;
  variancePct: number;
  lineItems: LineItem[];
  biggestVariances: VarianceCallout[];
}

export interface VarianceCallout {
  lineItemLabel: string;
  variance: number;
  variancePct: number;
  direction: 'favorable' | 'unfavorable';
}

export type DashboardTab = 'pl-summary' | 'variance' | 'forecast' | 'departments';
