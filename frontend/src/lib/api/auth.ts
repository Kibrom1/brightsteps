/**
 * Authentication API client.
 */
import { getApiClient } from '../api-client';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../../types';

export const authApi = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    console.log('[authApi] login called', { email: credentials.email });
    const client = getApiClient();
    console.log('[authApi] API client obtained', { baseUrl: (client as any).baseUrl });
    try {
      const result = await client.post<TokenResponse>('/api/v1/auth/login', credentials);
      console.log('[authApi] login result', { hasToken: !!result.access_token });
      return result;
    } catch (error) {
      console.error('[authApi] login error:', error);
      throw error;
    }
  },

  async register(userData: RegisterRequest): Promise<User> {
    console.log('[authApi] register called', { email: userData.email });
    const client = getApiClient();
    try {
      const result = await client.post<User>('/api/v1/auth/register', userData);
      console.log('[authApi] register result', { userId: result.id });
      return result;
    } catch (error) {
      console.error('[authApi] register error:', error);
      throw error;
    }
  },
};

