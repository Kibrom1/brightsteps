/**
 * Utility functions for filtering deals.
 */
import type { Deal, DealFilters } from '../../types';

export function filterDeals(deals: Deal[], filters: DealFilters): Deal[] {
  return deals.filter((deal) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        deal.property?.address_line1?.toLowerCase().includes(searchLower) ||
        deal.property?.city?.toLowerCase().includes(searchLower) ||
        deal.property?.zip_code?.toLowerCase().includes(searchLower) ||
        deal.notes?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Property type filter
    if (filters.property_type && filters.property_type.length > 0) {
      if (!deal.property?.property_type || !filters.property_type.includes(deal.property.property_type)) {
        return false;
      }
    }

    // Location filters
    if (filters.city && deal.property?.city?.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    if (filters.state && deal.property?.state?.toLowerCase() !== filters.state.toLowerCase()) {
      return false;
    }
    if (filters.zip_code && deal.property?.zip_code !== filters.zip_code) {
      return false;
    }

    // Numeric filters
    if (filters.min_cap_rate !== undefined) {
      const noi = deal.snapshot_of_analytics_result?.cash_flow.noi_annual || 0;
      const capRate = deal.purchase_price > 0 ? (noi / deal.purchase_price) * 100 : 0;
      if (capRate < filters.min_cap_rate) return false;
    }

    if (filters.min_monthly_cash_flow !== undefined) {
      const monthlyCashFlow = deal.snapshot_of_analytics_result?.cash_flow.monthly_cash_flow || 0;
      if (monthlyCashFlow < filters.min_monthly_cash_flow) return false;
    }

    if (filters.min_dscr !== undefined) {
      const dscr = deal.snapshot_of_analytics_result?.dscr.dscr;
      if (dscr === null || dscr === undefined || dscr < filters.min_dscr) return false;
    }

    return true;
  });
}

