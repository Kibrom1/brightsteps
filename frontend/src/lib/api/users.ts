/**
 * User API client.
 */
import { getApiClient } from '../api-client';
import type { User, UserWithPreferences, UserPreferences } from '../../types';

export interface UpdateUserRequest {
  full_name?: string;
  preferences?: UserPreferences;
}

export const usersApi = {
  async getMe(): Promise<UserWithPreferences> {
    const client = getApiClient();
    return client.get<UserWithPreferences>('/api/v1/users/me');
  },

  async updateMe(data: UpdateUserRequest): Promise<UserWithPreferences> {
    const client = getApiClient();
    return client.put<UserWithPreferences>('/api/v1/users/me', data);
  },
};

