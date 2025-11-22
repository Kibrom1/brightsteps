/**
 * Deal detail page showing deal information and analytics.
 */
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    },
  });

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
            {deal.property_tax_annual && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Property Tax (Annual)</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatCurrency(deal.property_tax_annual)}
                </dd>
              </div>
            )}
            {deal.insurance_annual && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Insurance (Annual)</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatCurrency(deal.insurance_annual)}
                </dd>
              </div>
            )}
            {deal.hoa_monthly && (
              <div>
                <dt className="text-sm font-medium text-gray-500">HOA (Monthly)</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatCurrency(deal.hoa_monthly)}</dd>
              </div>
            )}
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
                <div>
                  <dt className="text-sm font-medium text-gray-500">NOI (Annual)</dt>
                  <dd className="mt-1 text-lg text-gray-900">
                    {formatCurrency(cashFlow.noi_annual)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Monthly Debt Service</dt>
                  <dd className="mt-1 text-lg text-gray-900">
                    {formatCurrency(cashFlow.monthly_debt_service)}
                  </dd>
                </div>
              </div>
            )}

            {dscr && (
              <div className="mb-6">
                <dt className="text-sm font-medium text-gray-500">DSCR</dt>
                <dd className="mt-1 text-lg text-gray-900">
                  {dscr.dscr !== null && dscr.dscr !== undefined
                    ? dscr.dscr.toFixed(2)
                    : 'N/A'}{' '}
                  <span className="text-sm text-gray-500">({dscr.interpretation})</span>
                </dd>
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

        {/* Assumptions */}
        {assumptions && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assumptions Used</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Vacancy</dt>
                <dd className="text-gray-900">{formatPercent(assumptions.vacancy_percent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Maintenance</dt>
                <dd className="text-gray-900">{formatPercent(assumptions.maintenance_percent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Management</dt>
                <dd className="text-gray-900">{formatPercent(assumptions.management_percent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Property Tax</dt>
                <dd className="text-gray-900">{formatPercent(assumptions.property_tax_percent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Insurance</dt>
                <dd className="text-gray-900">{formatPercent(assumptions.insurance_percent)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

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

