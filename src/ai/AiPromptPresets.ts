export interface PromptPreset {
  id: string;
  name: string;
  category: 'landing' | 'email' | 'onboarding';
  prompt: string;
  description: string;
}

export const AI_PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'landing_hero',
    name: 'Landing Page: Hero Premium',
    category: 'landing',
    description: 'Gera títulos e subtítulos de alto impacto visual e apelo comercial premium.',
    prompt: 'Aja como um redator publicitário especializado em marcas de luxo e tecnologia. Escreva um título curto (máximo 6 palavras) e um subtítulo sofisticado (máximo 20 palavras) para a seção Hero da página de pouso de um negócio do tipo {businessType} chamado {businessName}. Descrição: {description}. Tom da marca: {tone}. Retorne um tom refinado, exclusivo e impactante.'
  },
  {
    id: 'landing_features',
    name: 'Landing Page: Recursos e Benefícios',
    category: 'landing',
    description: 'Gera uma lista de diferenciais estratégicos voltados à conversão.',
    prompt: 'Escreva 4 diferenciais e recursos inovadores (frases curtas e persuasivas de no máximo 10 palavras) para o negócio {businessName}, do tipo {businessType}. Descrição: {description}. Esses recursos devem ressaltar a alta tecnologia, exclusividade e design excepcional do serviço. Retorne no formato de itens de lista refinados.'
  },
  {
    id: 'welcome_email',
    name: 'E-mail: Boas-vindas Exclusivo',
    category: 'email',
    description: 'Cria um e-mail de boas-vindas sofisticado que acolhe o novo cliente.',
    prompt: 'Aja como Diretor de Relacionamento da Sistenfox. Redija um e-mail de boas-vindas premium para os clientes do negócio {businessName}. O e-mail deve saudar o cliente pelo seu ingresso no ecossistema exclusivo da marca, explicar como acessar o PWA no celular e reforçar o suporte personalizado. Tom: {tone}. Use espaçamento elegante e linguagem de altíssimo padrão.'
  },
  {
    id: 'onboarding_text',
    name: 'Onboarding: Guia Inicial Rápido',
    category: 'onboarding',
    description: 'Textos de onboarding amigáveis e luxuosos para guiar novos usuários.',
    prompt: 'Escreva as mensagens de um fluxo de onboarding de 3 passos para o novo aplicativo de {businessName}. Passo 1: Boas-vindas ao app e configuração da conta. Passo 2: Como navegar pelo menu ou catálogo interativo. Passo 3: Como fazer pedidos e acumular pontos no clube de fidelidade exclusivo. Seja claro, conciso, e mantenha a identidade premium da marca.'
  }
];

export const AI_DASHBOARD_PRESETS = [
  {
    businessType: 'restaurant',
    metrics: [
      { label: 'Receita Operacional', value: 'R$ 24.510,00', change: '+18%', chartType: 'area', color: '#22d3ee' },
      { label: 'Pedidos na Fila', value: '14 ativos', change: 'Estável', chartType: 'bar', color: '#a78bfa' },
      { label: 'Ticket Médio', value: 'R$ 68,50', change: '+5.2%', chartType: 'line', color: '#10b981' }
    ]
  },
  {
    businessType: 'store',
    metrics: [
      { label: 'Vendas Totais', value: 'R$ 48.900,00', change: '+32%', chartType: 'area', color: '#fbbf24' },
      { label: 'Conversão de Checkout', value: '5.2%', change: '+0.8%', chartType: 'bar', color: '#38bdf8' },
      { label: 'Abandono de Sacola', value: '22%', change: '-12%', chartType: 'line', color: '#f43f5e' }
    ]
  },
  {
    businessType: 'service',
    metrics: [
      { label: 'Agendamentos Efetuados', value: '312 sessões', change: '+14%', chartType: 'area', color: '#10b981' },
      { label: 'Taxa de Retenção', value: '89%', change: '+3%', chartType: 'bar', color: '#22d3ee' },
      { label: 'Ocupação Mensal', value: '95.2%', change: '+7.5%', chartType: 'line', color: '#f59e0b' }
    ]
  },
  {
    businessType: 'custom',
    metrics: [
      { label: 'Usuários Ativos / Dia', value: '1.420', change: '+25%', chartType: 'area', color: '#ec4899' },
      { label: 'Requisições API', value: '124.5k', change: '+15.4%', chartType: 'bar', color: '#22d3ee' },
      { label: 'Tempo de Resposta', value: '42ms', change: '-8ms', chartType: 'line', color: '#10b981' }
    ]
  }
];
