/**
 * Donut/pie chart showing portfolio breakdown by property type or location.
 */
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Deal, PortfolioBreakdownData } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/utils/formatters';

interface PortfolioBreakdownChartProps {
  deals: Deal[];
  breakdownBy?: 'property_type' | 'location';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function PortfolioBreakdownChart({
  deals,
  breakdownBy = 'property_type',
}: PortfolioBreakdownChartProps) {
  // Group deals by property type or location
  const breakdown = new Map<string, { count: number; totalValue: number }>();

  deals.forEach((deal) => {
    let key: string;
    if (breakdownBy === 'property_type') {
      key = deal.property?.property_type || 'Unknown';
    } else {
      // location: city, state
      if (deal.property) {
        key = `${deal.property.city}, ${deal.property.state}`;
      } else {
        key = 'Unknown';
      }
    }

    const existing = breakdown.get(key) || { count: 0, totalValue: 0 };
    breakdown.set(key, {
      count: existing.count + 1,
      totalValue: existing.totalValue + deal.purchase_price,
    });
  });

  const totalValue = Array.from(breakdown.values()).reduce((sum, item) => sum + item.totalValue, 0);

  const data: PortfolioBreakdownData[] = Array.from(breakdown.entries()).map(([category, item]) => ({
    category,
    count: item.count,
    totalValue: item.totalValue,
    percentage: totalValue > 0 ? (item.totalValue / totalValue) * 100 : 0,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No portfolio data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.totalValue,
    count: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${formatPercent(percentage)}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${formatCurrency(value)} (${props.payload.count} ${props.payload.count === 1 ? 'deal' : 'deals'})`,
              'Total Value',
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

