import { AUTO_APP_TEMPLATES, AppTemplate } from './AutoAppTemplates';
import { generateDomainConfig, verifyDnsPropagation, DomainConfig } from './AutoAppDomain';
import { provisionClientDatabase, DatabaseProvisionResult } from './AutoAppDatabase';
import { triggerAutoAppDeploy, DeployStep, DeployResult } from './AutoAppDeploy';

export interface AutoAppCreationInput {
  clientName: string;
  businessName: string;
  appType: string; // 'restaurant' | 'store' | 'service' | 'custom'
  desiredDomain?: string;
  plan: string; // 'pocket' | 'pro' | 'premium' | 'fiscal'
  ownerEmail: string;
}

export interface AutoAppGenerationReport {
  success: boolean;
  clientId: string;
  domainConfig: DomainConfig;
  dbResult: DatabaseProvisionResult;
  deployResult: DeployResult;
  template: AppTemplate;
}

export async function generateAutoApp(
  input: AutoAppCreationInput,
  userUid: string,
  onProgress?: (steps: DeployStep[]) => void
): Promise<AutoAppGenerationReport> {
  const { clientName, businessName, appType, desiredDomain, plan, ownerEmail } = input;

  // 1. Resolve Template
  const template = AUTO_APP_TEMPLATES.find(t => t.id === appType) || AUTO_APP_TEMPLATES[0];

  // 2. Register Client in SUPER ADMIN DB (via actual server endpoint)
  const clientResponse = await fetch('/admin/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-uid': userUid
    },
    body: JSON.stringify({
      name: businessName,
      ownerEmail,
      plan
    })
  });

  if (!clientResponse.ok) {
    const errorBody = await clientResponse.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Falha ao registrar inquilino SaaS no servidor principal.');
  }

  const clientData = await clientResponse.json();
  const clientId = clientData.clientId;

  // 3. Generate Domain Configuration
  let domainConfig = generateDomainConfig(businessName, desiredDomain);

  // If custom domain, simulate DNS validation quickly
  if (domainConfig.isCustom) {
    domainConfig = await verifyDnsPropagation(domainConfig);
  }

  // 4. Provision multi-tenant database collections
  const dbResult = await provisionClientDatabase(clientId, businessName, template);

  // 5. Trigger PWA container deployment and assets compilation
  const deployResult = await triggerAutoAppDeploy(
    clientId,
    businessName,
    template.accentColor,
    template.themeType,
    domainConfig.domain,
    onProgress
  );

  return {
    success: true,
    clientId,
    domainConfig,
    dbResult,
    deployResult,
    template
  };
}
