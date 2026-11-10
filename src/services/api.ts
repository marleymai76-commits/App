import { toast } from 'sonner';
import { useAuthStore, UserRole } from '../lib/store';
import { safeFetch } from '../lib/utils';

import { auth } from '../lib/firebaseClient';

// Mock API service for SISTENFOX
const BASE_URL = '/api';

interface AuthResponse {
  token: string;
  refreshToken: string;
  role: UserRole;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const { token, user } = useAuthStore.getState();
    const fbUser = auth.currentUser;
    const currentToken = (fbUser ? await fbUser.getIdToken().catch(() => null) : null) || token;
    const uid = fbUser?.uid || user?.id;
    const email = fbUser?.email || user?.email;

    return {
      'Content-Type': 'application/json',
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
      ...(uid ? { 'x-user-uid': uid } : {}),
      ...(email ? { 'x-user-email': email } : {}),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${BASE_URL}${endpoint}`;
    
    try {
      let result = await safeFetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Se o token expirou (401), tenta o refresh via Firebase ou endpoint
      if (result.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
        console.log("Token expirado, tentando refresh silencioso...");
        
        let newToken: string | null = null;
        if (auth.currentUser) {
          newToken = await auth.currentUser.getIdToken(true).catch(() => null);
        }

        if (!newToken) {
          const refreshResult = await this.auth.refresh('').catch(() => null);
          newToken = refreshResult?.token || null;
        }
        
        if (newToken) {
          // Atualiza o store com o novo token
          const { user, login } = useAuthStore.getState();
          if (user) {
            login(user, newToken, '');
            
            // Tenta a requisição original novamente com o novo token
            const newHeaders = await this.getHeaders();
            result = await safeFetch(url, {
              ...options,
              headers: {
                ...newHeaders,
                ...options.headers,
              },
            });
          }
        } else if (!auth.currentUser && !useAuthStore.getState().isAuthenticated) {
          // Se não há usuário autenticado nenhum, limpa
          useAuthStore.getState().logout();
          return [] as unknown as T;
        }
      }

      if (!result.ok) {
        console.warn(`API request failed for ${endpoint}: ${result.error}`);
        return [] as unknown as T;
      }

      if (result.status === 204 || !result.data) return [] as unknown as T;

      if (endpoint.includes('/promotions') || endpoint.includes('/employees') || endpoint.includes('/niches') || endpoint.includes('/themes')) {
        if (!Array.isArray(result.data)) {
          console.warn(`Expected array from ${endpoint} but got:`, result.data);
          return [] as unknown as T;
        }
      }

      return result.data as T;
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      return [] as unknown as T;
    }
  }

  // Auth Namespace
  auth = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const response = await this.request<AuthResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        
        if (!response || !response.user) {
          // Fallback for mock login
          const mockUser: AuthResponse = {
            token: 'mock-token',
            refreshToken: 'mock-refresh-token',
            role: 'admin',
            user: {
              id: '1',
              name: 'Admin Sistfox',
              email: email,
              role: 'admin'
            }
          };
          toast.success(`Bem-vindo (Mock), ${mockUser.user.name}!`);
          return mockUser;
        }

        // Ensure user object has the role for the store
        response.user.role = response.role;
        toast.success(`Bem-vindo, ${response.user.name}!`);
        return response;
      } catch (error) {
        // Fallback for mock login on error
        const mockUser: AuthResponse = {
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          role: 'admin',
          user: {
            id: '1',
            name: 'Admin Sistfox',
            email: email,
            role: 'admin'
          }
        };
        toast.success(`Bem-vindo (Mock), ${mockUser.user.name}!`);
        return mockUser;
      }
    },

    register: async (name: string, email: string, password: string, role: UserRole = 'client'): Promise<AuthResponse> => {
      const response = await this.request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      
      // After registration, we log in automatically
      return this.auth.login(email, password);
    },

    logout: async (): Promise<void> => {
      await this.request<void>('/auth/logout', {
        method: 'POST',
      });
      toast.success('Sessão encerrada');
    },

    refresh: async (refreshToken: string): Promise<{ token: string }> => {
      try {
        if (auth.currentUser) {
          const freshToken = await auth.currentUser.getIdToken(true).catch(() => null);
          if (freshToken) {
            return { token: freshToken };
          }
        }

        const response = await safeFetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error('Refresh failed');
        }
        
        return response.data as { token: string };
      } catch (error) {
        if (auth.currentUser) {
          const fallbackToken = await auth.currentUser.getIdToken().catch(() => '');
          if (fallbackToken) return { token: fallbackToken };
        }
        console.warn("Refresh token notice:", error);
        throw error;
      }
    }
  };

  // Admin Namespace
  admin = {
    getStats: async () => {
      return this.request<any>('/admin/stats');
    },
    getEmployees: async () => {
      return this.request<any[]>('/admin/employees');
    },
    addEmployee: async (data: any) => {
      return this.request<any>('/admin/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateEmployee: async (id: string, data: any) => {
      return this.request<any>(`/admin/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    deleteEmployee: async (id: string) => {
      return this.request<any>(`/admin/employees/${id}`, {
        method: 'DELETE',
      });
    },
    getCustomers: async () => {
      return this.request<any[]>('/admin/customers');
    },
    addCustomer: async (data: any) => {
      return this.request<any>('/admin/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  };

  // Promotions
  promotions = {
    getAll: async () => {
      return this.request<any[]>('/promotions');
    },
    create: async (data: any) => {
      return this.request<any>('/promotions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return this.request<any>(`/promotions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return this.request<any>(`/promotions/${id}`, {
        method: 'DELETE',
      });
    }
  };

  // Niches
  niches = {
    getAll: async () => {
      return this.request<any[]>('/niches');
    }
  };

  // Niche Hub for Companies
  nicheHub = {
    getActiveNiche: async () => {
      return this.request<{ activeNiche: string; lastNicheChange: number }>('/companies/niche');
    },
    applyNiche: async (nicheId: string) => {
      return this.request<{ success: boolean; activeNiche: string; lastNicheChange: number }>('/companies/apply-niche', {
        method: 'POST',
        body: JSON.stringify({ nicheId }),
      });
    }
  };

  // Themes
  themes = {
    getAll: async () => {
      return this.request<any[]>('/themes');
    }
  };

  // Orders
  async getOrders() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: '#SF-1024', client: 'Marcos Oliveira', status: 'Concluído', value: 156.00, date: '2026-03-29T14:20:00' },
      { id: '#SF-1025', client: 'Ana Paula', status: 'Pendente', value: 89.90, date: '2026-03-29T14:45:00' },
      { id: '#SF-1026', client: 'Ricardo Silva', status: 'Em Preparo', value: 210.00, date: '2026-03-29T15:10:00' },
      { id: '#SF-1027', client: 'Juliana Costa', status: 'Concluído', value: 45.00, date: '2026-03-29T15:30:00' },
    ];
  }

  // Menu
  async getMenu() {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: '1', name: 'Picanha Premium', category: 'Pratos Principais', price: 89.90, available: true, image: 'https://picsum.photos/seed/picanha/400/300' },
      { id: '2', name: 'Vinho Tinto Reserva', category: 'Bebidas', price: 120.00, available: true, image: 'https://picsum.photos/seed/wine/400/300' },
      { id: '3', name: 'Petit Gateau', category: 'Sobremesas', price: 25.00, available: true, image: 'https://picsum.photos/seed/dessert/400/300' },
      { id: '4', name: 'Bruschetta Italiana', category: 'Entradas', price: 35.00, available: false, image: 'https://picsum.photos/seed/bruschetta/400/300' },
    ];
  }

  // Tables
  async getTables() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      { id: '1', number: 1, status: 'livre', capacity: 4 },
      { id: '2', number: 2, status: 'ocupada', capacity: 2, waiter: 'Carlos' },
      { id: '3', number: 3, status: 'aguardando pedido', capacity: 6, waiter: 'Ana' },
      { id: '4', number: 4, status: 'aguardando pagamento', capacity: 4, waiter: 'Carlos' },
      { id: '5', number: 5, status: 'livre', capacity: 2 },
    ];
  }
}

export const api = new ApiService();
