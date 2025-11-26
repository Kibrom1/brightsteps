/**
 * Comparable properties component for Deal Detail page.
 */
import { useQuery } from '@tanstack/react-query';
import { dealsApi } from '../../lib/api/deals';
import { Skeleton } from '../ui/Skeleton';
import { formatCurrency, formatPercent } from '../../lib/utils/formatters';
import type { Deal } from '../../types';

interface ComparablePropertiesProps {
  dealId: number;
  currentDeal: Deal;
}

export function ComparableProperties({ dealId, currentDeal }: ComparablePropertiesProps) {
  const { data: comps, isLoading, error } = useQuery<Deal[]>({
    queryKey: ['deals', dealId, 'comps'],
    queryFn: () => dealsApi.getComparableProperties(dealId),
    enabled: !!dealId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton height={40} rounded />
        <Skeleton height={200} rounded />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="text-sm text-yellow-800">
          Unable to load comparable properties. {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  if (!comps || comps.length === 0) {
    return (
      <div className="rounded-md bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">
          No comparable properties found. Try creating more deals in the same area.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Comparable Properties</h3>
        <p className="text-sm text-gray-500 mt-1">
          Similar deals in {currentDeal.property?.zip_code || currentDeal.property?.city || 'your area'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beds/Baths
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sq Ft
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monthly Rent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cap Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comps.map((comp) => {
              const noi = comp.snapshot_of_analytics_result?.cash_flow.noi_annual || 0;
              const capRate = comp.purchase_price > 0 ? (noi / comp.purchase_price) * 100 : 0;

              return (
                <tr key={comp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {comp.property?.address_line1 || 'N/A'}
                    </div>
                    {comp.property && (
                      <div className="text-sm text-gray-500">
                        {comp.property.city}, {comp.property.state} {comp.property.zip_code}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {comp.property?.property_type
                      ? comp.property.property_type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {comp.property
                      ? `${comp.property.bedrooms} / ${comp.property.bathrooms}`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {comp.property?.square_feet ? comp.property.square_feet.toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(comp.monthly_rent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {capRate > 0 ? (
                      <span
                        className={
                          capRate >= 8
                            ? 'text-green-600 font-medium'
                            : capRate >= 5
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {formatPercent(capRate)}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

