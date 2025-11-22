/**
 * Dashboard page showing user's deals and summary metrics.
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dealsApi } from '../lib/api/deals';
import type { Deal } from '../types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function DashboardPage() {
  const { data: deals, isLoading, error } = useQuery<Deal[]>({
    queryKey: ['deals'],
    queryFn: () => dealsApi.getDeals(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Loading deals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">
          Error loading deals: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const dealsList = deals || [];

  // Calculate summary metrics
  const totalDeals = dealsList.length;
  const dealsWithAnalytics = dealsList.filter(
    (deal) => deal.snapshot_of_analytics_result?.cash_flow
  );

  const avgCapRate =
    dealsWithAnalytics.length > 0
      ? dealsWithAnalytics.reduce((sum, deal) => {
          const noi = deal.snapshot_of_analytics_result?.cash_flow.noi_annual || 0;
          const capRate = (noi / deal.purchase_price) * 100;
          return sum + capRate;
        }, 0) / dealsWithAnalytics.length
      : 0;

  const avgMonthlyCashFlow =
    dealsWithAnalytics.length > 0
      ? dealsWithAnalytics.reduce((sum, deal) => {
          return sum + (deal.snapshot_of_analytics_result?.cash_flow.monthly_cash_flow || 0);
        }, 0) / dealsWithAnalytics.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/deals/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Create New Deal
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Deals</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalDeals}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Cap Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatPercent(avgCapRate)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Monthly Cash Flow</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(avgMonthlyCashFlow)}</p>
        </div>
      </div>

      {/* Deals List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Deals</h2>
        </div>
        {dealsList.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 mb-4">You don't have any deals yet.</p>
            <Link
              to="/deals/new"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first deal →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Cash Flow
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DSCR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dealsList.map((deal) => {
                  const analytics = deal.snapshot_of_analytics_result;
                  const cashFlow = analytics?.cash_flow;
                  const dscr = analytics?.dscr;
                  const analysis = analytics?.deal_analysis;

                  return (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {deal.property?.address_line1 || 'No property linked'}
                        </div>
                        {deal.property && (
                          <div className="text-sm text-gray-500">
                            {deal.property.city}, {deal.property.state}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(deal.purchase_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(deal.monthly_rent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {cashFlow ? (
                          <span
                            className={
                              cashFlow.monthly_cash_flow >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {formatCurrency(cashFlow.monthly_cash_flow)}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dscr?.dscr !== null && dscr?.dscr !== undefined
                          ? dscr.dscr.toFixed(2)
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {analysis && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              analysis.label === 'Strong Deal'
                                ? 'bg-green-100 text-green-800'
                                : analysis.label === 'Neutral'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {analysis.overall_score}/100
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/deals/${deal.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

