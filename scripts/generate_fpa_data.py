#!/usr/bin/env python3
"""
Generate sample FP&A data for the Corporate FP&A Dashboard.

This script creates realistic budget vs. actual financial data for a fictional
mid-size SaaS company (Meridian Analytics, ~$50M revenue, ~200 employees).

Output: JSON that can be used to populate fpaData.ts

Usage:
    python generate_fpa_data.py
    python generate_fpa_data.py --seed 42
"""

import json
import random
import argparse
from dataclasses import dataclass, asdict

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@dataclass
class MonthlyFigure:
    month: str
    budget: int
    actual: int


@dataclass
class LineItem:
    id: str
    label: str
    category: str
    department: str | None = None
    is_subtotal: bool = False
    is_bold: bool = False
    monthly_data: list[MonthlyFigure] | None = None


def generate_monthly(
    base: int,
    monthly_growth: float = 0.0,
    variance_pct: float = 0.03,
    rng: random.Random | None = None
) -> tuple[list[int], list[int]]:
    """Generate 12 months of budget and actual figures."""
    rng = rng or random.Random()
    budgets = []
    actuals = []
    for i in range(12):
        b = round(base + base * monthly_growth * i)
        # Actual deviates from budget by variance_pct (random)
        deviation = rng.uniform(-variance_pct, variance_pct * 1.5)
        a = round(b * (1 + deviation))
        budgets.append(b)
        actuals.append(a)
    return budgets, actuals


def build_line_items(rng: random.Random) -> list[dict]:
    items = []

    # --- Revenue ---
    rev_configs = [
        ("rev-subs", "Software Subscriptions", 2800, 0.018, 0.03),
        ("rev-services", "Professional Services", 800, 0.022, 0.05),
        ("rev-training", "Training & Support", 350, 0.025, 0.04),
    ]

    rev_budgets_total = [0] * 12
    rev_actuals_total = [0] * 12

    for id_, label, base, growth, var_pct in rev_configs:
        budgets, actuals = generate_monthly(base, growth, var_pct, rng)
        rev_budgets_total = [a + b for a, b in zip(rev_budgets_total, budgets)]
        rev_actuals_total = [a + b for a, b in zip(rev_actuals_total, actuals)]
        items.append({
            "id": id_, "label": label, "category": "revenue",
            "monthlyData": [{"month": m, "budget": b, "actual": a}
                           for m, b, a in zip(MONTHS, budgets, actuals)]
        })

    items.append({
        "id": "rev-total", "label": "Total Revenue", "category": "revenue",
        "isSubtotal": True, "isBold": True,
        "monthlyData": [{"month": m, "budget": b, "actual": a}
                       for m, b, a in zip(MONTHS, rev_budgets_total, rev_actuals_total)]
    })

    # --- COGS ---
    cogs_configs = [
        ("cogs-hosting", "Hosting & Infrastructure", 420, 0.010, 0.03),
        ("cogs-cs", "Customer Success", 380, 0.012, 0.02),
        ("cogs-impl", "Implementation Costs", 200, 0.040, 0.05),
    ]

    cogs_budgets_total = [0] * 12
    cogs_actuals_total = [0] * 12

    for id_, label, base, growth, var_pct in cogs_configs:
        budgets, actuals = generate_monthly(base, growth, var_pct, rng)
        cogs_budgets_total = [a + b for a, b in zip(cogs_budgets_total, budgets)]
        cogs_actuals_total = [a + b for a, b in zip(cogs_actuals_total, actuals)]
        items.append({
            "id": id_, "label": label, "category": "cogs",
            "monthlyData": [{"month": m, "budget": b, "actual": a}
                           for m, b, a in zip(MONTHS, budgets, actuals)]
        })

    items.append({
        "id": "cogs-total", "label": "Total COGS", "category": "cogs",
        "isSubtotal": True, "isBold": True,
        "monthlyData": [{"month": m, "budget": b, "actual": a}
                       for m, b, a in zip(MONTHS, cogs_budgets_total, cogs_actuals_total)]
    })

    # --- OpEx ---
    opex_configs = [
        # Sales
        ("opex-sales-comp", "Sales Compensation", "Sales", 520, 0.008, 0.03),
        ("opex-sales-mktg", "Marketing", "Sales", 300, 0.015, 0.08),
        ("opex-sales-travel", "Travel & Entertainment", "Sales", 80, 0.0, 0.10),
        ("opex-sales-tools", "Sales Tools & Software", "Sales", 45, 0.0, 0.04),
        # Engineering
        ("opex-eng-sal", "Engineering Salaries", "Engineering", 680, 0.013, 0.03),
        ("opex-eng-cloud", "Cloud Development", "Engineering", 120, 0.015, 0.04),
        ("opex-eng-lic", "Software Licenses", "Engineering", 55, 0.0, 0.05),
        ("opex-eng-rd", "R&D Expenses", "Engineering", 90, 0.020, 0.06),
        # G&A
        ("opex-ga-exec", "Executive Compensation", "G&A", 250, 0.0, 0.0),
        ("opex-ga-rent", "Rent & Facilities", "G&A", 180, 0.0, 0.01),
        ("opex-ga-legal", "Legal & Compliance", "G&A", 60, 0.0, 0.12),
        ("opex-ga-hr", "HR & Recruiting", "G&A", 70, 0.025, 0.08),
        ("opex-ga-ins", "Insurance", "G&A", 35, 0.0, 0.0),
    ]

    for id_, label, dept, base, growth, var_pct in opex_configs:
        budgets, actuals = generate_monthly(base, growth, var_pct, rng)
        items.append({
            "id": id_, "label": label, "category": "opex", "department": dept,
            "monthlyData": [{"month": m, "budget": b, "actual": a}
                           for m, b, a in zip(MONTHS, budgets, actuals)]
        })

    return items


def main():
    parser = argparse.ArgumentParser(description="Generate FP&A sample data")
    parser.add_argument("--seed", type=int, default=2025, help="Random seed")
    args = parser.parse_args()

    rng = random.Random(args.seed)
    items = build_line_items(rng)

    output = {
        "fiscalYear": 2025,
        "companyName": "Meridian Analytics",
        "lineItems": items,
    }

    print(json.dumps(output, indent=2))
    print(f"\n# Generated {len(items)} line items with seed={args.seed}", file=__import__('sys').stderr)


if __name__ == "__main__":
    main()
