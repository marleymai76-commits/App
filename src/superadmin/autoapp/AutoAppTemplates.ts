export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  themeType: 'dsx-1-dark' | 'dsx-1-neon' | 'dsx-1-amber' | 'dsx-1-emerald';
  landingPage: {
    heroTitle: string;
    heroSubtitle: string;
    features: string[];
    ctaText: string;
  };
  navigation: {
    label: string;
    route: string;
    icon: string;
  }[];
  mockData: {
    items: { name: string; price: number; category: string; description: string; imageUrl?: string }[];
    metrics: { label: string; value: string; change: string }[];
  };
}

export const AUTO_APP_TEMPLATES: AppTemplate[] = [
  {
    id: 'restaurant',
    name: 'Restaurante Premium',
    description: 'Design de menu interativo de alta conversão, pedidos em tempo real e painel de cozinha.',
    icon: 'Utensils',
    accentColor: '#22d3ee', // Cyan
    themeType: 'dsx-1-neon',
    landingPage: {
      heroTitle: 'Sabores Extraordinários com Tecnologia Integrada',
      heroSubtitle: 'Faça seu pedido on-line de forma rápida, segura e acompanhe tudo em tempo real através do nosso PWA de última geração.',
      features: [
        'Cardápio Digital Inteligente com fotos HD',
        'Pedidos via WhatsApp & Pagamento Integrado',
        'Acompanhamento de Status do Pedido (Cozinha ao Entregador)',
        'Fidelidade e Cupons de Desconto Dinâmicos'
      ],
      ctaText: 'Ver Cardápio & Pedir Agora'
    },
    navigation: [
      { label: 'Início', route: '/', icon: 'Home' },
      { label: 'Cardápio', route: '/menu', icon: 'BookOpen' },
      { label: 'Meus Pedidos', route: '/orders', icon: 'Clock' },
      { label: 'Fidelidade', route: '/rewards', icon: 'Award' }
    ],
    mockData: {
      items: [
        { name: 'Burger Premium DSX-1', price: 42.90, category: 'Burgers', description: 'Blend especial 180g, queijo cheddar derretido, cebola caramelizada e maionese defumada artesanal.' },
        { name: 'Fritas Trufadas', price: 24.90, category: 'Acompanhamentos', description: 'Batatas rústicas fritas, finalizadas com azeite de trufas brancas e queijo parmesão ralado na hora.' },
        { name: 'Soda Italiana Blue Fox', price: 14.00, category: 'Bebidas', description: 'Xarope de curaçau blue, água gaseificada, gelo e rodelas de limão siciliano.' }
      ],
      metrics: [
        { label: 'Faturamento Mensal', value: 'R$ 18.450,00', change: '+12%' },
        { label: 'Pedidos Realizados', value: '412', change: '+8%' },
        { label: 'Tempo Médio Entrega', value: '28 min', change: '-4 min' }
      ]
    }
  },
  {
    id: 'store',
    name: 'E-commerce & Boutique',
    description: 'Vitrine minimalista imersiva de produtos com sacola de compras integrada e checkout PIX.',
    icon: 'ShoppingBag',
    accentColor: '#fbbf24', // Amber
    themeType: 'dsx-1-amber',
    landingPage: {
      heroTitle: 'Curadoria Exclusiva, Estilo Singular',
      heroSubtitle: 'Explore coleções selecionadas a dedo para os mais exigentes, com entrega expressa e o melhor suporte pós-venda.',
      features: [
        'Vitrine 3D Interativa de Alta Performance',
        'Sacola de Compras Instantânea sem Atrito',
        'Cálculo Inteligente de Frete Integrado',
        'Checkout Simplificado (PIX e Cartão com 1 clique)'
      ],
      ctaText: 'Explorar Coleção'
    },
    navigation: [
      { label: 'Novidades', route: '/', icon: 'Sparkles' },
      { label: 'Coleções', route: '/catalog', icon: 'Layers' },
      { label: 'Sacola', route: '/cart', icon: 'ShoppingBag' },
      { label: 'Minhas Compras', route: '/purchases', icon: 'ShoppingBag' }
    ],
    mockData: {
      items: [
        { name: 'Jaqueta Sistenfox Cyberpunk Edition', price: 499.00, category: 'Roupas', description: 'Corta-vento refletivo de alta durabilidade com costuras seladas e detalhes cromados futuristas.' },
        { name: 'Mochila Techwear Modular', price: 289.00, category: 'Acessórios', description: 'Compartimentos expansíveis de nylon balístico impermeável com conexões magnéticas de engate rápido.' },
        { name: 'Óculos de Sol Neon Glow', price: 159.00, category: 'Acessórios', description: 'Lentes polarizadas com proteção UV400 e armação translúcida que reluz levemente sob iluminação UV.' }
      ],
      metrics: [
        { label: 'Faturamento Mensal', value: 'R$ 34.200,00', change: '+24%' },
        { label: 'Conversão de Checkout', value: '4.8%', change: '+1.2%' },
        { label: 'Ticket Médio', value: 'R$ 315,00', change: '+5%' }
      ]
    }
  },
  {
    id: 'service',
    name: 'Agendamento e Serviços',
    description: 'Plataforma para prestadores de serviços, agendamento online de horários e portfólio profissional.',
    icon: 'Calendar',
    accentColor: '#10b981', // Emerald
    themeType: 'dsx-1-emerald',
    landingPage: {
      heroTitle: 'Serviços de Classe Mundial sob Demanda',
      heroSubtitle: 'Agende seu horário com os maiores especialistas da região diretamente do seu celular de forma descomplicada.',
      features: [
        'Grade de Horários Integrada e em Tempo Real',
        'Lembretes de Agendamento automáticos via WhatsApp',
        'Painel do Profissional com Agenda Sincronizada',
        'Portfólio Interativo com Avaliação de Clientes'
      ],
      ctaText: 'Reservar Meu Horário'
    },
    navigation: [
      { label: 'Serviços', route: '/', icon: 'Briefcase' },
      { label: 'Agendar', route: '/booking', icon: 'Calendar' },
      { label: 'Meus Agendamentos', route: '/my-bookings', icon: 'User' },
      { label: 'Sobre Nós', route: '/about', icon: 'Info' }
    ],
    mockData: {
      items: [
        { name: 'Corte de Cabelo Sistenfox Style', price: 60.00, category: 'Cabelo', description: 'Visagismo completo, corte tesoura/máquina personalizado e finalização com pomada de carvão ativado.' },
        { name: 'Tratamento de Barba Suprema', price: 45.00, category: 'Barba', description: 'Barboterapia com toalha quente, óleos hidratantes premium e alinhamento navalhado impecável.' },
        { name: 'Combo Corte + Barba + Spa Facial', price: 95.00, category: 'Combos', description: 'Nosso serviço mais completo com hidratação de pele de argila preta, corte e barba completa.' }
      ],
      metrics: [
        { label: 'Atendimentos Mensais', value: '280 sessões', change: '+15%' },
        { label: 'Taxa de Retenção', value: '82%', change: '+4%' },
        { label: 'Ocupação da Agenda', value: '94%', change: '+11%' }
      ]
    }
  },
  {
    id: 'custom',
    name: 'App Personalizado (Brutalista)',
    description: 'Interface modular versátil adaptável para qualquer tipo de modelo de negócios disruptivo.',
    icon: 'Layers',
    accentColor: '#f43f5e', // Rose
    themeType: 'dsx-1-dark',
    landingPage: {
      heroTitle: 'Solução sob Medida sem Limites Criativos',
      heroSubtitle: 'Desenvolvimento ágil e de alta fidelidade visual. Tenha uma presença digital ultra polida e performática.',
      features: [
        'Grade de Componentes Totalmente Moduláveis',
        'Motor de Integração API Sistenfox habilitado',
        'Painel Customizado para Operação Dedicada',
        'Suporte a Notificações Push Locais e de Nuvem'
      ],
      ctaText: 'Conhecer Soluções'
    },
    navigation: [
      { label: 'Visão Geral', route: '/', icon: 'Grid' },
      { label: 'Explorar', route: '/explore', icon: 'Search' },
      { label: 'Configurações', route: '/settings', icon: 'Settings' }
    ],
    mockData: {
      items: [
        { name: 'Módulo Inteligente Personalizado', price: 150.00, category: 'Licença', description: 'Integração direta com o núcleo Sistenfox garantindo uptime superior a 99.9%.' },
        { name: 'Hospedagem Premium Redundante', price: 49.00, category: 'Assinatura', description: 'Deploy em contêineres Cloud Run escaláveis com CDN global dedicada.' }
      ],
      metrics: [
        { label: 'Taxa de Download PWA', value: '3.1k downloads', change: '+40%' },
        { label: 'Acessos Diários', value: '1.240', change: '+32%' },
        { label: 'Conexões Ativas', value: '142 / seg', change: '+18%' }
      ]
    }
  }
];
