import { AppNotification } from '../types';

// Configuração Base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

interface APIResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Serviço Central de API
 * Responsável por todas as comunicações HTTP, injeção de Token e tratamento de erros.
 */
class ApiService {
  // Token Management
  getToken(): string | null {
    return localStorage.getItem('flux_token');
  }

  setToken(token: string) {
    localStorage.setItem('flux_token', token);
  }

  clearToken() {
    localStorage.removeItem('flux_token');
  }

  // Core Request Handler
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, headers = {}, ...rest } = options;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        (defaultHeaders as any)['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...rest,
      headers: { ...defaultHeaders, ...headers },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // Tratamento Global de Erros HTTP
      if (response.status === 401) {
        // Token expirado ou inválido
        this.clearToken();
        window.location.href = '/login'; // Ou disparar evento de logout
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
      }

      // Suporte para respostas sem conteúdo (204)
      if (response.status === 204) return {} as T;

      const data = await response.json();
      return data as T;

    } catch (error: any) {
      console.error(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  }

  // Atalhos REST
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Simulação de Backend (Mock Adapter) para desenvolvimento
  // Remove isso quando conectar o backend real
  async mockRequest<T>(data: T, delay = 500): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }
}

export const api = new ApiService();