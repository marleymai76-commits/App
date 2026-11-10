export interface Plan {
  nome: string;
  precoOriginal?: number;
  preco: number;
  destaque: string;
  desconto?: string;
  duracaoDesconto?: string;
  features: string[];
}

export interface AppConfig {
  nome: string;
  tema: string;
  personalizável: boolean;
  planos: Plan[];
  funcionalidades: Record<string, boolean>;
  personalizacao: {
    logo: string;
    cores: string[];
    fontes: string[];
    banners: string;
    frasesChave: string;
    estilo: string;
  };
  integracoes: Record<string, boolean>;
  versoes: string[];
}

export const restauranteApp: AppConfig = {
  nome: "Sistenfox Restaurante",
  tema: "preto-dourado",
  personalizável: true,
  planos: [
    { 
      nome: "Pocket", 
      precoOriginal: 69,
      preco: 20.70, 
      destaque: "70% OFF por 2 Anos",
      desconto: "70% OFF",
      duracaoDesconto: "2 anos",
      features: ["Dashboard", "Controle de Pedidos", "Cardápio Digital", "Preço garantido por 24 meses"]
    },
    { 
      nome: "Pro", 
      precoOriginal: 99,
      preco: 29.70, 
      destaque: "Mais Popular • 70% OFF",
      desconto: "70% OFF",
      duracaoDesconto: "2 anos",
      features: ["Tudo do Pocket", "Reservas Online", "Notificações Push", "Preço garantido por 24 meses"]
    },
    { 
      nome: "Premium", 
      precoOriginal: 149,
      preco: 44.70, 
      destaque: "Alta Performance • 70% OFF",
      desconto: "70% OFF",
      duracaoDesconto: "2 anos",
      features: ["Tudo do Pro", "Relatórios Financeiros", "Controle de Estoque", "Preço garantido por 24 meses"]
    },
    { 
      nome: "Fiscal", 
      precoOriginal: 199,
      preco: 59.70, 
      destaque: "Completo e Seguro • 70% OFF",
      desconto: "70% OFF",
      duracaoDesconto: "2 anos",
      features: ["Tudo do Premium", "Sistema Fiscal", "Pagamento Online", "Preço garantido por 24 meses"]
    }
  ],
  funcionalidades: {
    dashboard: true,
    controlePedidos: true,
    cardapioDigital: true,
    reservasOnline: true,
    notificacoesPush: true,
    relatoriosFinanceiros: true,
    controleEstoque: true,
    personalizacaoVisual: true,
    multiIdioma: true,
    modoDark: true,
    versaoCliente: true,
    versaoAdmin: true
  },
  personalizacao: {
    logo: "https://i.ibb.co/v4m0YvS/logo-sistenfox-gold.png",
    cores: ["#000000", "#FFD700"],
    fontes: ["Montserrat", "Playfair Display"],
    banners: "editáveis",
    frasesChave: "customizáveis",
    estilo: "premium, moderno, sofisticado"
  },
  integracoes: {
    whatsapp: true,
    instagram: true,
    googleMaps: true,
    sistemaFiscal: true,
    pagamentoOnline: true
  },
  versoes: [
    "Restaurante",
    "Salão de Beleza",
    "Studio de Tatuagem",
    "Cafeteria",
    "Barbearia",
    "Delivery",
    "Loja de Bolos"
  ]
};

export const plans = {
  starter: {
    id: "starter",
    name: "Starter (Grátis)",
    originalPrice: 0,
    price: 0,
    billingCycle: "annual",
    annualPrice: 0,
    discount: null,
    discountDuration: null,
    validationCycleDays: 90,
    features: [
      "Dashboard básico",
      "Controle de pedidos simples",
      "Cardápio digital básico",
      "1 dono",
      "1 funcionário",
      "20 produtos",
      "20 pedidos/mês",
      "Sem fiscal",
      "Sem módulos premium",
      "Sem notificações push",
      "Sem reservas",
      "Sem estoque avançado",
      "Validação automática a cada 3 meses"
    ]
  },

  pocketPro: {
    id: "pocketPro",
    name: "Pocket Pro",
    originalPrice: 69.00,
    price: 20.70, // 70% de desconto sobre 69.00
    billingCycle: "biennial",
    annualPrice: 248.40,
    discount: "70% OFF",
    discountDuration: "2 anos",
    features: [
      "Dashboard",
      "Controle de Pedidos",
      "Cardápio Digital",
      "70% OFF travado por 2 anos",
      "Inclui 10 contas vitalícias (com cupom)"
    ]
  },

  business: {
    id: "business",
    name: "Business",
    originalPrice: 99.00,
    price: 29.70, // 70% de desconto sobre 99.00
    billingCycle: "biennial",
    annualPrice: 356.40,
    discount: "70% OFF",
    discountDuration: "2 anos",
    features: [
      "Tudo do Pocket Pro",
      "Reservas Online",
      "Notificações Push",
      "70% OFF travado por 2 anos",
      "Inclui 10 contas vitalícias (com cupom)"
    ]
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    originalPrice: 149.00,
    price: 44.70, // 70% de desconto sobre 149.00
    billingCycle: "biennial",
    annualPrice: 536.40,
    discount: "70% OFF",
    discountDuration: "2 anos",
    features: [
      "Tudo do Business",
      "Relatórios Financeiros",
      "Controle de Estoque",
      "70% OFF travado por 2 anos",
      "Inclui 10 contas vitalícias (com cupom)"
    ]
  },

  enterpriseFiscal: {
    id: "enterpriseFiscal",
    name: "Enterprise Fiscal",
    originalPrice: 199.00,
    price: 59.70, // 70% de desconto sobre 199.00
    billingCycle: "biennial",
    annualPrice: 716.40,
    discount: "70% OFF",
    discountDuration: "2 anos",
    features: [
      "Tudo do Enterprise",
      "Sistema Fiscal",
      "Pagamento Online",
      "70% OFF travado por 2 anos",
      "Inclui 10 contas vitalícias (com cupom)"
    ]
  }
};

export function checkPlan(user: { plan?: string } | null | undefined, requiredPlan: string): boolean {
  if (!user || !user.plan) return false;

  const normalize = (p: string) => {
    const val = p.toLowerCase();
    if (val === 'starter' || val === 'gratis' || val === 'free' || val === 'plano_gratuito') return 'starter';
    if (val === 'pocketpro' || val === 'pocket') return 'pocket';
    if (val === 'business' || val === 'pro') return 'business';
    if (val === 'enterprise' || val === 'premium') return 'enterprise';
    if (val === 'enterprisefiscal' || val === 'enterprise_fiscal' || val === 'fiscal') return 'enterprise_fiscal';
    return val;
  };

  const hierarchy = ["starter", "pocket", "business", "enterprise", "enterprise_fiscal"];
  const userPlanNormalized = normalize(user.plan);
  const reqPlanNormalized = normalize(requiredPlan);

  const userIndex = hierarchy.indexOf(userPlanNormalized);
  const reqIndex = hierarchy.indexOf(reqPlanNormalized);

  if (userIndex === -1) {
    return false;
  }

  return userIndex >= reqIndex;
}

