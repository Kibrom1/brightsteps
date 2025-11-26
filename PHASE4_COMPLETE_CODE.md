# Phase 4 - Complete Code Implementation

This document contains all the updated and new code files for Phase 4.

## Updated Files Summary

### 1. Dashboard Page (with Charts, Search, Filters)

See `UPDATED_DashboardPage.tsx` section below.

### 2. Deal Detail Page (with Comps, Projection Chart, PDF Export)

See `UPDATED_DealDetailPage.tsx` section below.

### 3. Profile Page (with Settings)

See `UPDATED_ProfilePage.tsx` section below.

### 4. Layout (with Notification Bell)

See `UPDATED_Layout.tsx` section below.

### 5. App.tsx (with Toast Provider)

See `UPDATED_App.tsx` section below.

---

## UPDATED_DashboardPage.tsx

```typescript
/**
 * Dashboard page with charts, search, and filters.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dealsApi } from '../lib/api/deals';
import { DealSearchBar } from '../components/deals/DealSearchBar';
import { DealFilters } from '../components/deals/DealFilters';
import { CapRatePerDealChart } from '../components/charts/CapRatePerDealChart';
import { CashFlowPerDealChart } from '../components/charts/CashFlowPerDealChart';
import { PortfolioBreakdownChart } from '../components/charts/PortfolioBreakdownChart';
import { SkeletonCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { filterDeals } from '../lib/utils/deal-filters';
import { exportToCSV } from '../lib/utils/csv-export';
import { useToast } from '../contexts/ToastContext';
import type { Deal, DealFilters as DealFiltersType } from '../types';
import { formatCurrency, formatPercent } from '../lib/utils/formatters';

export function DashboardPage() {
  const { data: allDeals, isLoading, error } = useQuery<Deal[]>({
    queryKey: ['deals'],
    queryFn: () => dealsApi.getDeals(),
  });

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<DealFiltersType>({});
  const { showToast } = useToast();

  // Filter deals
  const filteredDeals = allDeals
    ? filterDeals(allDeals, { ...filters, search })
    : [];

  // Calculate summary metrics
  const totalDeals = filteredDeals.length;
  const dealsWithAnalytics = filteredDeals.filter(
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

  const handleExportCSV = () => {
    try {
      const csvData = filteredDeals.map((deal) => {
        const noi = deal.snapshot_of_analytics_result?.cash_flow.noi_annual || 0;
        const capRate = deal.purchase_price > 0 ? (noi / deal.purchase_price) * 100 : 0;
        return {
          'Deal ID': deal.id,
          'Address': deal.property?.address_line1 || 'N/A',
          'City': deal.property?.city || 'N/A',
          'State': deal.property?.state || 'N/A',
          'ZIP': deal.property?.zip_code || 'N/A',
          'Property Type': deal.property?.property_type || 'N/A',
          'Purchase Price': deal.purchase_price,
          'Down Payment': deal.down_payment,
          'Monthly Rent': deal.monthly_rent,
          'Cap Rate (%)': capRate.toFixed(2),
          'Monthly Cash Flow': deal.snapshot_of_analytics_result?.cash_flow.monthly_cash_flow || 0,
          'Annual Cash Flow': deal.snapshot_of_analytics_result?.cash_flow.annual_cash_flow || 0,
          'DSCR': deal.snapshot_of_analytics_result?.dscr.dscr || 'N/A',
          'Score': deal.snapshot_of_analytics_result?.deal_analysis.overall_score || 'N/A',
        };
      });

      exportToCSV(csvData, { filename: `deals-export-${new Date().toISOString().split('T')[0]}.csv` });
      showToast('Deals exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to export deals', 'error');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          {filteredDeals.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Export CSV
            </button>
          )}
          <Link
            to="/deals/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Create New Deal
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <DealSearchBar value={search} onChange={setSearch} />
        <DealFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
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

      {/* Charts */}
      {filteredDeals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Cap Rate by Deal</h2>
            <CapRatePerDealChart deals={filteredDeals} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Cash Flow by Deal</h2>
            <CashFlowPerDealChart deals={filteredDeals} />
          </div>
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Breakdown</h2>
            <PortfolioBreakdownChart deals={filteredDeals} breakdownBy="property_type" />
          </div>
        </div>
      )}

      {/* Deals List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Deals</h2>
        </div>
        {filteredDeals.length === 0 ? (
          <EmptyState
            title="No deals found"
            message={allDeals && allDeals.length > 0 ? 'Try adjusting your filters' : "You don't have any deals yet."}
            actionLabel={allDeals && allDeals.length === 0 ? 'Create your first deal' : undefined}
            onAction={allDeals && allDeals.length === 0 ? () => window.location.href = '/deals/new' : undefined}
          />
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
                {filteredDeals.map((deal) => {
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
```

---

## UPDATED_DealDetailPage.tsx

```typescript
/**
 * Deal detail page with comps, projection chart, and PDF export.
 */
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '../lib/api/deals';
import { ComparableProperties } from '../components/deals/ComparableProperties';
import { DealCashFlowProjectionChart } from '../components/charts/DealCashFlowProjectionChart';
import { useToast } from '../contexts/ToastContext';
import type { Deal } from '../types';
import { formatCurrency, formatPercent } from '../lib/utils/formatters';

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const dealId = parseInt(id || '0', 10);

  const { data: deal, isLoading, error } = useQuery<Deal>({
    queryKey: ['deal', dealId],
    queryFn: () => dealsApi.getDeal(dealId),
    enabled: !!dealId,
  });

  const recalculateMutation = useMutation({
    mutationFn: () => dealsApi.recalculateDeal(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      showToast('Analytics recalculated successfully!', 'success');
    },
    onError: (err) => {
      showToast(`Failed to recalculate: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    },
  });

  const handleExportPDF = () => {
    const url = `/api/v1/deals/${dealId}/export.pdf`;
    window.open(url, '_blank');
    showToast('PDF export initiated', 'info');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Loading deal...</div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">
          {error instanceof Error ? error.message : 'Deal not found'}
        </div>
      </div>
    );
  }

  const analytics = deal.snapshot_of_analytics_result;
  const cashFlow = analytics?.cash_flow;
  const dscr = analytics?.dscr;
  const analysis = analytics?.deal_analysis;
  const assumptions = deal.snapshot_of_assumptions;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Deal Details</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => recalculateMutation.mutate()}
            disabled={recalculateMutation.isPending}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {recalculateMutation.isPending ? 'Recalculating...' : 'Recalculate Analytics'}
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
          >
            Export PDF
          </button>
          <Link
            to={`/deals/${deal.id}/edit`}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Edit Deal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Deal Information</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Purchase Price</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatCurrency(deal.purchase_price)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Down Payment</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatCurrency(deal.down_payment)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatPercent(deal.interest_rate)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Loan Term</dt>
              <dd className="mt-1 text-sm text-gray-900">{deal.loan_term_years} years</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Monthly Rent</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatCurrency(deal.monthly_rent)}</dd>
            </div>
            {deal.notes && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900">{deal.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Summary</h2>
            {cashFlow && (
              <div className="space-y-4 mb-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Monthly Cash Flow</dt>
                  <dd
                    className={`mt-1 text-2xl font-bold ${
                      cashFlow.monthly_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(cashFlow.monthly_cash_flow)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Annual Cash Flow</dt>
                  <dd className="mt-1 text-lg text-gray-900">
                    {formatCurrency(cashFlow.annual_cash_flow)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cash-on-Cash Return</dt>
                  <dd className="mt-1 text-lg text-gray-900">
                    {formatPercent(cashFlow.cash_on_cash_return)}
                  </dd>
                </div>
                {dscr && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">DSCR</dt>
                    <dd className="mt-1 text-lg text-gray-900">
                      {dscr.dscr !== null && dscr.dscr !== undefined
                        ? dscr.dscr.toFixed(2)
                        : 'N/A'}{' '}
                      <span className="text-sm text-gray-500">({dscr.interpretation})</span>
                    </dd>
                  </div>
                )}
              </div>
            )}

            {analysis && (
              <div className="border-t pt-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">Deal Analysis</dt>
                <dd className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Overall Score</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        analysis.label === 'Strong Deal'
                          ? 'bg-green-100 text-green-800'
                          : analysis.label === 'Neutral'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {analysis.overall_score}/100 - {analysis.label}
                    </span>
                  </div>
                  {analysis.reasons.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {analysis.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-gray-600">
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cash Flow Projection Chart */}
      {analytics && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cash Flow Projection (5 Years)</h2>
          <DealCashFlowProjectionChart deal={deal} years={5} />
        </div>
      )}

      {/* Comparable Properties */}
      <ComparableProperties dealId={dealId} currentDeal={deal} />

      <div className="flex justify-end">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
```

---

## UPDATED_ProfilePage.tsx

```typescript
/**
 * Profile page with settings and preferences.
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../lib/api/users';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import type { UserPreferences } from '../types';
import { formatDate } from '../lib/utils/formatters';

export function ProfilePage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => usersApi.getMe(),
  });

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    notification_email_enabled: true,
    notification_summary_enabled: true,
  });
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPreferences(user.preferences || {
        notification_email_enabled: true,
        notification_summary_enabled: true,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: { full_name?: string; preferences?: UserPreferences }) =>
      usersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    },
    onError: (err) => {
      showToast(`Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      full_name: fullName,
      preferences,
    });
  };

  const handleCancel = () => {
    if (user) {
      setFullName(user.full_name);
      setPreferences(user.preferences || {
        notification_email_enabled: true,
        notification_summary_enabled: true,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton height={40} rounded />
        <Skeleton height={300} rounded />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">User not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Read-only fields */}
        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <div className="mt-1 text-sm text-gray-900">{user.email}</div>
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Role</label>
          <div className="mt-1 text-sm text-gray-900 capitalize">{user.role}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Account Created</label>
          <div className="mt-1 text-sm text-gray-900">{formatDate(user.created_at)}</div>
        </div>

        {/* Editable fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          ) : (
            <div className="text-sm text-gray-900">{user.full_name}</div>
          )}
        </div>

        {/* Preferences */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification_email"
                checked={preferences.notification_email_enabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, notification_email_enabled: e.target.checked })
                }
                disabled={!isEditing}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="notification_email" className="ml-2 text-sm text-gray-700">
                Enable email notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification_summary"
                checked={preferences.notification_summary_enabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, notification_summary_enabled: e.target.checked })
                }
                disabled={!isEditing}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="notification_summary" className="ml-2 text-sm text-gray-700">
                Enable weekly summary emails
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## UPDATED_Layout.tsx

```typescript
/**
 * Main layout component with navigation and notification bell.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from '../components/notifications/NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                BrightSteps
              </Link>
              {isAuthenticated && (
                <div className="ml-10 flex space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Profile
                  </Link>
                </div>
              )}
            </div>
            {isAuthenticated && user && (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <span className="text-sm text-gray-700">{user.full_name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

---

## UPDATED_App.tsx

```typescript
/**
 * Main App component with routing and providers.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DealCreatePage } from './pages/DealCreatePage';
import { DealDetailPage } from './pages/DealDetailPage';
import { DealEditPage } from './pages/DealEditPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <Layout>
                    <LoginPage />
                  </Layout>
                }
              />
              <Route
                path="/register"
                element={
                  <Layout>
                    <RegisterPage />
                  </Layout>
                }
              />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deals/new"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DealCreatePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deals/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DealDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deals/:id/edit"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DealEditPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <Layout>
                    <NotFoundPage />
                  </Layout>
                }
              />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

---

## Phase 4 Verification Checklist

- [ ] Charts display correctly on Dashboard
- [ ] Search and filters work on Dashboard
- [ ] CSV export downloads correctly
- [ ] Comparable properties show on Deal Detail
- [ ] Cash flow projection chart displays
- [ ] PDF export button works (backend endpoint needed)
- [ ] Notification bell shows unread count
- [ ] Notifications can be marked as read
- [ ] Profile page allows editing name and preferences
- [ ] Toast notifications appear on success/error
- [ ] Loading skeletons show during data fetch
- [ ] Empty states display when no data
- [ ] All components are responsive on mobile
- [ ] Error handling works for API failures
- [ ] Token expiration redirects to login

---

## Backend Implementation Notes

### Required Backend Endpoints

1. **GET /api/v1/deals?filters...** - Already exists, may need filter support
2. **GET /api/v1/deals/{id}/comps** - New endpoint needed
3. **GET /api/v1/notifications** - New endpoint needed
4. **POST /api/v1/notifications/{id}/read** - New endpoint needed
5. **PUT /api/v1/users/me** - Update to support preferences
6. **GET /api/v1/deals/{id}/export.pdf** - New endpoint needed

### Database Changes

- Add `notifications` table
- Add `preferences` JSON column to `users` table (or separate table)

See `PHASE4_BACKEND_SUGGESTIONS.md` for detailed backend implementation.

