export interface TrialStatus {
  ativo: boolean;
  diasRestantes: number;
  diasUsados: number;
  planoAtual: 'enterprise_fiscal' | 'starter';
  planoNome: string;
  isTrialExpired: boolean;
}

export function sfx_getTrial(): { inicioTrial: string; planoOriginal?: string } | null {
  const trialStr = localStorage.getItem("sfx_trial");
  if (!trialStr) return null;
  try {
    return JSON.parse(trialStr);
  } catch (e) {
    return null;
  }
}

export function sfx_createTrial(): { inicioTrial: string; planoOriginal: string } {
  const inicio = new Date().toISOString();
  const trial = { inicioTrial: inicio, planoOriginal: "enterprise_fiscal" };
  localStorage.setItem("sfx_trial", JSON.stringify(trial));
  return trial;
}

export function sfx_checkTrial(): TrialStatus {
  let trial = sfx_getTrial();

  if (!trial) {
    trial = sfx_createTrial();
  }

  const hoje = new Date();
  const inicio = new Date(trial.inicioTrial);
  const diffDias = Math.floor((hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

  const diasRestantes = 30 - diffDias;
  const ativo = diasRestantes > 0;

  return {
    ativo,
    diasRestantes: diasRestantes < 0 ? 0 : diasRestantes,
    diasUsados: Math.max(0, diffDias),
    // Durante os 30 dias: libera o plano maior (enterprise_fiscal)
    // Após os 30 dias: volta automaticamente para o plano gratuito (starter)
    planoAtual: ativo ? 'enterprise_fiscal' : 'starter',
    planoNome: ativo ? 'Enterprise Fiscal (Teste 30 Dias - Plano Maior)' : 'Starter (Plano Gratuito)',
    isTrialExpired: !ativo
  };
}

// Simula expirar o teste para testar a volta ao plano gratuito
export function sfx_expireTrialForTesting(): void {
  const trintaEUmDiasAtras = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
  localStorage.setItem("sfx_trial", JSON.stringify({ inicioTrial: trintaEUmDiasAtras, planoOriginal: "enterprise_fiscal" }));
  window.dispatchEvent(new Event('sfx_trial_updated'));
}

// Reseta o trial para começar novos 30 dias
export function sfx_resetTrial(): void {
  const hoje = new Date().toISOString();
  localStorage.setItem("sfx_trial", JSON.stringify({ inicioTrial: hoje, planoOriginal: "enterprise_fiscal" }));
  window.dispatchEvent(new Event('sfx_trial_updated'));
}

// Retorna o plano efetivo do usuário considerando o teste ou plano contratado
export function sfx_getUserEffectivePlan(user?: { plan?: string; master_unlimited?: boolean; type?: string; role?: string } | null): string {
  if (user?.master_unlimited || user?.type === 'superadmin' || user?.role === 'super_admin') {
    return 'enterprise_fiscal';
  }
  if (user?.plan && user.plan !== 'trial' && user.plan !== 'starter') {
    return user.plan;
  }
  const status = sfx_checkTrial();
  return status.planoAtual;
}

