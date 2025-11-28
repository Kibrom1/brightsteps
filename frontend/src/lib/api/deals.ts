/**
 * Deals API client.
 */
import { getApiClient } from '../api-client';
import type { Deal, DealFormData } from '../../types';

export const dealsApi = {
  async getDeals(): Promise<Deal[]> {
    const client = getApiClient();
    return client.get<Deal[]>('/api/v1/deals');
  },

  async getDeal(id: number): Promise<Deal> {
    const client = getApiClient();
    return client.get<Deal>(`/api/v1/deals/${id}`);
  },

  async createDeal(data: DealFormData): Promise<Deal> {
    const client = getApiClient();
    return client.post<Deal>('/api/v1/deals', data);
  },

  async updateDeal(id: number, data: Partial<DealFormData>): Promise<Deal> {
    const client = getApiClient();
    return client.put<Deal>(`/api/v1/deals/${id}`, data);
  },

  async deleteDeal(id: number): Promise<void> {
    const client = getApiClient();
    return client.delete<void>(`/api/v1/deals/${id}`);
  },

  async recalculateDeal(id: number): Promise<Deal> {
    const client = getApiClient();
    return client.post<Deal>(`/api/v1/deals/${id}/recalculate`);
  },

  async getComparableProperties(id: number): Promise<Deal[]> {
    const client = getApiClient();
    return client.get<Deal[]>(`/api/v1/deals/${id}/comps`);
  },

  // Note: CSV export is handled client-side in the component
  // For server-side export, use: GET /api/v1/deals/export.csv
};

