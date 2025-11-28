/**
 * Bar chart showing cap rate per deal, sorted highest to lowest.
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Deal } from '../../types';
import { formatPercent, formatCurrency } from '../../lib/utils/formatters';

interface CapRatePerDealChartProps {
  deals: Deal[];
}

export function CapRatePerDealChart({ deals }: CapRatePerDealChartProps) {
  // Calculate cap rate for each deal and sort
  const data = deals
    .map((deal) => {
      const noi = deal.snapshot_of_analytics_result?.cash_flow.noi_annual || 0;
      const capRate = deal.purchase_price > 0 ? (noi / deal.purchase_price) * 100 : 0;
      return {
        dealId: deal.id,
        name: deal.property?.address_line1 || `Deal #${deal.id}`,
        capRate: capRate,
      };
    })
    .filter((d) => d.capRate > 0)
    .sort((a, b) => b.capRate - a.capRate)
    .slice(0, 10); // Show top 10

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No cap rate data available
      </div>
    );
  }

  // Color bars based on cap rate (green for high, red for low)
  const getColor = (capRate: number) => {
    if (capRate >= 8) return '#10b981'; // green-500
    if (capRate >= 5) return '#f59e0b'; // amber-500
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
            label={{ value: 'Cap Rate (%)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatPercent(value)}
            labelFormatter={(label) => `Deal: ${label}`}
          />
          <Bar dataKey="capRate" name="Cap Rate" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.capRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

