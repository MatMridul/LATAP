// API Client - Implements frozen API contracts
// Handles authentication, error mapping, and request tracing

import type {
  OpportunityFeedResponse,
  OpportunityDetailResponse,
  ApplicationSubmitRequest,
  ApplicationSubmitResponse,
  MyApplicationsResponse,
  ApplicationDetailResponse,
  ApplicationWithdrawResponse,
  ApplicationStatusUpdateRequest,
  ApplicationStatusUpdateResponse,
  OpportunityApplicationsResponse,
  ErrorResponse,
} from '../types/api';

class APIError extends Error {
  constructor(
    public error_code: string,
    public safe_message: string,
    public request_id: string,
    public status: number
  ) {
    super(safe_message);
    this.name = 'APIError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const duration = Date.now() - startTime;
      const requestId = response.headers.get('X-Request-ID');

      // Log request (production: send to monitoring)
      if (process.env.NODE_ENV === 'development') {
        console.log('[API]', {
          method,
          path,
          status: response.status,
          duration,
          requestId,
        });
      }

      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new APIError(
          error.error_code,
          error.error,
          error.request_id,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new NetworkError('Network request failed');
    }
  }

  // Opportunities API
  async getOpportunityFeed(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<OpportunityFeedResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.type) query.set('type', params.type);
    if (params?.status) query.set('status', params.status);

    const queryString = query.toString();
    return this.request<OpportunityFeedResponse>(
      'GET',
      `/api/opportunities/feed${queryString ? `?${queryString}` : ''}`
    );
  }

  async getOpportunityDetail(id: string): Promise<OpportunityDetailResponse> {
    return this.request<OpportunityDetailResponse>(
      'GET',
      `/api/opportunities/${id}`
    );
  }

  // Applications API
  async submitApplication(
    opportunityId: string,
    data: ApplicationSubmitRequest
  ): Promise<ApplicationSubmitResponse> {
    return this.request<ApplicationSubmitResponse>(
      'POST',
      `/api/opportunities/${opportunityId}/apply`,
      data
    );
  }

  async getMyApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<MyApplicationsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);

    const queryString = query.toString();
    return this.request<MyApplicationsResponse>(
      'GET',
      `/api/applications/my-applications${queryString ? `?${queryString}` : ''}`
    );
  }

  async getApplicationDetail(id: string): Promise<ApplicationDetailResponse> {
    return this.request<ApplicationDetailResponse>(
      'GET',
      `/api/applications/${id}`
    );
  }

  async withdrawApplication(id: string): Promise<ApplicationWithdrawResponse> {
    return this.request<ApplicationWithdrawResponse>(
      'PUT',
      `/api/applications/${id}/withdraw`
    );
  }

  async updateApplicationStatus(
    id: string,
    data: ApplicationStatusUpdateRequest
  ): Promise<ApplicationStatusUpdateResponse> {
    return this.request<ApplicationStatusUpdateResponse>(
      'PUT',
      `/api/applications/${id}/status`,
      data
    );
  }

  async getOpportunityApplications(
    opportunityId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<OpportunityApplicationsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);

    const queryString = query.toString();
    return this.request<OpportunityApplicationsResponse>(
      'GET',
      `/api/opportunities/${opportunityId}/applications${queryString ? `?${queryString}` : ''}`
    );
  }
}

// Singleton instance
const apiClient = new APIClient();

export { apiClient, APIError, NetworkError };
export type { ErrorResponse };
