import { toast } from 'sonner';

// Define the global window interface for gtag.js
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Retrieve the measurement ID from the public Vite environment variables
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Memory store for tracking clicks in-session if the user wants to inspect them
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
}

const localEventsHistory: AnalyticsEvent[] = [];

/**
 * Initializes Google Analytics (gtag.js) dynamically
 */
export function initGA(): void {
  if (typeof window === 'undefined') return;

  const isDev = import.meta.env.DEV;

  if (!GA_MEASUREMENT_ID) {
    console.log(
      '%c[Sistenfox Analytics]%c Google Analytics ID (VITE_GA_MEASUREMENT_ID) is not set. Analytics will run in simulation mode.',
      'color: #000000; background: #fbbf24; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #94a3b8;'
    );
    return;
  }

  try {
    // 1. Inject the Google Tag Manager Script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // 2. Setup the global window.dataLayer and window.gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    // 3. Configure the tracker with current timestamp and initial page config
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // Page view is handled manually by router/hooks
      cookie_flags: 'max-age=7200;Secure;SameSite=None', // Setup modern cookies for iframe safety
    });

    console.log(
      `%c[Sistenfox Analytics]%c Google Analytics initialized successfully with ID: ${GA_MEASUREMENT_ID}`,
      'color: #000000; background: #22d3ee; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #10b981;'
    );
  } catch (error) {
    console.error('[Sistenfox Analytics] Failed to initialize Google Analytics:', error);
  }
}

/**
 * Tracks a page view event in GA
 * @param path The URL path of the page
 */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return;

  const cleanPath = path || window.location.pathname;

  // Send to GA if active
  if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: cleanPath,
    });
  }

  // Developer terminal logging
  console.log(
    `%c[Sistenfox PageView]%c Route: ${cleanPath}`,
    'color: #ffffff; background: #6a00ff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    'color: #cbd5e1;'
  );
}

/**
 * Tracks a custom click/engagement event in Google Analytics
 * @param action The specific action performed (e.g. 'click_pricing_cta')
 * @param category The event category group (e.g. 'Pricing Page')
 * @param label Detailed identifier for the action (e.g. 'Pro Plan - Testar por 30 dias')
 * @param value Optional numerical value
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (typeof window === 'undefined') return;

  const timestamp = Date.now();
  const eventData: AnalyticsEvent = { action, category, label, value, timestamp };
  
  // Save to local session log for auditing
  localEventsHistory.push(eventData);

  // Send to Google Analytics if available
  if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Visual styled log in developer console
  console.log(
    `%c[Sistenfox Event]%c Action: "${action}" | Category: "${category}" | Label: "${label || 'none'}"`,
    'color: #000000; background: #22d3ee; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    'color: #e2e8f0;',
    value !== undefined ? `| Value: ${value}` : ''
  );

  // Optional: Dynamic toast feedback in preview/dev mode to make testing extremely satisfying
  const isDev = import.meta.env.DEV || window.location.hostname.includes('ais-dev');
  if (isDev) {
    // Elegant low-profile notification
    toast.info(`[Analytics] Evento capturado: "${label || action}"`, {
      description: `Categoria: ${category} | Ação: ${action}`,
      duration: 3000,
    });
  }
}

/**
 * Retrieves the list of simulated captured events in this session
 */
export function getLocalEventsHistory(): AnalyticsEvent[] {
  return localEventsHistory;
}
