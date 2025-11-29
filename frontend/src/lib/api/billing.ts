import { getApiClient } from '../api-client';
import { Plan, Subscription } from '../../types';

export interface SubscriptionCreate {
  plan_id: number;
}

export const billingApi = {
  async getPlans(): Promise<Plan[]> {
    const client = getApiClient();
    return client.get<Plan[]>('/api/v1/billing/plans');
  },

  async getMySubscription(): Promise<Subscription> {
    const client = getApiClient();
    return client.get<Subscription>('/api/v1/billing/subscription');
  },

  async createCheckoutSession(data: SubscriptionCreate): Promise<{ url: string }> {
    const client = getApiClient();
    return client.post<{ url: string }>('/api/v1/billing/create-checkout-session', data);
  },
};
