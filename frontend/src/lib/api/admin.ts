import { getApiClient } from '../api-client';
import { 
  User, 
  SystemStats, 
  AuditLog, 
  FeatureFlag, 
  FeatureFlagCreate, 
  FeatureFlagUpdate,
  Deal,
  Property
} from '../../types';

export const adminApi = {
  async getStats(): Promise<SystemStats> {
    const client = getApiClient();
    return client.get<SystemStats>('/api/v1/admin/stats');
  },

  async getUsers(skip = 0, limit = 100): Promise<User[]> {
    const client = getApiClient();
    return client.get<User[]>(`/api/v1/admin/users?skip=${skip}&limit=${limit}`);
  },

  async getAuditLogs(skip = 0, limit = 100): Promise<AuditLog[]> {
    const client = getApiClient();
    return client.get<AuditLog[]>(`/api/v1/admin/audit-logs?skip=${skip}&limit=${limit}`);
  },

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const client = getApiClient();
    return client.get<FeatureFlag[]>('/api/v1/admin/feature-flags');
  },

  async createFeatureFlag(data: FeatureFlagCreate): Promise<FeatureFlag> {
    const client = getApiClient();
    return client.post<FeatureFlag>('/api/v1/admin/feature-flags', data);
  },

  async updateFeatureFlag(id: number, data: FeatureFlagUpdate): Promise<FeatureFlag> {
    const client = getApiClient();
    return client.put<FeatureFlag>(`/api/v1/admin/feature-flags/${id}`, data);
  },
  
  async getDeals(skip = 0, limit = 100): Promise<Deal[]> {
    const client = getApiClient();
    return client.get<Deal[]>(`/api/v1/admin/deals?skip=${skip}&limit=${limit}`);
  },

  async getProperties(skip = 0, limit = 100): Promise<Property[]> {
    const client = getApiClient();
    return client.get<Property[]>(`/api/v1/admin/properties?skip=${skip}&limit=${limit}`);
  },
};

