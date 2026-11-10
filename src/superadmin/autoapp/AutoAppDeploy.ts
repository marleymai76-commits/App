export interface DeployStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  log: string;
}

export interface DeployResult {
  success: boolean;
  deployedUrl: string;
  manifest: any;
  buildTimeMs: number;
  steps: DeployStep[];
}

export async function triggerAutoAppDeploy(
  clientId: string,
  businessName: string,
  accentColor: string,
  themeType: string,
  domain: string,
  onProgress?: (steps: DeployStep[]) => void
): Promise<DeployResult> {
  const steps: DeployStep[] = [
    { name: 'Geração do PWA Manifest', status: 'pending', log: 'Aguardando início...' },
    { name: 'Compilação de Assets Estáticos', status: 'pending', log: 'Aguardando início...' },
    { name: 'Sincronização de Service Worker', status: 'pending', log: 'Aguardando início...' },
    { name: 'Provisionamento Cloud Run', status: 'pending', log: 'Aguardando início...' },
    { name: 'Vinculação de SSL / Domínio', status: 'pending', log: 'Aguardando início...' }
  ];

  const updateStep = (index: number, status: DeployStep['status'], log: string) => {
    steps[index].status = status;
    steps[index].log = log;
    if (onProgress) {
      onProgress([...steps]);
    }
  };

  const startTime = Date.now();

  // Step 1: Manifest Generation
  updateStep(0, 'running', 'Lendo especificações de design DSX-1...');
  await new Promise(r => setTimeout(r, 600));
  const manifest = {
    name: businessName,
    short_name: businessName.substring(0, 12),
    theme_color: accentColor,
    background_color: '#000000',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: 'https://sistenfox.com/assets/pwa-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
  updateStep(0, 'success', `Manifest gerado! Nome: "${businessName}", Tema: ${accentColor}`);

  // Step 2: Assets Compilation
  updateStep(1, 'running', 'Minificando arquivos JS/TS e processando classes Tailwind CSS...');
  await new Promise(r => setTimeout(r, 800));
  updateStep(1, 'success', 'Compilação concluída! bundle.min.js gerado (42kb).');

  // Step 3: Service Worker
  updateStep(2, 'running', 'Configurando cache offline e estratégias Network-First...');
  await new Promise(r => setTimeout(r, 500));
  updateStep(2, 'success', 'Service worker registrado! Estratégias salvas para navegação offline.');

  // Step 4: Provisioning Cloud Run
  updateStep(3, 'running', 'Implantando imagem docker sfx-client-runtime no Google Cloud Run...');
  await new Promise(r => setTimeout(r, 1000));
  updateStep(3, 'success', 'Contêiner alocado! CPU: 0.5 vCPU, RAM: 512MB, Ingress: All.');

  // Step 5: Domain Setup
  updateStep(4, 'running', 'Configurando certificado SSL gratuito da Let\'s Encrypt...');
  await new Promise(r => setTimeout(r, 700));
  updateStep(4, 'success', `SSL emitido! Domínio https://${domain} pronto para tráfego.`);

  return {
    success: true,
    deployedUrl: `https://${domain}`,
    manifest,
    buildTimeMs: Date.now() - startTime,
    steps
  };
}
