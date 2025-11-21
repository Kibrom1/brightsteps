// TypeScript interfaces mirroring Pydantic schemas for frontend use.

export interface ResponseEnvelope<T> {
  data: T;
  warnings?: string[];
  errors?: string[];
}

export interface CapRateRequest {
  purchase_price: number;
  annual_rent: number;
  annual_expenses: number;
}

export interface CapRateResponse {
  cap_rate: number;
  noi: number;
  annual_rent: number;
  annual_expenses: number;
}

export interface CashFlowRequest {
  purchase_price: number;
  down_payment: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_rent: number;
  property_tax_annual: number;
  insurance_annual: number;
  hoa_monthly?: number;
  maintenance_percent: number;
  vacancy_percent: number;
  management_percent: number;
}

export interface CashFlowResponse {
  monthly_cash_flow: number;
  annual_cash_flow: number;
  noi_annual: number;
  monthly_debt_service: number;
  cash_on_cash_return: number;
  summary: string;
}

export interface DSCRRequest {
  noi_annual: number;
  annual_debt_service: number;
}

export interface DSCRResponse {
  dscr: number | null; // null when there's no debt service (cash purchase)
  interpretation: string;
}

export type PropertyType = "single_family" | "multi_family" | "condo" | "townhouse";

export interface RentEstimateRequest {
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  zip_code: string;
  property_type: PropertyType;
}

export interface RentEstimateResponse {
  estimated_rent: number;
  assumptions: Record<string, number>;
}

export interface Assumptions {
  vacancy_percent: number;
  maintenance_percent: number;
  management_percent: number;
  property_tax_percent: number;
  insurance_percent: number;
  appreciation_percent_annual: number;
  rent_growth_percent_annual: number;
}

export interface DealAnalysisRequest {
  purchase_price: number;
  down_payment: number;
  monthly_rent: number;
  interest_rate: number;
  loan_term_years: number;
  hoa_monthly?: number;
  assumptions?: Assumptions;
}

export interface DealAnalysisResponse {
  overall_score: number;
  label: "Strong Deal" | "Neutral" | "Weak Deal";
  reasons: string[];
  cash_flow: CashFlowResponse;
  dscr: DSCRResponse;
}
