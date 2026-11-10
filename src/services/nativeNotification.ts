/**
 * SISTENFOX Native Browser Notification Service
 * Manages Web Notifications API permissions and displays native operating system alerts
 * for critical events like new appointments, approved payments, and urgent orders.
 */

export interface NativeNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export class NativeNotificationService {
  /**
   * Checks if the Notification API is supported by the current browser environment.
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Retrieves current permission status.
   */
  public static getPermission(): NotificationPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Requests permission from the user to display native browser notifications.
   */
  public static async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('[NativeNotificationService] Falha ao solicitar permissão:', err);
      return Notification.permission;
    }
  }

  /**
   * Displays a native operating system notification if permissions are granted.
   * Leverages Service Worker Registration (showNotification) when available for best PWA background delivery,
   * falling back to the standard Notification constructor.
   */
  public static async showNotification(options: NativeNotificationOptions): Promise<boolean> {
    if (!this.isSupported()) return false;

    // Check if permission is granted
    if (Notification.permission !== 'granted') {
      return false;
    }

    const {
      title,
      body,
      icon = '/icons/icon-192.png',
      badge = '/icons/icon-192.png',
      tag = `sfx-${Date.now()}`,
      data = {},
      requireInteraction = false,
      silent = false,
    } = options;

    try {
      // 1. Try ServiceWorker Registration first (standard for modern PWAs & Android)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready.catch(() => null);
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, {
            body,
            icon,
            badge,
            tag,
            data,
            requireInteraction,
            silent,
            vibrate: [200, 100, 200],
          } as any);
          return true;
        }
      }

      // 2. Fallback to Window Notification constructor
      const notification = new Notification(title, {
        body,
        icon,
        badge,
        tag,
        data,
        requireInteraction,
        silent,
      });

      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        notification.close();
      };

      return true;
    } catch (err) {
      console.warn('[NativeNotificationService] Erro ao disparar notificação nativa:', err);
      return false;
    }
  }

  /**
   * Evento Crítico: Novo Agendamento / Reserva Confirmada
   */
  public static async notifyNewAppointment(details: {
    client: string;
    date: string;
    time: string;
    guests?: number | string;
    phone?: string;
  }): Promise<boolean> {
    const guestsText = details.guests ? ` (${details.guests} pessoas)` : '';
    return this.showNotification({
      title: 'Novo Agendamento Confirmado! 📅',
      body: `Cliente: ${details.client}\nData: ${details.date} às ${details.time}${guestsText}`,
      tag: `appointment-${Date.now()}`,
      requireInteraction: true,
      data: { type: 'appointment', ...details },
    });
  }

  /**
   * Evento Crítico: Pagamento Aprovado
   */
  public static async notifyPaymentApproved(details: {
    amount: number;
    method?: string;
    client?: string;
    description?: string;
  }): Promise<boolean> {
    const formattedAmount = details.amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const clientText = details.client ? ` • ${details.client}` : '';
    const methodText = details.method ? ` via ${details.method}` : '';

    return this.showNotification({
      title: 'Pagamento Aprovado! 💳',
      body: `Recebimento de ${formattedAmount} confirmado com sucesso${methodText}${clientText}.`,
      tag: `payment-${Date.now()}`,
      requireInteraction: true,
      data: { type: 'payment', ...details },
    });
  }

  /**
   * Evento Crítico: Novo Pedido ou Alerta Operacional
   */
  public static async notifyCriticalAlert(details: {
    title: string;
    message: string;
    tag?: string;
  }): Promise<boolean> {
    return this.showNotification({
      title: details.title,
      body: details.message,
      tag: details.tag || `alert-${Date.now()}`,
      requireInteraction: true,
    });
  }
}
