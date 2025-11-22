/**
 * Base API client with authentication and error handling.
 */

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV 
  ? '' // Use Vite proxy in development
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

export interface ApiError {
  message: string;
  status: number;
  detail?: string | string[];
}

class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Construct URL - if baseUrl is empty (proxy mode), use endpoint directly
    const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token exists
    // Don't add token for auth endpoints (login/register)
    const isAuthEndpoint = endpoint.includes('/auth/');
    if (token && !isAuthEndpoint) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Log request details for debugging
      if (import.meta.env.DEV) {
        console.log(`[API] ${options.method || 'GET'} ${url}`, {
          endpoint,
          hasToken: !!token,
          headers: Object.keys(headers),
          body: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
        });
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Log for debugging (remove in production)
      if (import.meta.env.DEV) {
        console.log(`[API] ${options.method || 'GET'} ${endpoint}`, {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
        });
      }

      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorData: any = null;
        
        try {
          // Try to parse error response
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
            // Backend returns { detail: ... } for errors
            const detail = errorData.detail;
            
            if (detail) {
              // Handle array of details (validation errors from Pydantic)
              if (Array.isArray(detail)) {
                errorMessage = detail.map((err: any) => {
                  if (typeof err === 'string') {
                    return err;
                  }
                  // Format validation errors: "Field 'password' is required"
                  const field = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : 'field';
                  const msg = err.msg || 'Invalid value';
                  return `${field}: ${msg}`;
                }).join(', ');
              } else if (typeof detail === 'string') {
                // Simple string error (e.g., "Incorrect email or password")
                errorMessage = detail;
              } else {
                errorMessage = JSON.stringify(detail);
              }
            }
          }
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Log error for debugging
        if (import.meta.env.DEV) {
          console.error(`[API Error] ${endpoint}:`, errorMessage, errorData);
        }
        
        // Handle 401 Unauthorized - but don't redirect for auth endpoints
        // Also don't redirect if we're already on the login page
        if (response.status === 401) {
          const isAuthEndpoint = endpoint.includes('/auth/');
          const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
          
          if (!isAuthEndpoint && !isOnLoginPage && typeof window !== 'undefined') {
            // Only redirect if not on login page and not an auth endpoint
            console.log('[API Client] 401 error, redirecting to login (not on login page)');
            sessionStorage.removeItem('brightsteps_token');
            window.location.href = '/login';
          } else if (isAuthEndpoint) {
            // For auth endpoints, just clear token but don't redirect
            console.log('[API Client] 401 error on auth endpoint, clearing token but not redirecting');
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('brightsteps_token');
            }
          }
        }
        
        throw new Error(errorMessage);
      }

      // Parse JSON response
      const data = await response.json();
      
      // Backend Phase 2 endpoints (auth, users, properties, deals) return direct data
      // Phase 1 analytics endpoints return { data: ... } format
      // Check if it's wrapped format (has 'data' key and no 'errors')
      if (data.data !== undefined && data.errors === undefined) {
        return data.data as T;
      }
      
      // Direct data format (Phase 2 endpoints like auth/login, auth/register)
      if (import.meta.env.DEV) {
        console.log(`[API] Success ${endpoint}`, { hasData: !!data });
      }
      return data as T;
    } catch (error) {
      // Enhanced error logging
      if (import.meta.env.DEV) {
        console.error(`[API] Exception in ${endpoint}:`, error);
        if (error instanceof Error) {
          console.error(`[API] Error details:`, {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    if (import.meta.env.DEV && body) {
      console.log(`[API Client] POST ${endpoint} body:`, body);
    }
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create singleton instance
let apiClientInstance: ApiClient | null = null;

export function createApiClient(getToken: () => string | null): ApiClient {
  // Always create/update the instance to ensure token getter is current
  apiClientInstance = new ApiClient(API_BASE_URL, getToken);
  if (import.meta.env.DEV) {
    console.log('[API Client] Created/updated client', { baseUrl: API_BASE_URL });
  }
  return apiClientInstance;
}

export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    // Create a default instance if not initialized yet (for auth endpoints)
    if (import.meta.env.DEV) {
      console.log('[API Client] Creating default client', { baseUrl: API_BASE_URL });
    }
    apiClientInstance = new ApiClient(API_BASE_URL, () => null);
  }
  if (import.meta.env.DEV) {
    console.log('[API Client] getApiClient called', { 
      baseUrl: apiClientInstance.baseUrl,
      hasInstance: !!apiClientInstance 
    });
  }
  return apiClientInstance;
}

