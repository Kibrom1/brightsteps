/**
 * Bar chart showing monthly or annual cash flow per deal.
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import type { Deal } from '../../types';
import { formatCurrency } from '../../lib/utils/formatters';

interface CashFlowPerDealChartProps {
  deals: Deal[];
  showAnnual?: boolean;
}

export function CashFlowPerDealChart({ deals, showAnnual = false }: CashFlowPerDealChartProps) {
  const data = deals
    .map((deal) => {
      const cashFlow = deal.snapshot_of_analytics_result?.cash_flow;
      return {
        dealId: deal.id,
        name: deal.property?.address_line1 || `Deal #${deal.id}`,
        monthlyCashFlow: cashFlow?.monthly_cash_flow || 0,
        annualCashFlow: cashFlow?.annual_cash_flow || 0,
      };
    })
    .filter((d) => (showAnnual ? d.annualCashFlow !== 0 : d.monthlyCashFlow !== 0))
    .sort((a, b) => {
      const aValue = showAnnual ? a.annualCashFlow : a.monthlyCashFlow;
      const bValue = showAnnual ? b.annualCashFlow : b.monthlyCashFlow;
      return bValue - aValue;
    })
    .slice(0, 10);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No cash flow data available
      </div>
    );
  }

  const getColor = (value: number) => {
    if (value >= 0) return '#10b981'; // green-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{
              value: showAnnual ? 'Annual Cash Flow ($)' : 'Monthly Cash Flow ($)',
              angle: -90,
              position: 'insideLeft',
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `Deal: ${label}`}
          />
          <Legend />
          <Bar
            dataKey={showAnnual ? 'annualCashFlow' : 'monthlyCashFlow'}
            name={showAnnual ? 'Annual Cash Flow' : 'Monthly Cash Flow'}
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(showAnnual ? entry.annualCashFlow : entry.monthlyCashFlow)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

