/**
 * Mock data for testing
 */
import type { User, Deal, Property, PropertyType } from '../types';

export const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'investor',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockProperty: Property = {
  id: 1,
  owner_user_id: 1,
  address_line1: '123 Test St',
  city: 'Test City',
  state: 'CA',
  zip_code: '12345',
  country: 'USA',
  property_type: 'single_family' as PropertyType,
  bedrooms: 3,
  bathrooms: 2,
  square_feet: 1500,
  year_built: 2020,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockDeal: Deal = {
  id: 1,
  user_id: 1,
  property_id: 1,
  purchase_price: 200000,
  down_payment: 40000,
  interest_rate: 4.5,
  loan_term_years: 30,
  monthly_rent: 2000,
  property_tax_annual: 2400,
  insurance_annual: 1200,
  hoa_monthly: 0,
  maintenance_percent: 5,
  vacancy_percent: 5,
  management_percent: 10,
  notes: 'Test deal',
  snapshot_of_assumptions: {
    vacancy_percent: 5,
    maintenance_percent: 5,
    management_percent: 10,
    property_tax_percent: 1.2,
    insurance_percent: 0.6,
    appreciation_percent_annual: 3,
    rent_growth_percent_annual: 3,
  },
  snapshot_of_analytics_result: {
    cash_flow: {
      monthly_cash_flow: 500,
      annual_cash_flow: 6000,
      noi_annual: 18000,
      monthly_debt_service: 810,
      cash_on_cash_return: 15,
      summary: 'Positive cash flow',
    },
    dscr: {
      dscr: 1.85,
      interpretation: 'Strong',
    },
    deal_analysis: {
      overall_score: 85,
      label: 'Strong Deal',
      reasons: ['Positive cash flow', 'Good DSCR'],
    },
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  property: mockProperty,
  user: mockUser,
};

export const mockDeals: Deal[] = [mockDeal];

