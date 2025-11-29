/**
 * API client for AI features.
 */
import { getApiClient } from '../api-client';
import type { PropertyDescriptionRequest, PropertyDescriptionResponse } from '../../types';

export const aiApi = {
  async generateDescription(data: PropertyDescriptionRequest): Promise<PropertyDescriptionResponse> {
    const client = getApiClient();
    return client.post<PropertyDescriptionResponse>('/api/v1/ai/generate-description', data);
  },
};


