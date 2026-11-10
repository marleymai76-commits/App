import { adminDb } from "./firebase-admin.js";

export interface NichePreset {
  products: Array<{ name: string; category: string; price: number; available: boolean; image: string }>;
  services: Array<{ name: string; category: string; price: number; duration?: number; available: boolean }>;
  automations: Array<{ name: string; trigger: string; channel: string; enabled: boolean; description: string }>;
  templates: Array<{ title: string; content: string; type: string }>;
  kpis: Record<string, any>;
}

export const NICHE_PRESETS: Record<string, NichePreset> = {
  salao: {
    products: [
      { name: "Shampoo Reconstrutor 300ml", category: "Tratamentos", price: 89.90, available: true, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=60" },
      { name: "Óleo de Argan Finalizador", category: "Tratamentos", price: 110.00, available: true, image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [
      { name: "Corte de Cabelo Premium", category: "Corte & Penteado", price: 65.00, duration: 45, available: true },
      { name: "Manicure & Pedicure Express", category: "Manicure & Pedicure", price: 45.00, duration: 30, available: true },
      { name: "Coloração Global Especial", category: "Coloração", price: 180.00, duration: 120, available: true },
      { name: "Limpeza de Pele Profunda", category: "Estética Facial", price: 120.00, duration: 60, available: true }
    ],
    automations: [
      { name: "Lembrete WhatsApp (2h antes)", trigger: "appointment_scheduled", channel: "whatsapp", enabled: true, description: "Disparado 2 horas antes de cada atendimento agendado para reduzir faltas." },
      { name: "Fidelização Pós-Serviço (15 dias)", trigger: "appointment_completed", channel: "whatsapp", enabled: true, description: "Disparado 15 dias após o atendimento, convidando o cliente a agendar novamente." }
    ],
    templates: [
      { title: "Confirmação de Agendamento", content: "Olá {{cliente}}, seu agendamento de {{servico}} está confirmado para {{data}} às {{hora}}. Esperamos você!", type: "whatsapp" },
      { title: "Agradecimento e Avaliação", content: "Olá {{cliente}}, o que achou do seu serviço de {{servico}} hoje? Avalie-nos em: {{link}}", type: "whatsapp" }
    ],
    kpis: {
      activeNiche: "salao",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Agendamentos Hoje", value: "14", change: "+12%" },
        { label: "Faturamento Serviços", value: "R$ 1.840,00", change: "+8%" },
        { label: "Taxa de Ocupação", value: "84%", change: "+5%" }
      ]
    }
  },
  clinica: {
    products: [
      { name: "Kit Cuidados Pós-Procedimento", category: "Procedimentos", price: 150.00, available: true, image: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [
      { name: "Consulta Médica Geral", category: "Consultas", price: 250.00, duration: 30, available: true },
      { name: "Teleconsulta Especializada", category: "Telemedicina", price: 190.00, duration: 30, available: true },
      { name: "Exame Ultrassom Simples", category: "Exames", price: 160.00, duration: 20, available: true },
      { name: "Retorno de Consulta", category: "Retornos", price: 0.00, duration: 20, available: true }
    ],
    automations: [
      { name: "Mensagem SMS (24h antes)", trigger: "appointment_scheduled", channel: "sms", enabled: true, description: "Disparado 24h antes da consulta solicitando resposta de sim/não para confirmação automática." },
      { name: "Preparo de Exame Prévio", trigger: "exam_scheduled", channel: "email", enabled: true, description: "Disparado ao agendar exames, orientando regras de jejum e preparações necessárias." }
    ],
    templates: [
      { title: "Instruções de Jejum", content: "Prezado(a) {{cliente}}, lembramos que seu exame amanhã às {{hora}} exige jejum absoluto de 8 horas. Dúvidas: {{telefone}}", type: "email" },
      { title: "Acesso à Telemedicina", content: "Seu atendimento online com Dr(a) está pronto. Acesse a sala pelo link 10 min antes: {{link_sala}}", type: "sms" }
    ],
    kpis: {
      activeNiche: "clinica",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Consultas Marcadas", value: "28", change: "+15%" },
        { label: "Aproveitamento Telemed.", value: "92%", change: "+21%" },
        { label: "Tempo Médio Espera", value: "11 min", change: "-4 min" }
      ]
    }
  },
  oficina: {
    products: [
      { name: "Pastilha de Freio Cerâmica Bendix", category: "Peças & Componentes", price: 185.00, available: true, image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=60" },
      { name: "Óleo Sintético Mobil 5W30 1L", category: "Peças & Componentes", price: 62.00, available: true, image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [
      { name: "Alinhamento 3D + Balanceamento", category: "Freios & Suspensão", price: 140.00, available: true },
      { name: "Revisão Geral Preventiva", category: "Mecânica Geral", price: 290.00, available: true },
      { name: "Higienização de Ar Condicionado", category: "Serviços Rápidos", price: 90.00, available: true },
      { name: "Diagnóstico Computadorizado OBD2", category: "Injeção Eletrônica", price: 120.00, available: true }
    ],
    automations: [
      { name: "Aviso de Orçamento Disponível", trigger: "quote_ready", channel: "whatsapp", enabled: true, description: "Dispara um PDF interativo do orçamento para aprovação digital do cliente." },
      { name: "Alerta de Veículo Pronto", trigger: "order_ready", channel: "whatsapp", enabled: true, description: "Avisa o cliente imediatamente quando os mecânicos dão baixa de pronto no sistema." }
    ],
    templates: [
      { title: "Orçamento de Serviços", content: "Olá {{cliente}}, o orçamento para o veículo {{veiculo}} está pronto para aprovação. Acesse: {{link}}", type: "whatsapp" },
      { title: "Notificação de Retirada", content: "Ótima notícia, {{cliente}}! Seu veículo {{veiculo}} já passou por testes e está pronto para retirada. Aguardamos você!", type: "whatsapp" }
    ],
    kpis: {
      activeNiche: "oficina",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Carros na Oficina", value: "9", change: "+2" },
        { label: "Orçamentos Aprovados", value: "88%", change: "+6%" },
        { label: "Ticket Médio OS", value: "R$ 780,00", change: "+14%" }
      ]
    }
  },
  mercado: {
    products: [
      { name: "Arroz Agulhinha Premium 5kg", category: "Mercearia", price: 28.90, available: true, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60" },
      { name: "Azeite de Oliva Extra Virgem 500ml", category: "Mercearia", price: 44.90, available: true, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=60" },
      { name: "Café Gourmet Torrado Vácuo 500g", category: "Mercearia", price: 22.50, available: true, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=60" },
      { name: "Detergente Líquido Neutro 500ml", category: "Limpeza", price: 3.20, available: true, image: "https://images.unsplash.com/photo-1622060874210-4161f00dc1f3?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [],
    automations: [
      { name: "Alerta Estoque Crítico (<5)", trigger: "inventory_low", channel: "dashboard", enabled: true, description: "Gera alerta prioritário de reabastecimento na tela do gerente quando o estoque bate menos de 5 un." },
      { name: "Campanha Cashback Mensal", trigger: "monthly_loyalty", channel: "email", enabled: true, description: "Oferece vantagens de pontuação ou descontos aos clientes fidelidade cadastrados." }
    ],
    templates: [
      { title: "Cupom Clube de Descontos", content: "Olá {{cliente}}, venha conferir o encarte desta semana no Mercado! Use o cupom CLUBE10 e ganhe 10% no caixa.", type: "email" },
      { title: "Aviso de Saldo Fidelidade", content: "Prezado(a) {{cliente}}, você acumulou {{pontos}} pontos no nosso clube. Venha resgatar como desconto em suas compras!", type: "sms" }
    ],
    kpis: {
      activeNiche: "mercado",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Itens Cadastrados", value: "312", change: "+18 un" },
        { label: "Giro de Estoque", value: "4.2x", change: "+0.3" },
        { label: "Faturamento Frente Caixa", value: "R$ 4.390,00", change: "+11%" }
      ]
    }
  },
  varejo: {
    products: [
      { name: "Arroz Agulhinha Premium 5kg", category: "Mercearia", price: 28.90, available: true, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60" },
      { name: "Azeite de Oliva Extra Virgem 500ml", category: "Mercearia", price: 44.90, available: true, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=60" },
      { name: "Café Gourmet Torrado Vácuo 500g", category: "Mercearia", price: 22.50, available: true, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=60" },
      { name: "Detergente Líquido Neutro 500ml", category: "Limpeza", price: 3.20, available: true, image: "https://images.unsplash.com/photo-1622060874210-4161f00dc1f3?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [],
    automations: [
      { name: "Alerta Estoque Crítico (<5)", trigger: "inventory_low", channel: "dashboard", enabled: true, description: "Gera alerta prioritário de reabastecimento na tela do gerente quando o estoque bate menos de 5 un." },
      { name: "Campanha Cashback Mensal", trigger: "monthly_loyalty", channel: "email", enabled: true, description: "Oferece vantagens de pontuação ou descontos aos clientes fidelidade cadastrados." }
    ],
    templates: [
      { title: "Cupom Clube de Descontos", content: "Olá {{cliente}}, venha conferir o encarte desta semana no Mercado! Use o cupom CLUBE10 e ganhe 10% no caixa.", type: "email" },
      { title: "Aviso de Saldo Fidelidade", content: "Prezado(a) {{cliente}}, você acumulou {{pontos}} pontos no nosso clube. Venha resgatar como desconto em suas compras!", type: "sms" }
    ],
    kpis: {
      activeNiche: "varejo",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Itens Cadastrados", value: "312", change: "+18 un" },
        { label: "Giro de Estoque", value: "4.2x", change: "+0.3" },
        { label: "Faturamento Frente Caixa", value: "R$ 4.390,00", change: "+11%" }
      ]
    }
  },
  restaurante: {
    products: [
      { name: "Picanha Inteira Grelhada de Luxo", category: "Pratos Principais", price: 145.00, available: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60" },
      { name: "Torta Fudge de Chocolate Belga", category: "Sobremesas", price: 26.00, available: true, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=60" },
      { name: "Suco Natural de Laranja 500ml", category: "Bebidas", price: 12.00, available: true, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [],
    automations: [
      { name: "KDS Push (Cozinha Automática)", trigger: "order_received", channel: "dashboard", enabled: true, description: "Despacha pedidos instantaneamente ao monitor de preparo da cozinha com avisos sonoros." },
      { name: "Pedido Pronto para Garçom", trigger: "order_cooked", channel: "dashboard", enabled: true, description: "Notifica o dispositivo móvel do garçom para que ele leve o prato quente à mesa." }
    ],
    templates: [
      { title: "Cardápio QR Code Digital", content: "Acesse nosso menu em alta definição direto do seu smartphone pelo link: {{link_menu}}", type: "dashboard" },
      { title: "Detalhamento de Conta", content: "Mesa {{mesa}}: {{itens}} | Total Geral com taxas: R$ {{total}}", type: "print" }
    ],
    kpis: {
      activeNiche: "restaurante",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Contas Abertas", value: "11 mesas", change: "+3" },
        { label: "Tempo de Cozinha", value: "18 min", change: "-2.3 min" },
        { label: "Faturamento Diário", value: "R$ 2.412,00", change: "+16%" }
      ]
    }
  },
  pizzaria: {
    products: [
      { name: "Pizza Meio a Meio Gigante", category: "Pizzas Salgadas", price: 65.00, available: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60" },
      { name: "Borda Recheada Catupiry Tradicional", category: "Bordas", price: 12.00, available: true, image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [],
    automations: [
      { name: "Divisão de Impressão (Forno vs Bebida)", trigger: "order_received", channel: "system", enabled: true, description: "Manda as pizzas direto para o monitor do forno e as bebidas para a chopeira." }
    ],
    templates: [
      { title: "Pedido de Pizza em Montagem", content: "Pizza {{tamanho}} sabor {{sabores}} com borda {{borda}}. Total: R$ {{preco}}", type: "system" }
    ],
    kpis: {
      activeNiche: "pizzaria",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Pizzas Assadas", value: "48", change: "+12" },
        { label: "Tempo de Forno Médio", value: "9 min", change: "-1.5 min" },
        { label: "Ticket Médio", value: "R$ 98,50", change: "+7%" }
      ]
    }
  },
  sushi: {
    products: [
      { name: "Combinado Premium 40 Peças", category: "Combinados", price: 120.00, available: true, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [],
    automations: [
      { name: "Pedido Rodízio via QR Code", trigger: "rodizio_order", channel: "system", enabled: true, description: "Limita o número de peças por rodada no rodízio eletrônico para evitar desperdício." }
    ],
    templates: [
      { title: "Comanda de Rodízio", content: "Mesa {{mesa}}: Rodízio Ativo | Peças nesta rodada: {{itens_sushi}}", type: "system" }
    ],
    kpis: {
      activeNiche: "sushi",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Rodízios Ativos", value: "22", change: "+6" },
        { label: "Desperdício Estimado", value: "1.4%", change: "-0.8%" },
        { label: "Sashimis Servidos", value: "310 un", change: "+15%" }
      ]
    }
  },
  cafe: {
    products: [
      { name: "Cappuccino Italiano Cremoso XL", category: "Cafés Quentes", price: 14.50, available: true, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=60" },
      { name: "Croissant de Pistache de Paris", category: "Salgados", price: 18.00, available: true, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [],
    automations: [
      { name: "Notificação Retirada Balcão (Takeaway)", trigger: "order_ready", channel: "whatsapp", enabled: true, description: "Avisa o cliente pelo WhatsApp quando o café dele está quentinho te esperando no balcão." }
    ],
    templates: [
      { title: "Café Pronto no Balcão", content: "Olá {{cliente}}, seu {{item}} quentinho acabou de sair da máquina! Pode retirar no balcão principal.", type: "whatsapp" }
    ],
    kpis: {
      activeNiche: "cafe",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Cafés Servidos", value: "128", change: "+24" },
        { label: "Tempo de Balcão", value: "2.4 min", change: "-30s" },
        { label: "Faturamento Lanchonete", value: "R$ 1.120,00", change: "+10%" }
      ]
    }
  },
  churrascaria: {
    products: [
      { name: "Picanha Nobre Fatiada na Chapa", category: "Cortes Bovinos", price: 110.00, available: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [],
    automations: [
      { name: "Controle de Entrada Rodízio", trigger: "buffet_active", channel: "system", enabled: true, description: "Controla comandas individuais de churrascaria de forma rápida integrada ao caixa." }
    ],
    templates: [
      { title: "Entrada Rodízio", content: "Ticket Churrascaria: {{comanda}} | Horário Entrada: {{entrada}}", type: "print" }
    ],
    kpis: {
      activeNiche: "churrascaria",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Clientes Atendidos", value: "142", change: "+18" },
        { label: "Comsumo de Carnes Nobres", value: "54kg", change: "+5kg" },
        { label: "Mesa VIP Ocupação", value: "100%", change: "Estável" }
      ]
    }
  },
  construcao: {
    products: [
      { name: "Cimento Votoran CP-II 50kg", category: "Materiais Básicos", price: 39.90, available: true, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=60" },
      { name: "Porcelanato Retificado Eliane 80x80", category: "Acabamento", price: 89.90, available: true, image: "https://images.unsplash.com/photo-1502005229762-fc1b2381f0db?w=400&auto=format&fit=crop&q=60" }
    ],
    services: [
      { name: "Mão de Obra de Alvenaria (Diária)", category: "Mão de Obra", price: 220.00, available: true },
      { name: "Mão de Obra de Pintura Fina (Diária)", category: "Mão de Obra", price: 180.00, available: true }
    ],
    automations: [
      { name: "Alerta de Entrega de Materiais", trigger: "supplies_dispatched", channel: "whatsapp", enabled: true, description: "Avisa o mestre de obras quando o caminhão de cimento/areia sai da distribuidora." },
      { name: "Aviso de Fechamento de Cronograma", trigger: "phase_ended", channel: "email", enabled: true, description: "Dispara relatório fotográfico das etapas concluídas para os engenheiros/clientes." }
    ],
    templates: [
      { title: "Relatório Diário de Obra", content: "Obra {{obra}}: Mão de obra ativa: {{equipe}} | Entregas hoje: {{materiais}} | Clima: {{clima}}", type: "email" },
      { title: "Status de Etapa Concluída", content: "Parabéns, {{cliente}}! A etapa de {{etapa}} foi finalizada e aprovada na obra {{obra}}. Acesse as fotos: {{link}}", type: "whatsapp" }
    ],
    kpis: {
      activeNiche: "construcao",
      provisionedAt: Date.now(),
      metrics: [
        { label: "Obras Ativas", value: "3 projetos", change: "+1" },
        { label: "Insumos Pedidos", value: "18 pedidos", change: "+5" },
        { label: "Orçamento Executado", value: "R$ 145.000,00", change: "-4%" }
      ]
    }
  }
};

export async function provisionNiche(companyId: string, nicheId: string): Promise<any> {
  const preset = NICHE_PRESETS[nicheId];
  if (!preset) {
    console.warn(`No preset found for niche: ${nicheId}. Skipping provisioning.`);
    return { success: false, reason: "Preset not found" };
  }

  console.log(`[Provisioning] Deploying preset for company ${companyId} on niche ${nicheId}...`);
  const batch = adminDb.batch();

  // Scope collection paths: companies/{companyId}/niches/{nicheId}/products, services, automations, templates, KPIs
  const nicheRef = adminDb.collection("companies").doc(companyId).collection("niches").doc(nicheId);
  batch.set(nicheRef, {
    nicheId,
    provisionedAt: Date.now(),
    status: "active",
    kpis: preset.kpis
  });

  // 1. Delete previous records in active subcollections for this niche to guarantee cleanliness (Migration Engine)
  const productsSnap = await nicheRef.collection("products").get();
  productsSnap.docs.forEach(doc => batch.delete(doc.ref));

  const servicesSnap = await nicheRef.collection("services").get();
  servicesSnap.docs.forEach(doc => batch.delete(doc.ref));

  const automationsSnap = await nicheRef.collection("automations").get();
  automationsSnap.docs.forEach(doc => batch.delete(doc.ref));

  const templatesSnap = await nicheRef.collection("templates").get();
  templatesSnap.docs.forEach(doc => batch.delete(doc.ref));

  // 2. Add fresh preset records
  preset.products.forEach(p => {
    const pRef = nicheRef.collection("products").doc();
    batch.set(pRef, { ...p, createdAt: Date.now() });
  });

  preset.services.forEach(s => {
    const sRef = nicheRef.collection("services").doc();
    batch.set(sRef, { ...s, createdAt: Date.now() });
  });

  preset.automations.forEach(a => {
    const aRef = nicheRef.collection("automations").doc();
    batch.set(aRef, { ...a, createdAt: Date.now() });
  });

  preset.templates.forEach(t => {
    const tRef = nicheRef.collection("templates").doc();
    batch.set(tRef, { ...t, createdAt: Date.now() });
  });

  // 3. Write migration history log
  const migrationRef = adminDb.collection("companies").doc(companyId).collection("nicheMigrations").doc();
  batch.set(migrationRef, {
    fromNiche: "migrated_or_first",
    toNiche: nicheId,
    timestamp: Date.now(),
    productsCreated: preset.products.length,
    servicesCreated: preset.services.length,
    automationsCreated: preset.automations.length,
    templatesCreated: preset.templates.length,
  });

  await batch.commit();
  console.log(`[Provisioning] Custom niche-scoped data applied successfully for company ${companyId}.`);
  return {
    success: true,
    nicheId,
    productsCreated: preset.products.length,
    servicesCreated: preset.services.length,
    automationsCreated: preset.automations.length,
    templatesCreated: preset.templates.length,
  };
}
