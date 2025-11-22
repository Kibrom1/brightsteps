/**
 * Properties API client.
 */
import { getApiClient } from '../api-client';
import type { Property } from '../../types';

export const propertiesApi = {
  async getProperties(): Promise<Property[]> {
    const client = getApiClient();
    return client.get<Property[]>('/api/v1/properties');
  },

  async getProperty(id: number): Promise<Property> {
    const client = getApiClient();
    return client.get<Property>(`/api/v1/properties/${id}`);
  },
};

