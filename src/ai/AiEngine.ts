import { AppTemplate } from '../superadmin/autoapp/AutoAppTemplates';
import { DomainConfig } from '../superadmin/autoapp/AutoAppDomain';
import { DatabaseProvisionResult } from '../superadmin/autoapp/AutoAppDatabase';
import { DeployResult } from '../superadmin/autoapp/AutoAppDeploy';

export interface AiAppCreationInput {
  clientName: string;
  businessName: string;
  appType: string; // 'restaurant' | 'store' | 'service' | 'custom'
  brandTone: string; // 'elegant' | 'bold' | 'minimalist' | 'brutalist'
  colors: string;
  description: string;
  desiredDomain?: string;
  plan: string;
  ownerEmail: string;
}

export interface AiAppGenerationReport {
  success: boolean;
  clientId: string;
  domainConfig: DomainConfig;
  dbResult: DatabaseProvisionResult;
  deployResult: DeployResult;
  aiOutput: {
    landingPage: {
      heroTitle: string;
      heroSubtitle: string;
      features: string[];
      ctaText: string;
    };
    mockData: {
      items: { name: string; price: number; category: string; description: string }[];
      metrics: { label: string; value: string; change: string }[];
    };
    navigation: { label: string; route: string; icon: string }[];
  };
}

export interface AiContentRequest {
  presetId: string;
  businessName: string;
  businessType: string;
  description: string;
  tone: string;
}

export interface AiDashboardRequest {
  businessType: string;
  metricType: string; // 'financial' | 'operational' | 'marketing' | 'customer'
}

export async function generateAppWithAi(
  input: AiAppCreationInput,
  userUid: string,
  onProgress?: (progressLog: string) => void
): Promise<AiAppGenerationReport> {
  if (onProgress) onProgress('Preparando motor de inteligência artificial Sistenfox...');

  const response = await fetch('/api/ai/generate-app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-uid': userUid
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro de comunicação ao invocar IA no servidor.');
  }

  const result = await response.json();
  return result;
}

export async function generateContentWithAi(
  input: AiContentRequest,
  userUid: string
): Promise<{ text: string }> {
  const response = await fetch('/api/ai/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-uid': userUid
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao processar texto por IA.');
  }

  return response.json();
}

export async function generateDashboardWithAi(
  input: AiDashboardRequest,
  userUid: string
): Promise<{
  metrics: { label: string; value: string; change: string; chartType: string; color: string }[];
  charts: { name: string; value: number }[];
  columns: string[];
  recentActivity: { id: string; user: string; event: string; time: string; status: string }[];
}> {
  const response = await fetch('/api/ai/generate-dashboard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-uid': userUid
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao gerar estrutura do painel com IA.');
  }

  return response.json();
}
