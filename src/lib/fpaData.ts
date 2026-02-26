import type { Month, LineItem, PLSummary, ForecastAssumptions, ScenarioPreset, MONTHS as MonthsType } from './fpaTypes';
import { MONTHS } from './fpaTypes';

function monthly(budgets: number[], actuals: number[]): { month: Month; budget: number; actual: number }[] {
  return MONTHS.map((m, i) => ({ month: m, budget: budgets[i], actual: actuals[i] }));
}

// Meridian Analytics — Mid-size SaaS, FY2025, ~$50M revenue, ~200 employees

const lineItems: LineItem[] = [
  // === REVENUE ===
  {
    id: 'rev-subs',
    label: 'Software Subscriptions',
    category: 'revenue',
    monthlyData: monthly(
      [2800, 2850, 2900, 2950, 3000, 3050, 3100, 3150, 3200, 3250, 3300, 3350],
      [2830, 2870, 2950, 2980, 3020, 3100, 3140, 3090, 3250, 3310, 3350, 3400]
    ),
  },
  {
    id: 'rev-services',
    label: 'Professional Services',
    category: 'revenue',
    monthlyData: monthly(
      [800, 820, 840, 860, 880, 900, 920, 940, 960, 980, 1000, 1020],
      [780, 850, 810, 890, 860, 920, 950, 900, 980, 1010, 970, 1050]
    ),
  },
  {
    id: 'rev-training',
    label: 'Training & Support',
    category: 'revenue',
    monthlyData: monthly(
      [350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460],
      [340, 370, 360, 400, 380, 410, 420, 390, 450, 430, 460, 470]
    ),
  },
  {
    id: 'rev-total',
    label: 'Total Revenue',
    category: 'revenue',
    isSubtotal: true,
    isBold: true,
    monthlyData: monthly(
      [3950, 4030, 4110, 4190, 4270, 4350, 4430, 4510, 4590, 4670, 4750, 4830],
      [3950, 4090, 4120, 4270, 4260, 4430, 4510, 4380, 4680, 4750, 4780, 4920]
    ),
  },

  // === COGS ===
  {
    id: 'cogs-hosting',
    label: 'Hosting & Infrastructure',
    category: 'cogs',
    monthlyData: monthly(
      [420, 425, 430, 435, 440, 445, 450, 455, 460, 465, 470, 475],
      [430, 440, 435, 450, 445, 460, 465, 470, 475, 480, 485, 490]
    ),
  },
  {
    id: 'cogs-cs',
    label: 'Customer Success',
    category: 'cogs',
    monthlyData: monthly(
      [380, 385, 390, 395, 400, 405, 410, 415, 420, 425, 430, 435],
      [385, 390, 395, 400, 410, 415, 420, 425, 430, 435, 440, 445]
    ),
  },
  {
    id: 'cogs-impl',
    label: 'Implementation Costs',
    category: 'cogs',
    monthlyData: monthly(
      [200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310],
      [210, 220, 215, 240, 235, 260, 275, 265, 290, 300, 295, 320]
    ),
  },
  {
    id: 'cogs-total',
    label: 'Total COGS',
    category: 'cogs',
    isSubtotal: true,
    isBold: true,
    monthlyData: monthly(
      [1000, 1020, 1040, 1060, 1080, 1100, 1120, 1140, 1160, 1180, 1200, 1220],
      [1025, 1050, 1045, 1090, 1090, 1135, 1160, 1160, 1195, 1215, 1220, 1255]
    ),
  },

  // === OPEX — SALES ===
  {
    id: 'opex-sales-comp',
    label: 'Sales Compensation',
    category: 'opex',
    department: 'Sales',
    monthlyData: monthly(
      [520, 525, 530, 535, 540, 545, 550, 555, 560, 565, 570, 575],
      [530, 540, 545, 550, 555, 560, 570, 575, 580, 585, 590, 600]
    ),
  },
  {
    id: 'opex-sales-mktg',
    label: 'Marketing',
    category: 'opex',
    department: 'Sales',
    monthlyData: monthly(
      [300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 355],
      [310, 315, 320, 330, 340, 350, 380, 390, 370, 355, 360, 365]
    ),
  },
  {
    id: 'opex-sales-travel',
    label: 'Travel & Entertainment',
    category: 'opex',
    department: 'Sales',
    monthlyData: monthly(
      [80, 85, 90, 95, 100, 105, 100, 95, 90, 85, 80, 75],
      [85, 90, 100, 105, 110, 115, 120, 110, 95, 90, 85, 80]
    ),
  },
  {
    id: 'opex-sales-tools',
    label: 'Sales Tools & Software',
    category: 'opex',
    department: 'Sales',
    monthlyData: monthly(
      [45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45],
      [45, 45, 48, 48, 48, 48, 50, 50, 50, 50, 50, 50]
    ),
  },

  // === OPEX — ENGINEERING ===
  {
    id: 'opex-eng-sal',
    label: 'Engineering Salaries',
    category: 'opex',
    department: 'Engineering',
    monthlyData: monthly(
      [680, 690, 700, 710, 720, 730, 740, 750, 760, 770, 780, 790],
      [690, 700, 715, 725, 740, 755, 770, 780, 790, 800, 810, 825]
    ),
  },
  {
    id: 'opex-eng-cloud',
    label: 'Cloud Development',
    category: 'opex',
    department: 'Engineering',
    monthlyData: monthly(
      [120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142],
      [125, 128, 130, 132, 135, 138, 140, 142, 145, 148, 150, 152]
    ),
  },
  {
    id: 'opex-eng-lic',
    label: 'Software Licenses',
    category: 'opex',
    department: 'Engineering',
    monthlyData: monthly(
      [55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
      [55, 55, 58, 58, 58, 60, 60, 60, 62, 62, 62, 65]
    ),
  },
  {
    id: 'opex-eng-rd',
    label: 'R&D Expenses',
    category: 'opex',
    department: 'Engineering',
    monthlyData: monthly(
      [90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112],
      [88, 95, 92, 100, 96, 105, 108, 100, 110, 112, 108, 115]
    ),
  },

  // === OPEX — G&A ===
  {
    id: 'opex-ga-exec',
    label: 'Executive Compensation',
    category: 'opex',
    department: 'G&A',
    monthlyData: monthly(
      [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250],
      [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250]
    ),
  },
  {
    id: 'opex-ga-rent',
    label: 'Rent & Facilities',
    category: 'opex',
    department: 'G&A',
    monthlyData: monthly(
      [180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180],
      [180, 180, 180, 180, 180, 180, 185, 185, 185, 185, 185, 185]
    ),
  },
  {
    id: 'opex-ga-legal',
    label: 'Legal & Compliance',
    category: 'opex',
    department: 'G&A',
    monthlyData: monthly(
      [60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60],
      [55, 65, 58, 70, 62, 75, 68, 80, 65, 72, 60, 78]
    ),
  },
  {
    id: 'opex-ga-hr',
    label: 'HR & Recruiting',
    category: 'opex',
    department: 'G&A',
    monthlyData: monthly(
      [70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92],
      [75, 80, 85, 90, 88, 92, 95, 98, 100, 95, 92, 98]
    ),
  },
  {
    id: 'opex-ga-ins',
    label: 'Insurance',
    category: 'opex',
    department: 'G&A',
    monthlyData: monthly(
      [35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35],
      [35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35]
    ),
  },
];

export const PL_DATA: PLSummary = {
  fiscalYear: 2025,
  companyName: 'Meridian Analytics',
  lineItems,
};

export const BASE_ASSUMPTIONS: ForecastAssumptions = {
  revenueGrowthRate: 10,
  averageDealSize: 45,
  headcountAdditions: 12,
  salaryInflation: 3,
  marketingSpendPct: 8,
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    name: 'Base',
    assumptions: { ...BASE_ASSUMPTIONS },
    color: '#E07A2F',
  },
  {
    name: 'Upside',
    assumptions: {
      revenueGrowthRate: 15,
      averageDealSize: 55,
      headcountAdditions: 18,
      salaryInflation: 3,
      marketingSpendPct: 10,
    },
    color: '#2E7D32',
  },
  {
    name: 'Downside',
    assumptions: {
      revenueGrowthRate: 5,
      averageDealSize: 35,
      headcountAdditions: 5,
      salaryInflation: 4,
      marketingSpendPct: 6,
    },
    color: '#C62828',
  },
];

export const BASE_HEADCOUNT = 195;
export const BASE_ANNUAL_REVENUE = 53_140; // sum of total revenue line YTD budget in $K
