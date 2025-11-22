/**
 * TypeScript types matching backend models and API responses.
 */

// User types
export enum UserRole {
  INVESTOR = 'investor',
  REALTOR = 'realtor',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Property types
export enum PropertyType {
  SINGLE_FAMILY = 'single_family',
  MULTI_FAMILY = 'multi_family',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  OTHER = 'other',
}

export interface Property {
  id: number;
  owner_user_id: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built?: number;
  created_at: string;
  updated_at: string;
}

// Analytics types
export interface CashFlowSnapshot {
  monthly_cash_flow: number;
  annual_cash_flow: number;
  noi_annual: number;
  monthly_debt_service: number;
  cash_on_cash_return: number;
  summary: string;
}

export interface DSCRSnapshot {
  dscr: number | null;
  interpretation: string;
}

export interface DealAnalysisSnapshot {
  overall_score: number;
  label: 'Strong Deal' | 'Neutral' | 'Weak Deal';
  reasons: string[];
  cash_flow: CashFlowSnapshot;
  dscr: DSCRSnapshot;
}

export interface AnalyticsSnapshot {
  cash_flow: CashFlowSnapshot;
  dscr: DSCRSnapshot;
  deal_analysis: DealAnalysisSnapshot;
}

export interface AssumptionsSnapshot {
  vacancy_percent: number;
  maintenance_percent: number;
  management_percent: number;
  property_tax_percent: number;
  insurance_percent: number;
  appreciation_percent_annual: number;
  rent_growth_percent_annual: number;
}

// Deal types
export interface Deal {
  id: number;
  user_id: number;
  property_id?: number;
  purchase_price: number;
  down_payment: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_rent: number;
  property_tax_annual?: number;
  insurance_annual?: number;
  hoa_monthly?: number;
  maintenance_percent: number;
  vacancy_percent: number;
  management_percent: number;
  notes?: string;
  snapshot_of_assumptions?: AssumptionsSnapshot;
  snapshot_of_analytics_result?: AnalyticsSnapshot;
  created_at: string;
  updated_at: string;
  user?: User;
  property?: Property;
}

// API Request/Response types
export interface ApiResponse<T> {
  data: T;
  errors?: string[];
  meta?: {
    skip?: number;
    limit?: number;
    total?: number;
    has_more?: boolean;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Deal form types
export interface DealFormData {
  property_id?: number;
  purchase_price: number;
  down_payment: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_rent: number;
  property_tax_annual?: number;
  insurance_annual?: number;
  hoa_monthly?: number;
  maintenance_percent: number;
  vacancy_percent: number;
  management_percent: number;
  notes?: string;
}

