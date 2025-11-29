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

// Phase 4: Notification types
export interface Notification {
  id: number;
  type: 'deal_created' | 'deal_updated' | 'deal_deleted' | 'system';
  message: string;
  created_at: string;
  read: boolean;
  deal_id?: number;
}

// Phase 4: User Preferences
export interface UserPreferences {
  notification_email_enabled: boolean;
  notification_summary_enabled: boolean;
  default_vacancy_percent?: number;
  default_maintenance_percent?: number;
  default_management_percent?: number;
}

export interface UserWithPreferences extends User {
  preferences?: UserPreferences;
}

// Phase 4: Deal Filters
export interface DealFilters {
  search?: string;
  property_type?: PropertyType[];
  city?: string;
  state?: string;
  zip_code?: string;
  min_cap_rate?: number;
  min_monthly_cash_flow?: number;
  min_dscr?: number;
}

// Phase 4: Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface CapRateDataPoint {
  dealId: number;
  dealName: string;
  capRate: number;
}

export interface CashFlowDataPoint {
  dealId: number;
  dealName: string;
  monthlyCashFlow: number;
  annualCashFlow: number;
}

export interface PortfolioBreakdownData {
  category: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface CashFlowProjectionData {
  year: number;
  month: number;
  cashFlow: number;
  rent: number;
  expenses: number;
}

// Phase 6: CRM / Leads
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  LOST = 'lost',
  CLOSED = 'closed',
}

export enum ActivityType {
  EMAIL = 'email',
  CALL = 'call',
  MEETING = 'meeting',
  NOTE = 'note',
  OTHER = 'other',
}

export interface LeadActivity {
  id: number;
  lead_id: number;
  activity_type: ActivityType;
  summary: string;
  notes?: string;
  completed_at?: string;
  created_at: string;
}

export interface Lead {
  id: number;
  owner_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  activities: LeadActivity[];
}

export interface LeadCreateData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  source?: string;
  notes?: string;
}

export interface LeadActivityCreateData {
  activity_type: ActivityType;
  summary: string;
  notes?: string;
  completed_at?: string;
}

// Phase 6: AI
export interface PropertyDescriptionRequest {
  address?: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  features: string[];
  tone: 'professional' | 'luxury' | 'cozy' | 'urgent';
}

export interface PropertyDescriptionResponse {
  description: string;
}

// Phase 7: Admin & Enterprise
export interface SystemStats {
  total_users: number;
  total_properties: number;
  total_deals: number;
  total_leads: number;
  active_subscriptions: number;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface FeatureFlag {
  id: number;
  name: string;
  description?: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagCreate {
  name: string;
  description?: string;
  is_enabled?: boolean;
}

export interface FeatureFlagUpdate {
  description?: string;
  is_enabled?: boolean;
}

export enum PlanInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  interval: PlanInterval;
  features?: string[];
  stripe_price_id?: string;
  created_at: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: SubscriptionStatus;
  current_period_end?: string;
  plan: Plan;
  created_at: string;
  updated_at: string;
}
