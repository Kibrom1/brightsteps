/**
 * API client for Leads/CRM.
 */
import { getApiClient } from '../api-client';
import type { Lead, LeadCreateData, LeadActivity, LeadActivityCreateData } from '../../types';

export const leadsApi = {
  async getLeads(): Promise<Lead[]> {
    const client = getApiClient();
    return client.get<Lead[]>('/api/v1/leads');
  },

  async createLead(data: LeadCreateData): Promise<Lead> {
    const client = getApiClient();
    return client.post<Lead>('/api/v1/leads', data);
  },

  async getLead(id: number): Promise<Lead> {
    const client = getApiClient();
    return client.get<Lead>(`/api/v1/leads/${id}`);
  },

  async updateLead(id: number, data: Partial<LeadCreateData>): Promise<Lead> {
    const client = getApiClient();
    return client.put<Lead>(`/api/v1/leads/${id}`, data);
  },

  async deleteLead(id: number): Promise<void> {
    const client = getApiClient();
    return client.delete(`/api/v1/leads/${id}`);
  },

  async addActivity(leadId: number, data: LeadActivityCreateData): Promise<LeadActivity> {
    const client = getApiClient();
    return client.post<LeadActivity>(`/api/v1/leads/${leadId}/activities`, data);
  },
};


