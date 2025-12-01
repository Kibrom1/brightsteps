/**
 * Dashboard page showing user's deals and summary metrics.
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dealsApi } from '../lib/api/deals';
import type { Deal } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PageTitle } from '../components/PageTitle';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: deals, isLoading, error } = useQuery<Deal[]>({
    queryKey: ['deals'],
    queryFn: () => dealsApi.getDeals(),
  });

  if (isLoading) {
    return (
      <>
        <PageTitle title="Dashboard" description="View your portfolio overview and recent deals" />
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton height={36} width="300px" />
              <Skeleton height={20} width="400px" />
            </div>
            <Skeleton height={40} width="180px" className="mt-4 sm:mt-0" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SkeletonCard className="lg:col-span-1" />
            <SkeletonCard className="lg:col-span-2" />
          </div>
        </div>
      </>
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
    <>
      <PageTitle title="Dashboard" description="View your portfolio overview and recent deals" />
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.full_name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-slate-500">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/deals/new"
            className="btn-primary shadow-lg shadow-primary-900/20"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Deal Analysis
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6 border-l-4 border-l-primary-500">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-primary-50">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Total Properties</dt>
                <dd className="text-2xl font-semibold text-slate-900">{totalDeals}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-emerald-50">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Total Monthly Cash Flow</dt>
                <dd className="text-2xl font-semibold text-slate-900">{formatCurrency(totalMonthlyCashFlow)}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-sky-500">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-sky-50">
              <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Avg. Cap Rate</dt>
                <dd className="text-2xl font-semibold text-slate-900">{formatPercent(avgCapRate)}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-indigo-50">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Portfolio Value</dt>
                <dd className="text-2xl font-semibold text-slate-900">{formatCurrency(totalPortfolioValue)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-1">
            <div className="card h-full">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-medium text-slate-900">Cash Flow by Property</h3>
                </div>
                <div className="p-6 h-80">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value}`} />
                                <Tooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                                />
                                <Bar dataKey="cashFlow" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.cashFlow >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                            Not enough data to display chart
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Recent Deals Table */}
        <div className="lg:col-span-2">
            <div className="card h-full flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-slate-900">Recent Deals</h3>
                    <Link to="/leads" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all &rarr;</Link>
                </div>
                <div className="overflow-x-auto flex-grow">
                    {dealsList.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto h-12 w-12 text-slate-300">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-slate-900">No deals</h3>
                            <p className="mt-1 text-sm text-slate-500">Get started by creating a new deal analysis.</p>
                            <div className="mt-6">
                                <Link to="/deals/new" className="btn-primary">
                                    Analyze Property
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Cash Flow</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {dealsList.slice(0, 5).map((deal) => {
                                    const analytics = deal.snapshot_of_analytics_result;
                                    const cashFlow = analytics?.cash_flow;
                                    const analysis = analytics?.deal_analysis;
                                    
                                    return (
                                        <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
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
                                                <Link to={`/deals/${deal.id}`} className="text-primary-600 hover:text-primary-900">
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
    </>
  );
}
