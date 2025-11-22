/**
 * User API client.
 */
import { getApiClient } from '../api-client';
import type { User } from '../../types';

export const usersApi = {
  async getMe(): Promise<User> {
    const client = getApiClient();
    return client.get<User>('/api/v1/users/me');
  },
};

