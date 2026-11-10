export interface DomainConfig {
  domain: string; // e.g., pizzaria.sistenfox.com or custom.com
  isCustom: boolean;
  dnsRecords: {
    type: 'CNAME' | 'A' | 'TXT';
    host: string;
    value: string;
    status: 'active' | 'pending';
  }[];
  sslStatus: 'issued' | 'pending' | 'failed';
  sslIssuedAt?: number;
}

export function generateDomainConfig(businessName: string, desiredDomain?: string): DomainConfig {
  // Normalize business name for a clean subdomain
  const normalizedSubdomain = businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, '') // remove non-alphanumeric
    .substring(0, 20);

  const finalSubdomain = `${normalizedSubdomain || 'app'}.sistenfox.com`;
  
  if (desiredDomain && desiredDomain.trim() !== '' && desiredDomain.includes('.')) {
    const cleanCustom = desiredDomain.trim().toLowerCase();
    return {
      domain: cleanCustom,
      isCustom: true,
      dnsRecords: [
        { type: 'CNAME', host: 'www', value: 'ingress.sistenfox.com', status: 'pending' },
        { type: 'A', host: '@', value: '151.101.1.195', status: 'pending' },
        { type: 'TXT', host: '_sistenfox-verification', value: `sfx-verify-${Math.random().toString(36).substring(2, 10)}`, status: 'active' }
      ],
      sslStatus: 'pending'
    };
  }

  // Subdomain flow (Auto-issued immediately)
  return {
    domain: finalSubdomain,
    isCustom: false,
    dnsRecords: [
      { type: 'CNAME', host: normalizedSubdomain, value: 'ingress.sistenfox.com', status: 'active' }
    ],
    sslStatus: 'issued',
    sslIssuedAt: Date.now()
  };
}

export async function verifyDnsPropagation(domainConfig: DomainConfig): Promise<DomainConfig> {
  // Simulate checking DNS records
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedRecords = domainConfig.dnsRecords.map(r => ({
        ...r,
        status: 'active' as const
      }));
      resolve({
        ...domainConfig,
        dnsRecords: updatedRecords,
        sslStatus: 'issued',
        sslIssuedAt: Date.now()
      });
    }, 1200);
  });
}
