/**
 * Deal detail page showing deal information and analytics.
 */
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '../lib/api/deals';
import { PropertyImageUpload } from '../components/PropertyImageUpload';
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

export default function DealDetailPage() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="rounded-xl bg-red-50 p-6 border border-red-100 text-red-700">
          {error instanceof Error ? error.message : 'Deal not found'}
      </div>
    );
  }

  const analytics = deal.snapshot_of_analytics_result;
  const cashFlow = analytics?.cash_flow;
  const dscr = analytics?.dscr;
  const analysis = analytics?.deal_analysis;
  const assumptions = deal.snapshot_of_assumptions;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">
                {deal.property?.address_line1 || 'Deal Details'}
            </h1>
            {deal.property && (
                <p className="text-slate-500 mt-1">
                    {deal.property.city}, {deal.property.state} • {deal.property.zip_code}
                </p>
            )}
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => recalculateMutation.mutate()}
            disabled={recalculateMutation.isPending}
            className="btn-secondary"
          >
            {recalculateMutation.isPending ? 'Recalculating...' : 'Recalculate Analytics'}
          </button>
          <Link
            to={`/deals/${deal.id}/edit`}
            className="btn-primary"
          >
            Edit Deal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Property & Info */}
        <div className="lg:col-span-2 space-y-8">
             {/* Images Section */}
             <div className="card p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Property Images</h2>
                 </div>
                 {deal.property_id ? (
                     <PropertyImageUpload propertyId={deal.property_id} />
                 ) : (
                     <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-500">
                         Link a property to this deal to manage images.
                     </div>
                 )}
             </div>

            {/* Deal Information */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Deal Financials</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <dt className="text-sm font-medium text-slate-500">Purchase Price</dt>
                        <dd className="mt-1 text-xl font-medium text-slate-900">{formatCurrency(deal.purchase_price)}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500">Down Payment</dt>
                        <dd className="mt-1 text-xl font-medium text-slate-900">{formatCurrency(deal.down_payment)}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500">Interest Rate</dt>
                        <dd className="mt-1 text-lg text-slate-900">{formatPercent(deal.interest_rate)}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500">Loan Term</dt>
                        <dd className="mt-1 text-lg text-slate-900">{deal.loan_term_years} years</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500">Monthly Rent</dt>
                        <dd className="mt-1 text-lg text-slate-900">{formatCurrency(deal.monthly_rent)}</dd>
                    </div>
                     <div>
                        <dt className="text-sm font-medium text-slate-500">HOA (Monthly)</dt>
                        <dd className="mt-1 text-lg text-slate-900">{deal.hoa_monthly ? formatCurrency(deal.hoa_monthly) : '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500">Property Tax (Annual)</dt>
                        <dd className="mt-1 text-lg text-slate-900">{deal.property_tax_annual ? formatCurrency(deal.property_tax_annual) : '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500">Insurance (Annual)</dt>
                        <dd className="mt-1 text-lg text-slate-900">{deal.insurance_annual ? formatCurrency(deal.insurance_annual) : '-'}</dd>
                    </div>
                </div>
                {deal.notes && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <dt className="text-sm font-medium text-slate-500 mb-2">Notes</dt>
                        <dd className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">{deal.notes}</dd>
                    </div>
                )}
            </div>
            
            {/* Assumptions */}
            {assumptions && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Assumptions Used</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <dt className="text-xs text-slate-500 uppercase tracking-wide">Vacancy</dt>
                            <dd className="text-sm font-medium text-slate-900 mt-1">{formatPercent(assumptions.vacancy_percent)}</dd>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <dt className="text-xs text-slate-500 uppercase tracking-wide">Maintenance</dt>
                            <dd className="text-sm font-medium text-slate-900 mt-1">{formatPercent(assumptions.maintenance_percent)}</dd>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <dt className="text-xs text-slate-500 uppercase tracking-wide">Management</dt>
                            <dd className="text-sm font-medium text-slate-900 mt-1">{formatPercent(assumptions.management_percent)}</dd>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Analytics */}
        <div className="lg:col-span-1 space-y-8">
             {analytics && cashFlow ? (
                <div className="card bg-slate-900 text-white border-slate-800">
                    <div className="p-6 border-b border-slate-700">
                         <h2 className="text-lg font-semibold text-white">Performance Summary</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Projected Monthly Cash Flow</p>
                            <p className={`text-4xl font-bold ${cashFlow.monthly_cash_flow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(cashFlow.monthly_cash_flow)}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                             <div>
                                <p className="text-slate-400 text-xs">Cash-on-Cash</p>
                                <p className="text-xl font-semibold text-white mt-1">{formatPercent(cashFlow.cash_on_cash_return)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">Annual NOI</p>
                                <p className="text-xl font-semibold text-white mt-1">{formatCurrency(cashFlow.noi_annual)}</p>
                            </div>
                        </div>
                        
                        {dscr && (
                             <div className="pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-slate-400 text-xs">DSCR</p>
                                        <p className="text-xl font-semibold text-white mt-1">
                                            {dscr.dscr !== null && dscr.dscr !== undefined ? dscr.dscr.toFixed(2) : 'N/A'}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        dscr.dscr && dscr.dscr >= 1.2 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-yellow-900/50 text-yellow-400'
                                    }`}>
                                        {dscr.interpretation}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card p-6 text-center text-slate-500">No analytics available</div>
            )}

            {analysis && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Investment Grade</h2>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-600">Overall Score</span>
                        <span className={`text-2xl font-bold ${
                             analysis.overall_score >= 80 ? 'text-emerald-600' :
                             analysis.overall_score >= 60 ? 'text-yellow-600' :
                             'text-red-600'
                        }`}>
                            {analysis.overall_score}/100
                        </span>
                    </div>
                    
                    <div className={`p-3 rounded-lg mb-4 text-center font-medium ${
                         analysis.label === 'Strong Deal' ? 'bg-emerald-50 text-emerald-700' :
                         analysis.label === 'Neutral' ? 'bg-yellow-50 text-yellow-700' :
                         'bg-red-50 text-red-700'
                    }`}>
                        {analysis.label}
                    </div>

                    {analysis.reasons.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Analysis Notes</p>
                            <ul className="space-y-2">
                                {analysis.reasons.map((reason, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-slate-600">
                                        <svg className="h-5 w-5 text-primary-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
