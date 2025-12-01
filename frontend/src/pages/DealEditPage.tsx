/**
 * Edit deal page with pre-filled form.
 */
import { useState, FormEvent, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '../lib/api/deals';
import type { Deal, DealFormData } from '../types';

export default function DealEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dealId = parseInt(id || '0', 10);

  const { data: deal, isLoading } = useQuery<Deal>({
    queryKey: ['deal', dealId],
    queryFn: () => dealsApi.getDeal(dealId),
    enabled: !!dealId,
  });

  const [formData, setFormData] = useState<Partial<DealFormData>>({});

  useEffect(() => {
    if (deal) {
      setFormData({
        property_id: deal.property_id,
        purchase_price: deal.purchase_price,
        down_payment: deal.down_payment,
        interest_rate: deal.interest_rate,
        loan_term_years: deal.loan_term_years,
        monthly_rent: deal.monthly_rent,
        property_tax_annual: deal.property_tax_annual,
        insurance_annual: deal.insurance_annual,
        hoa_monthly: deal.hoa_monthly,
        maintenance_percent: deal.maintenance_percent,
        vacancy_percent: deal.vacancy_percent,
        management_percent: deal.management_percent,
        notes: deal.notes,
      });
    }
  }, [deal]);

  const updateDealMutation = useMutation({
    mutationFn: (data: Partial<DealFormData>) => dealsApi.updateDeal(dealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      navigate(`/deals/${dealId}`);
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    updateDealMutation.mutate(formData);
  };

  const handleChange = (field: keyof DealFormData, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Loading deal...</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">Deal not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Deal</h1>

      {updateDealMutation.isError && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">
            {updateDealMutation.error instanceof Error
              ? updateDealMutation.error.message
              : 'Failed to update deal'}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Purchase Price *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.purchase_price || ''}
              onChange={(e) => handleChange('purchase_price', parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Down Payment *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.down_payment || ''}
              onChange={(e) => handleChange('down_payment', parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interest Rate (%) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.interest_rate || ''}
              onChange={(e) => handleChange('interest_rate', parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loan Term (Years) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.loan_term_years || ''}
              onChange={(e) => handleChange('loan_term_years', parseInt(e.target.value) || 30)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Rent *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.monthly_rent || ''}
              onChange={(e) => handleChange('monthly_rent', parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property Tax (Annual)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.property_tax_annual || ''}
              onChange={(e) =>
                handleChange('property_tax_annual', parseFloat(e.target.value) || undefined)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Insurance (Annual)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.insurance_annual || ''}
              onChange={(e) =>
                handleChange('insurance_annual', parseFloat(e.target.value) || undefined)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">HOA (Monthly)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.hoa_monthly || ''}
              onChange={(e) =>
                handleChange('hoa_monthly', parseFloat(e.target.value) || undefined)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maintenance (%) *
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              step="0.1"
              value={formData.maintenance_percent || ''}
              onChange={(e) =>
                handleChange('maintenance_percent', parseFloat(e.target.value) || 0)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vacancy (%) *</label>
            <input
              type="number"
              required
              min="0"
              max="100"
              step="0.1"
              value={formData.vacancy_percent || ''}
              onChange={(e) => handleChange('vacancy_percent', parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Management (%) *
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              step="0.1"
              value={formData.management_percent || ''}
              onChange={(e) =>
                handleChange('management_percent', parseFloat(e.target.value) || 0)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/deals/${dealId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateDealMutation.isPending}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateDealMutation.isPending ? 'Updating...' : 'Update Deal'}
          </button>
        </div>
      </form>
    </div>
  );
}

