import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeToken = 'sistenfox' | 'vermelho_gourmet' | 'azul_premium' | 'verde_organico' | 'bronze_rustico' | 'prata_minimalista';
export type ThemeMode = 'system' | 'light' | 'dark';

/**
 * Detects the operating system's current color scheme preference (prefers-color-scheme: dark).
 * Falls back to 'dark' for the premium brand aesthetic if window or matchMedia is not present.
 */
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

interface ThemeState {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  isSystemTheme: boolean;
  accent: ThemeToken;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark', manual?: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeToken) => void;
  syncWithSystem: () => void;
  initSystemListener: () => () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),
      themeMode: 'system',
      isSystemTheme: true,
      accent: 'sistenfox',
      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light';
        set({
          theme: nextTheme,
          themeMode: nextTheme,
          isSystemTheme: false,
        });
      },
      setTheme: (theme, manual = true) => {
        set({
          theme,
          themeMode: manual ? theme : get().themeMode,
          isSystemTheme: manual ? false : get().isSystemTheme,
        });
      },
      setThemeMode: (mode: ThemeMode) => {
        if (mode === 'system') {
          const sysTheme = getSystemTheme();
          set({
            themeMode: 'system',
            isSystemTheme: true,
            theme: sysTheme,
          });
        } else {
          set({
            themeMode: mode,
            isSystemTheme: false,
            theme: mode,
          });
        }
      },
      setAccent: (accent) => set({ accent }),
      syncWithSystem: () => {
        const sysTheme = getSystemTheme();
        set({
          theme: sysTheme,
          themeMode: 'system',
          isSystemTheme: true,
        });
      },
      initSystemListener: () => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
          return () => {};
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Immediate sync if system mode is active
        if (get().themeMode === 'system') {
          const currentSys = mediaQuery.matches ? 'dark' : 'light';
          if (get().theme !== currentSys) {
            set({ theme: currentSys, isSystemTheme: true });
          }
        }

        const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
          if (get().themeMode === 'system') {
            const nextTheme = e.matches ? 'dark' : 'light';
            set({ theme: nextTheme, isSystemTheme: true });
          }
        };

        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleMediaChange);
        } else if ((mediaQuery as any).addListener) {
          (mediaQuery as any).addListener(handleMediaChange);
        }

        return () => {
          if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener('change', handleMediaChange);
          } else if ((mediaQuery as any).removeListener) {
            (mediaQuery as any).removeListener(handleMediaChange);
          }
        };
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.themeMode === 'system') {
          state.theme = getSystemTheme();
          state.isSystemTheme = true;
        }
      },
    }
  )
);

// Global browser listener to ensure instant automatic updates even outside component lifecycle
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  try {
    const globalMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleGlobalChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const state = useThemeStore.getState();
      if (state.themeMode === 'system') {
        const nextTheme = e.matches ? 'dark' : 'light';
        if (state.theme !== nextTheme) {
          useThemeStore.setState({ theme: nextTheme, isSystemTheme: true });
        }
      }
    };
    if (globalMediaQuery.addEventListener) {
      globalMediaQuery.addEventListener('change', handleGlobalChange);
    } else if ((globalMediaQuery as any).addListener) {
      (globalMediaQuery as any).addListener(handleGlobalChange);
    }
  } catch {
    // Graceful fallback for non-standard environments
  }
}

export type UserRole = 'admin' | 'manager' | 'waiter' | 'kitchen' | 'cashier' | 'client' | 'staff' | 'customer' | 'endCustomer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
  login: (user, token, refreshToken) => set({ user, token, refreshToken, isAuthenticated: true }),
  logout: () => {
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    // Clear storage manually if needed, though persist handles it
  },
}),
    {
      name: 'auth-storage',
    }
  )
);

import { NativeNotificationService, NotificationPermissionState } from '../services/nativeNotification';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  critical?: boolean;
}

interface NotificationState {
  notifications: Notification[];
  nativePermission: NotificationPermissionState;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  requestNativePermission: () => Promise<boolean>;
  checkNativePermission: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: '1',
      title: 'Novo Pedido',
      message: 'Você recebeu um novo pedido de R$ 156,00',
      type: 'success',
      read: false,
      timestamp: new Date(),
    },
    {
      id: '2',
      title: 'Estoque Baixo',
      message: 'O item "Picanha" está com estoque baixo.',
      type: 'warning',
      read: false,
      timestamp: new Date(),
    }
  ],
  nativePermission: NativeNotificationService.getPermission(),
  checkNativePermission: () => {
    set({ nativePermission: NativeNotificationService.getPermission() });
  },
  requestNativePermission: async () => {
    const result = await NativeNotificationService.requestPermission();
    set({ nativePermission: result });
    return result === 'granted';
  },
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      read: false,
      timestamp: new Date(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));

    // If critical or success event, automatically trigger native browser notification if user allowed
    if (notification.critical || notification.type === 'success') {
      if (NativeNotificationService.getPermission() === 'granted') {
        NativeNotificationService.showNotification({
          title: notification.title,
          body: notification.message,
          tag: `notif-${newNotification.id}`,
          requireInteraction: !!notification.critical,
        }).catch(() => {});
      }
    }
  },
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
  })),
  clearAll: () => set({ notifications: [] }),
}));

export type PromotionType = 'percentage' | 'fixed' | 'combo' | 'happy_hour';

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  value: number;
  categories: string[];
  items: string[];
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  startTime?: string;
  endTime?: string;
  active: boolean;
}

interface PromotionState {
  promotions: Promotion[];
  addPromotion: (promo: Promotion) => void;
  updatePromotion: (id: string, promo: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  togglePromotion: (id: string) => void;
  setPromotions: (promotions: Promotion[]) => void;
}

export const usePromotionStore = create<PromotionState>()(
  persist(
    (set) => ({
      promotions: [
        {
          id: '1',
          name: 'Happy Hour Picanha',
          type: 'percentage',
          value: 20,
          categories: ['Carnes'],
          items: ['Picanha Premium'],
          startDate: '2024-01-01',
          endDate: '2025-12-31',
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '18:00',
          endTime: '20:00',
          active: true,
        }
      ],
      addPromotion: (promo) => set((state) => ({
        promotions: [...state.promotions, promo]
      })),
      updatePromotion: (id, promo) => set((state) => ({
        promotions: state.promotions.map((p) => p.id === id ? { ...p, ...promo } : p)
      })),
      deletePromotion: (id) => set((state) => ({
        promotions: state.promotions.filter((p) => p.id !== id)
      })),
      togglePromotion: (id) => set((state) => ({
        promotions: state.promotions.map((p) => p.id === id ? { ...p, active: !p.active } : p)
      })),
      setPromotions: (promotions) => set({ promotions }),
    }),
    {
      name: 'promotion-storage',
    }
  )
);

export type NicheType = 'pizzaria' | 'sushi' | 'cafe' | 'churrascaria' | 'default' | 'salao' | 'clinica' | 'oficina' | 'mercado' | 'varejo' | 'restaurante' | 'construcao';

export interface NicheConfig {
  label: string;
  categories: string[];
  features: {
    sizes?: boolean;
    addons?: boolean;
    combos?: boolean;
    rodizio?: boolean;
    reservations?: boolean;
    takeaway?: boolean;
  };
  defaultText?: Record<string, string>;
}

export const NICHE_CONFIGS: Record<string, NicheConfig> = {
  default: {
    label: 'Padrão',
    categories: ['Todos', 'Entradas', 'Pratos Principais', 'Bebidas', 'Sobremesas'],
    features: {}
  },
  pizzaria: {
    label: 'Pizzaria',
    categories: ['Todos', 'Pizzas Salgadas', 'Pizzas Doces', 'Bordas', 'Bebidas', 'Entradas'],
    features: {
      sizes: true,
      addons: true,
      combos: true
    },
    defaultText: {
      orderButton: 'Montar Pizza',
      categoryLabel: 'Sabores'
    }
  },
  sushi: {
    label: 'Sushi Bar',
    categories: ['Todos', 'Combinados', 'Sashimis', 'Temakis', 'Hot Rolls', 'Bebidas'],
    features: {
      rodizio: true,
      reservations: true
    }
  },
  cafe: {
    label: 'Cafeteria',
    categories: ['Todos', 'Cafés Quentes', 'Cafés Gelados', 'Salgados', 'Doces', 'Grãos'],
    features: {
      takeaway: true
    }
  },
  churrascaria: {
    label: 'Churrascaria',
    categories: ['Todos', 'Cortes Bovinos', 'Cortes Suínos', 'Acompanhamentos', 'Saladas', 'Bebidas'],
    features: {
      rodizio: true,
      reservations: true
    }
  },
  salao: {
    label: 'Salão & Estética',
    categories: ['Todos', 'Corte & Penteado', 'Coloração', 'Manicure & Pedicure', 'Tratamentos', 'Estética Facial'],
    features: {
      reservations: true
    },
    defaultText: {
      orderButton: 'Agendar Serviço',
      categoryLabel: 'Serviços'
    }
  },
  clinica: {
    label: 'Clínica & Consultório',
    categories: ['Todos', 'Consultas', 'Exames', 'Procedimentos', 'Retornos', 'Telemedicina'],
    features: {
      reservations: true
    },
    defaultText: {
      orderButton: 'Agendar Consulta',
      categoryLabel: 'Consultas'
    }
  },
  oficina: {
    label: 'Oficina Mecânica',
    categories: ['Todos', 'Mecânica Geral', 'Injeção Eletrônica', 'Freios & Suspensão', 'Peças & Componentes', 'Serviços Rápidos'],
    features: {},
    defaultText: {
      orderButton: 'Solicitar Orçamento',
      categoryLabel: 'Serviços'
    }
  },
  mercado: {
    label: 'Mercado / Minimercado',
    categories: ['Todos', 'Mercearia', 'Hortifruti', 'Açougue', 'Bebidas', 'Limpeza', 'Padaria'],
    features: {},
    defaultText: {
      orderButton: 'Comprar Item',
      categoryLabel: 'Produtos'
    }
  },
  varejo: {
    label: 'Lojas & Varejo',
    categories: ['Todos', 'Eletro', 'Vestuário', 'Calçados', 'Acessórios', 'Casa', 'Bebidas'],
    features: {},
    defaultText: {
      orderButton: 'Comprar Item',
      categoryLabel: 'Produtos'
    }
  },
  restaurante: {
    label: 'Restaurante & Café',
    categories: ['Todos', 'Entradas', 'Pratos Principais', 'Bebidas', 'Sobremesas', 'Combos'],
    features: {
      reservations: true
    },
    defaultText: {
      orderButton: 'Fazer Pedido',
      categoryLabel: 'Cardápio'
    }
  },
  construcao: {
    label: 'Construção Civil',
    categories: ['Todos', 'Materiais Básicos', 'Acabamento', 'Ferramentas', 'Mão de Obra', 'Instalações'],
    features: {},
    defaultText: {
      orderButton: 'Solicitar Insumo',
      categoryLabel: 'Insumos'
    }
  }
};

interface NicheState {
  niche: NicheType;
  setNiche: (niche: NicheType) => void;
}

export const useNicheStore = create<NicheState>()(
  persist(
    (set) => ({
      niche: 'default',
      setNiche: (niche) => set({ niche }),
    }),
    {
      name: 'niche-storage',
    }
  )
);
