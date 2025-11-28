/**
 * Unit tests for deal filtering utilities
 */
import { describe, it, expect } from 'vitest';
import { filterDeals } from '../utils/deal-filters';
import { mockDeal, mockDeals } from '../../test/mockData';
import type { DealFilters } from '../../types';

describe('filterDeals', () => {
  it('should return all deals when no filters applied', () => {
    const result = filterDeals(mockDeals, {});
    expect(result).toEqual(mockDeals);
  });

  it('should filter by search term in address', () => {
    const filters: DealFilters = { search: 'Test St' };
    const result = filterDeals(mockDeals, filters);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].property?.address_line1).toContain('Test St');
  });

  it('should filter by search term in city', () => {
    const filters: DealFilters = { search: 'Test City' };
    const result = filterDeals(mockDeals, filters);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].property?.city).toBe('Test City');
  });

  it('should filter by property type', () => {
    const filters: DealFilters = { property_type: ['single_family'] };
    const result = filterDeals(mockDeals, filters);
    result.forEach(deal => {
      expect(deal.property?.property_type).toBe('single_family');
    });
  });

  it('should filter by minimum cap rate', () => {
    const filters: DealFilters = { min_cap_rate: 5 };
    const result = filterDeals(mockDeals, filters);
    result.forEach(deal => {
      const noi = deal.snapshot_of_analytics_result?.cash_flow.noi_annual || 0;
      const capRate = deal.purchase_price > 0 ? (noi / deal.purchase_price) * 100 : 0;
      expect(capRate).toBeGreaterThanOrEqual(5);
    });
  });

  it('should filter by minimum monthly cash flow', () => {
    const filters: DealFilters = { min_monthly_cash_flow: 400 };
    const result = filterDeals(mockDeals, filters);
    result.forEach(deal => {
      const cashFlow = deal.snapshot_of_analytics_result?.cash_flow.monthly_cash_flow || 0;
      expect(cashFlow).toBeGreaterThanOrEqual(400);
    });
  });

  it('should filter by minimum DSCR', () => {
    const filters: DealFilters = { min_dscr: 1.5 };
    const result = filterDeals(mockDeals, filters);
    result.forEach(deal => {
      const dscr = deal.snapshot_of_analytics_result?.dscr.dscr;
      if (dscr !== null && dscr !== undefined) {
        expect(dscr).toBeGreaterThanOrEqual(1.5);
      }
    });
  });

  it('should combine multiple filters', () => {
    const filters: DealFilters = {
      search: 'Test',
      min_cap_rate: 5,
      property_type: ['single_family'],
    };
    const result = filterDeals(mockDeals, filters);
    result.forEach(deal => {
      expect(deal.property?.property_type).toBe('single_family');
      const noi = deal.snapshot_of_analytics_result?.cash_flow.noi_annual || 0;
      const capRate = deal.purchase_price > 0 ? (noi / deal.purchase_price) * 100 : 0;
      expect(capRate).toBeGreaterThanOrEqual(5);
    });
  });

  it('should return empty array when no deals match', () => {
    const filters: DealFilters = { search: 'NonExistentAddress12345' };
    const result = filterDeals(mockDeals, filters);
    expect(result).toEqual([]);
  });
});

