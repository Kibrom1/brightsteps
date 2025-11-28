/**
 * Filter component for deals list.
 */
import React from 'react';
import type { DealFilters as DealFiltersType, PropertyType } from '../../types';
import { PropertyType as PropertyTypeEnum } from '../../types';

interface DealFiltersProps {
  filters: DealFiltersType;
  onChange: (filters: DealFiltersType) => void;
  onReset: () => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: PropertyTypeEnum.SINGLE_FAMILY as PropertyType, label: 'Single Family' },
  { value: PropertyTypeEnum.MULTI_FAMILY as PropertyType, label: 'Multi Family' },
  { value: PropertyTypeEnum.CONDO as PropertyType, label: 'Condo' },
  { value: PropertyTypeEnum.TOWNHOUSE as PropertyType, label: 'Townhouse' },
  { value: PropertyTypeEnum.OTHER as PropertyType, label: 'Other' },
];

export function DealFilters({ filters, onChange, onReset }: DealFiltersProps) {
  const handlePropertyTypeToggle = (type: PropertyType) => {
    const current = filters.property_type || [];
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ ...filters, property_type: newTypes.length > 0 ? newTypes : undefined });
  };

  const hasActiveFilters =
    filters.property_type?.length ||
    filters.city ||
    filters.state ||
    filters.zip_code ||
    filters.min_cap_rate !== undefined ||
    filters.min_monthly_cash_flow !== undefined ||
    filters.min_dscr !== undefined;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handlePropertyTypeToggle(type.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filters.property_type?.includes(type.value)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={filters.city || ''}
            onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={filters.state || ''}
            onChange={(e) => onChange({ ...filters, state: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="State"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
          <input
            type="text"
            value={filters.zip_code || ''}
            onChange={(e) => onChange({ ...filters, zip_code: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="ZIP"
          />
        </div>
      </div>

      {/* Numeric Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Cap Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={filters.min_cap_rate || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                min_cap_rate: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="0.0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Monthly Cash Flow ($)
          </label>
          <input
            type="number"
            step="100"
            value={filters.min_monthly_cash_flow || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                min_monthly_cash_flow: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min DSCR</label>
          <input
            type="number"
            step="0.1"
            value={filters.min_dscr || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                min_dscr: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="0.0"
          />
        </div>
      </div>
    </div>
  );
}

