/**
 * Line chart showing cash flow projection over N years with rent/expense growth.
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Deal, CashFlowProjectionData } from '../../types';
import { formatCurrency } from '../../lib/utils/formatters';

interface DealCashFlowProjectionChartProps {
  deal: Deal;
  years?: number;
}

export function DealCashFlowProjectionChart({
  deal,
  years = 5,
}: DealCashFlowProjectionChartProps) {
  const analytics = deal.snapshot_of_analytics_result;
  const assumptions = deal.snapshot_of_assumptions;

  if (!analytics?.cash_flow) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No analytics data available for projection
      </div>
    );
  }

  const initialMonthlyCashFlow = analytics.cash_flow.monthly_cash_flow;
  const initialMonthlyRent = deal.monthly_rent;
  const initialMonthlyExpenses =
    analytics.cash_flow.monthly_cash_flow < 0
      ? initialMonthlyRent - initialMonthlyCashFlow
      : initialMonthlyRent - initialMonthlyCashFlow;

  const rentGrowthPercent = assumptions?.rent_growth_percent_annual || 3;
  const expenseGrowthPercent = 2; // Default if not in assumptions

  // Generate projection data
  const projectionData: CashFlowProjectionData[] = [];
  let currentRent = initialMonthlyRent;
  let currentExpenses = initialMonthlyExpenses;

  for (let year = 0; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      if (year === 0 && month === 1) {
        // Initial values
        projectionData.push({
          year,
          month,
          cashFlow: initialMonthlyCashFlow,
          rent: currentRent,
          expenses: currentExpenses,
        });
      } else {
        // Apply annual growth at start of each year
        if (month === 1 && year > 0) {
          currentRent = currentRent * (1 + rentGrowthPercent / 100);
          currentExpenses = currentExpenses * (1 + expenseGrowthPercent / 100);
        }

        const cashFlow = currentRent - currentExpenses;
        projectionData.push({
          year,
          month,
          cashFlow,
          rent: currentRent,
          expenses: currentExpenses,
        });
      }
    }
  }

  // Aggregate by year for display
  const yearlyData = [];
  for (let year = 0; year <= years; year++) {
    const yearData = projectionData.filter((d) => d.year === year);
    const avgCashFlow = yearData.reduce((sum, d) => sum + d.cashFlow, 0) / yearData.length;
    const avgRent = yearData.reduce((sum, d) => sum + d.rent, 0) / yearData.length;
    const avgExpenses = yearData.reduce((sum, d) => sum + d.expenses, 0) / yearData.length;

    yearlyData.push({
      year: `Year ${year}`,
      cashFlow: avgCashFlow * 12, // Annual
      rent: avgRent * 12,
      expenses: avgExpenses * 12,
    });
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            label={{ value: 'Annual Amount ($)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="cashFlow"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Annual Cash Flow"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="rent"
            stroke="#10b981"
            strokeWidth={2}
            name="Annual Rent"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={2}
            name="Annual Expenses"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

