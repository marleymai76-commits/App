import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/[<>]/g, '')
    .trim();
}

export async function safeFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options);
  const text = await response.text();

  // Se a resposta começar com "<", é HTML → erro do servidor
  if (text.trim().startsWith("<")) {
    return {
      ok: false,
      error: "O servidor retornou HTML em vez de JSON. O endpoint pode estar errado ou fora do ar.",
      raw: text
    };
  }

  // Tenta converter para JSON normalmente
  try {
    const json = JSON.parse(text);
    return { ok: true, data: json, status: response.status };
  } catch (err) {
    return {
      ok: false,
      error: "Falha ao interpretar JSON. O servidor enviou um formato inesperado.",
      raw: text,
      status: response.status
    };
  }
}

export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  }
};
