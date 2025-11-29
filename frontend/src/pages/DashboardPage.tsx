/**
 * Dashboard page showing user's deals and summary metrics.
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dealsApi } from '../lib/api/deals';
import type { Deal } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  const { user } = useAuth();
  const { data: deals, isLoading, error } = useQuery<Deal[]>({
    queryKey: ['deals'],
    queryFn: () => dealsApi.getDeals(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 border border-red-100">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
            </div>
          </div>
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

  const totalPortfolioValue = dealsList.reduce((sum, deal) => sum + deal.purchase_price, 0);

  const avgCapRate =
    dealsWithAnalytics.length > 0
      ? dealsWithAnalytics.reduce((sum, deal) => {
          const noi = deal.snapshot_of_analytics_result?.cash_flow.noi_annual || 0;
          const capRate = (noi / deal.purchase_price) * 100;
          return sum + capRate;
        }, 0) / dealsWithAnalytics.length
      : 0;

  const totalMonthlyCashFlow = dealsWithAnalytics.reduce((sum, deal) => {
    return sum + (deal.snapshot_of_analytics_result?.cash_flow.monthly_cash_flow || 0);
  }, 0);

  // Prepare chart data
  const chartData = dealsWithAnalytics.map(deal => ({
    name: deal.property?.address_line1?.split(',')[0] || `Deal #${deal.id}`,
    cashFlow: deal.snapshot_of_analytics_result?.cash_flow.monthly_cash_flow || 0,
  })).slice(0, 5); // Top 5

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-6 border border-primary-100 bg-gradient-to-r from-white via-slate-50 to-primary-50/40 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-xs font-semibold text-primary-800 uppercase tracking-wide">
              <span className="h-2 w-2 rounded-full bg-primary-600 animate-pulse" aria-hidden />
              Portfolio Pulse
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {user?.full_name.split(' ')[0]}
              </h1>
              <p className="mt-1 text-slate-600">
                A calm overview of performance, cash flow, and risk across your holdings.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 border border-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                <span className="font-semibold text-slate-900">{totalDeals}</span>
                <span className="text-slate-500">properties tracked</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 border border-slate-200">
                <span className="h-2 w-2 rounded-full bg-primary-600" aria-hidden />
                <span className="font-semibold text-slate-900">{formatCurrency(totalMonthlyCashFlow)}</span>
                <span className="text-slate-500">monthly cash flow</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 border border-slate-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                <span className="font-semibold text-slate-900">{formatPercent(avgCapRate)}</span>
                <span className="text-slate-500">avg. cap rate</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-center">
            <Link
              to="/leads"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-primary-200 hover:text-primary-800"
            >
              View Pipeline
            </Link>
            <Link
              to="/deals/new"
              className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-900/10 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Deal Analysis
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0 p-3 rounded-lg bg-primary-50">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">Portfolio</span>
          </div>
          <dl className="mt-5">
            <dt className="text-sm font-medium text-slate-500 truncate">Total Properties</dt>
            <dd className="text-2xl font-semibold text-slate-900">{totalDeals}</dd>
          </dl>
        </div>

        <div className="card p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0 p-3 rounded-lg bg-emerald-50">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Cash Flow</span>
          </div>
          <dl className="mt-5">
            <dt className="text-sm font-medium text-slate-500 truncate">Total Monthly Cash Flow</dt>
            <dd className="text-2xl font-semibold text-slate-900">{formatCurrency(totalMonthlyCashFlow)}</dd>
          </dl>
        </div>

        <div className="card p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0 p-3 rounded-lg bg-sky-50">
              <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">Performance</span>
          </div>
          <dl className="mt-5">
            <dt className="text-sm font-medium text-slate-500 truncate">Avg. Cap Rate</dt>
            <dd className="text-2xl font-semibold text-slate-900">{formatPercent(avgCapRate)}</dd>
          </dl>
        </div>

        <div className="card p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0 p-3 rounded-lg bg-primary-50">
              <svg className="h-6 w-6 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-900 bg-primary-50 px-2.5 py-1 rounded-full">Equity</span>
          </div>
          <dl className="mt-5">
            <dt className="text-sm font-medium text-slate-500 truncate">Portfolio Value</dt>
            <dd className="text-2xl font-semibold text-slate-900">{formatCurrency(totalPortfolioValue)}</dd>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-1">
            <div className="card h-full border border-slate-200 shadow-soft">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Insights</p>
                        <h3 className="text-lg font-semibold text-slate-900">Cash Flow by Property</h3>
                        <p className="text-sm text-slate-500 mt-1">Top performing assets ranked by monthly cash flow.</p>
                      </div>
                      <span className="rounded-full bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1">Live</span>
                    </div>
                </div>
                <div className="p-6 h-80 bg-slate-50/60">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9F0" />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#9AA5B1" fontSize={12} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    cursor={{fill: '#F6F8FB'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="cashFlow" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.cashFlow >= 0 ? '#1A73E8' : '#EF4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-inner text-slate-400 mb-3">
                              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
                              </svg>
                            </div>
                            Not enough data to display chart yet
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Recent Deals Table */}
        <div className="lg:col-span-2">
            <div className="card h-full flex flex-col border border-slate-200 shadow-soft">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Deals</p>
                      <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
                    </div>
                    <Link to="/leads" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View all &rarr;</Link>
                </div>
                <div className="overflow-x-auto flex-grow">
                    {dealsList.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto h-12 w-12 text-slate-300">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-semibold text-slate-900">No deals</h3>
                            <p className="mt-1 text-sm text-slate-500">Get started by creating a new deal analysis.</p>
                            <div className="mt-6">
                                <Link to="/deals/new" className="btn-primary">
                                    Analyze Property
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Cash Flow</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {dealsList.slice(0, 5).map((deal, index) => {
                                    const analytics = deal.snapshot_of_analytics_result;
                                    const cashFlow = analytics?.cash_flow;
                                    const analysis = analytics?.deal_analysis;
                                    
                                    return (
                                        <tr key={deal.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100 transition-colors`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {deal.property?.address_line1 || 'Unlinked Property'}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {deal.property ? `${deal.property.city}, ${deal.property.state}` : 'Draft Analysis'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-medium">
                                                {formatCurrency(deal.purchase_price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                {cashFlow ? (
                                                    <span className={cashFlow.monthly_cash_flow >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                                                        {formatCurrency(cashFlow.monthly_cash_flow)}/mo
                                                    </span>
                                                ) : <span className="text-slate-400">-</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {analysis && (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        analysis.overall_score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                                        analysis.overall_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {analysis.overall_score}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link to={`/deals/${deal.id}`} className="text-primary-600 hover:text-primary-700">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
