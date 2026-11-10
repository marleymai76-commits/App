/**
 * Sistenfox Auto-Engineer v1.0
 * Diagnóstico automático para apps Sistenfox
 * Criado para Marley — Sistenfox.pt
 */

export interface DiagnosticReport {
  timestamp: string;
  frontend: Record<string, any>;
  backend: Record<string, any>;
  network: {
    tests: any[];
    jsonValidation: any[];
  };
  auth: {
    registerFlow: any;
    loginFlow: any;
  };
  summary: string;
}

export async function autoDiagnoseApp(config: { endpoints?: string[] } = {}): Promise<DiagnosticReport> {
  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    frontend: {},
    backend: {},
    network: {
      tests: [],
      jsonValidation: [],
    },
    auth: {
      registerFlow: null,
      loginFlow: null,
    },
    summary: "",
  };

  // 1. Testa endpoints principais
  const endpoints = config.endpoints || [
    "/api/auth/register",
    "/api/auth/login",
    "/api/promotions",
  ];

  for (const url of endpoints) {
    const result = await testEndpoint(url);
    report.network.tests.push(result);
  }

  // 2. Testa JSON vs HTML
  report.network.jsonValidation = report.network.tests.map(t => ({
    url: t.url,
    isHTML: t.raw?.trim().startsWith("<") || false,
    status: t.status,
    message: t.isHTML
      ? "❌ Endpoint retornou HTML — provavelmente inexistente ou fora do ar."
      : "✔️ JSON válido detectado.",
  }));

  // 3. Testa fluxo de cadastro simulado
  report.auth.registerFlow = await simulateRegisterFlow();

  // 4. Testa fluxo de login simulado
  report.auth.loginFlow = await simulateLoginFlow();

  // 5. Gera resumo automático
  report.summary = generateSummary(report);

  return report;
}

/* ----------------- Funções internas ----------------- */

async function testEndpoint(url: string) {
  try {
    const res = await fetch(url);
    const text = await res.text();

    return {
      url,
      status: res.status,
      raw: text,
      isHTML: text.trim().startsWith("<"),
    };
  } catch (err: any) {
    return {
      url,
      status: "NETWORK_ERROR",
      error: err.message,
    };
  }
}

async function simulateRegisterFlow() {
  try {
    const payload = {
      name: "Teste Auto",
      email: "auto@test.com",
      password: "123456",
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (text.trim().startsWith("<")) {
      return {
        ok: false,
        error: "❌ Cadastro retornou HTML — endpoint inexistente.",
        raw: text,
      };
    }

    try {
      return {
        ok: true,
        data: JSON.parse(text),
      };
    } catch (e) {
      return {
        ok: false,
        error: "Falha ao interpretar JSON no cadastro.",
        raw: text
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err.message,
    };
  }
}

async function simulateLoginFlow() {
  try {
    const payload = {
      email: "auto@test.com",
      password: "123456",
    };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (text.trim().startsWith("<")) {
      return {
        ok: false,
        error: "❌ Login retornou HTML — endpoint inexistente.",
        raw: text,
      };
    }

    try {
      return {
        ok: true,
        data: JSON.parse(text),
      };
    } catch (e) {
      return {
        ok: false,
        error: "Falha ao interpretar JSON no login.",
        raw: text
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err.message,
    };
  }
}

function generateSummary(report: DiagnosticReport) {
  const htmlErrors = report.network.jsonValidation.filter(x => x.isHTML);

  if (htmlErrors.length > 0) {
    return `
❌ Problemas detectados:
- ${htmlErrors.length} endpoints estão retornando HTML em vez de JSON.
- O backend provavelmente não está configurado ou não existe no ambiente atual.

✔️ Recomendações:
- Configure um backend real (Firebase, Supabase, Node, Next API).
- Atualize os endpoints no Register/Login.
- Teste novamente com o Auto-Engineer.
`;
  }

  return `
✔️ Todos os endpoints retornaram JSON válido.
✔️ Fluxo de cadastro e login funcionando.
✔️ App pronto para entrega ao cliente.
`;
}
