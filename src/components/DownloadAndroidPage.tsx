import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Database, 
  Layers, 
  Receipt, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  HelpCircle,
  FileCheck,
  RefreshCw,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { sfx_checkTrial, sfx_getUserEffectivePlan } from '../lib/trial';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function DownloadAndroidPage() {
  const { canInstall, isInstalled, isAndroid, promptInstall } = usePWAInstall();
  const { isOnline } = useOnlineStatus();
  const { user } = useAuth();
  
  const [selectedPlanTab, setSelectedPlanTab] = useState<'starter' | 'pocketPro' | 'business' | 'enterprise' | 'enterpriseFiscal'>('enterpriseFiscal');
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [offlineOrdersCount, setOfflineOrdersCount] = useState(3);
  const [installStep, setInstallStep] = useState<number | null>(null);

  const trialStatus = sfx_checkTrial();
  const effectivePlan = sfx_getUserEffectivePlan(user as any);

  // Auto select user's current effective plan on load
  useEffect(() => {
    if (effectivePlan === 'starter') setSelectedPlanTab('starter');
    else if (effectivePlan === 'pocket') setSelectedPlanTab('pocketPro');
    else if (effectivePlan === 'business') setSelectedPlanTab('business');
    else if (effectivePlan === 'enterprise') setSelectedPlanTab('enterprise');
    else setSelectedPlanTab('enterpriseFiscal');
  }, [effectivePlan]);

  const handleInstallClick = async () => {
    if (canInstall) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        toast.success('Instalação iniciada! O app estará na sua tela inicial em instantes.');
      } else {
        toast.info('Instalação cancelada. Você pode tentar novamente a qualquer momento.');
      }
    } else {
      // Scroll to Chrome step-by-step instructions
      const element = document.getElementById('passo-a-passo');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        toast.info('Abra o menu (⋮) do Chrome no Android e selecione "Instalar aplicativo".');
      }
    }
  };

  const handleSimulateOfflineOrder = () => {
    setOfflineOrdersCount(prev => prev + 1);
    toast.success('Pedido registrado no banco local do Android! Fila offline atualizada.');
  };

  const offlineFeaturesByPlan = {
    starter: {
      name: "Starter (Plano Gratuito)",
      price: "R$ 0,00",
      period: "Sempre Grátis",
      badge: "Gratuito",
      badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
      description: "Recursos essenciais para o seu negócio não parar mesmo sem internet.",
      capabilities: [
        { label: "Cardápio Digital Offline", desc: "Acesse e exiba até 20 produtos cadastrados direto no Android sem sinal.", included: true },
        { label: "Registro Local de Pedidos", desc: "Lance até 20 pedidos/mês salvos no armazenamento local do celular.", included: true },
        { label: "Sincronização na Reconexão", desc: "Ao voltar à internet, seus dados locais sincronizam com a nuvem.", included: true },
        { label: "1 Operador no Dispositivo", desc: "Ideal para operações individuais ou pontos de atendimento simples.", included: true },
        { label: "Gestão de Mesas e Comandas", desc: "Requer plano Business ou superior para uso offline.", included: false },
        { label: "Controle de Estoque Offline", desc: "Requer plano Enterprise ou superior.", included: false },
        { label: "Emissão Fiscal em Contingência", desc: "Requer plano Enterprise Fiscal.", included: false },
      ]
    },
    pocketPro: {
      name: "Pocket Pro",
      price: "R$ 20,70",
      period: "/mês (70% OFF por 2 anos)",
      badge: "Mais Econômico",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      description: "Ideal para pequenos comércios que precisam de cardápio e comandas ilimitadas sem internet.",
      capabilities: [
        { label: "Cardápio Digital Ilimitado", desc: "Todos os produtos, fotos e categorias disponíveis offline sem limite.", included: true },
        { label: "Controle Ilimitado de Pedidos", desc: "Lance quantos pedidos precisar, mesmo no meio de quedas de rede.", included: true },
        { label: "Armazenamento Local Contínuo", desc: "Guarda todo o histórico recente na memória do seu Android.", included: true },
        { label: "Atualização Automática na Conexão", desc: "Sincroniza estoques e status de pedidos sem intervenção manual.", included: true },
        { label: "Gestão de Mesas e Reservas", desc: "Requer plano Business ou superior.", included: false },
        { label: "Controle de Estoque Avançado", desc: "Requer plano Enterprise ou superior.", included: false },
        { label: "Emissão Fiscal em Contingência", desc: "Requer plano Enterprise Fiscal.", included: false },
      ]
    },
    business: {
      name: "Business",
      price: "R$ 29,70",
      period: "/mês (70% OFF por 2 anos)",
      badge: "Mais Popular",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      description: "Gestão completa de salão, mesas e comandas para restaurantes, salões e clínicas sem internet.",
      capabilities: [
        { label: "Tudo do Pocket Pro Offline", desc: "Cardápio ilimitado e registro contínuo de comandas.", included: true },
        { label: "Mesas e Comandas em Cache Local", desc: "Abra, transfira e feche mesas diretamente no Android sem conexão.", included: true },
        { label: "Fila de Reservas & Agendamentos", desc: "Consulte agendamentos e horários salvos offline no aparelho.", included: true },
        { label: "Modo Garçom em Contingência", desc: "Garçons anotam pedidos no salão mesmo em pontos cegos de Wi-Fi.", included: true },
        { label: "Notificações Locais no Android", desc: "Alertas visuais de novos pedidos prontos direto no celular.", included: true },
        { label: "Baixa Automática de Insumos", desc: "Requer plano Enterprise.", included: false },
        { label: "Módulo Fiscal Offline", desc: "Requer plano Enterprise Fiscal.", included: false },
      ]
    },
    enterprise: {
      name: "Enterprise",
      price: "R$ 44,70",
      period: "/mês (70% OFF por 2 anos)",
      badge: "Alta Performance",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      description: "Operação robusta com estoque e relatórios financeiros salvos localmente.",
      capabilities: [
        { label: "Tudo do Business Offline", desc: "Mesas, garçom, reservas e comandas totalmente operacionais sem rede.", included: true },
        { label: "Baixa de Estoque em Contingência", desc: "Desconto automático de ingredientes e insumos na memória local.", included: true },
        { label: "Relatórios & Fechamentos Diários", desc: "Consulte faturamento, tíquete médio e totais sem precisar de Wi-Fi.", included: true },
        { label: "Múltiplos Dispositivos Android", desc: "Suporta diversos tablets e smartphones da equipe em contingência.", included: true },
        { label: "Fila de Transmissão de Alta Prioridade", desc: "Sincronização veloz e segura assim que a rede se restabelecer.", included: true },
        { label: "Emissão de NFC-e / NF-e em Contingência", desc: "Requer plano Enterprise Fiscal.", included: false },
      ]
    },
    enterpriseFiscal: {
      name: "Enterprise Fiscal",
      price: "R$ 59,70",
      period: "/mês (70% OFF por 2 anos)",
      badge: "Completo & Fiscal",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      description: "A solução definitiva com contingência fiscal offline para segurança tributária total.",
      capabilities: [
        { label: "Tudo do Enterprise Offline", desc: "Estoque, relatórios, mesas e comandas 100% autônomos sem internet.", included: true },
        { label: "Contingência Fiscal Offline", desc: "Gera notas e cupons fiscais no Android mesmo sem sinal de internet.", included: true },
        { label: "Transmissão Automática à SEFAZ", desc: "Ao reconectar, o app envia o lote de notas fiscais automaticamente.", included: true },
        { label: "Fechamento de Caixa Criptografado", desc: "Auditoria local e recibos salvos em IndexedDB com segurança máxima.", included: true },
        { label: "30 Dias de Teste Gratuito", desc: "Experimente este plano no seu Android com todas as funções liberadas.", included: true },
        { label: "Backup Local e Exportação Direta", desc: "Exporte relatórios em PDF/CSV diretamente da memória do Android.", included: true },
      ]
    }
  };

  const currentPlanDetails = offlineFeaturesByPlan[selectedPlanTab];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Breadcrumb / Top Link */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            ← Voltar ao Início
          </Link>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline && !simulatedOffline ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-xs font-medium text-zinc-300">
              {isOnline && !simulatedOffline ? 'Status: Conectado (Online)' : 'Status: Operando Offline no Android'}
            </span>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/5">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>SISTENFOX para Android • 100% Offline</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-white tracking-tight leading-tight">
            Baixe o App no seu Android e Use <span className="text-amber-400 underline decoration-amber-500/40">100% Offline</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed">
            Seu negócio não pode parar por falta de sinal ou internet lenta. Instale o aplicativo nativo PWA no seu smartphone ou tablet Android e continue registrando pedidos, mesas e comandas de acordo com a sua assinatura.
          </p>

          {/* User's Current Subscription Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-xs backdrop-blur-md">
            <span className="text-zinc-400">Sua assinatura atual:</span>
            <span className="font-bold text-amber-300 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              {trialStatus.ativo 
                ? `Enterprise Fiscal (Teste 30 Dias Ativo • ${trialStatus.diasRestantes} dias restantes)` 
                : effectivePlan === 'starter' 
                  ? 'Plano Gratuito (Starter)' 
                  : `Plano ${effectivePlan.toUpperCase()}`}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Recursos Offline Liberados
            </span>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-base rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-all active:scale-95 group"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              {isInstalled 
                ? 'Aplicativo Já Instalado no Android' 
                : canInstall 
                  ? 'Instalar Aplicativo no Android (1 Clique)' 
                  : 'Instalar no Android (Ver Guia)'}
            </button>

            <a
              href="#recursos-assinatura"
              className="w-full sm:w-auto px-6 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Ver Recursos por Assinatura
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </a>
          </div>

          {/* Android Compatibility & Security Notes */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> Compatível com Android 8.0 até Android 15+
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" /> Armazenamento Seguro no Aparelho
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Sem necessidade de Play Store
            </span>
          </div>
        </div>

        {/* DEVICE STATUS & LIVE TEST CARD */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                Diagnóstico de Execução Local
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Pronto para Operação sem Conexão no seu Aparelho
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                O SISTENFOX utiliza Service Worker v3 e banco de dados IndexedDB multi-tab criptografado localmente.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setSimulatedOffline(!simulatedOffline)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  simulatedOffline 
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                {simulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                {simulatedOffline ? 'Simulando Modo Offline (Ativo)' : 'Testar Modo Offline Agora'}
              </button>

              {simulatedOffline && (
                <button
                  onClick={handleSimulateOfflineOrder}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Lançar Pedido Offline (+1)
                </button>
              )}
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">Rede</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isOnline && !simulatedOffline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                <span className="text-sm font-bold text-white">
                  {isOnline && !simulatedOffline ? 'Online' : 'Offline (Local)'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Cache persistente ativo</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">Dispositivo</span>
              <div className="flex items-center gap-1.5 mt-1 text-sm font-bold text-white">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>{isAndroid ? 'Android Detectado' : 'Pronto para Android'}</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">PWA Standalone habilitado</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">Fila Local</span>
              <div className="flex items-center gap-1.5 mt-1 text-sm font-bold text-amber-300">
                <Database className="w-4 h-4 text-amber-400" />
                <span>{offlineOrdersCount} itens em espera</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">Sincroniza automaticamente</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">Segurança</span>
              <div className="flex items-center gap-1.5 mt-1 text-sm font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Criptografado</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">IndexedDB isolado</span>
            </div>
          </div>
        </div>

        {/* SECTION: OFFLINE CAPABILITIES BY SUBSCRIPTION */}
        <div id="recursos-assinatura" className="space-y-8 scroll-mt-28">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Funcionalidades por Assinatura
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              O que cada plano pode fazer Offline no Android
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
              Mesmo quando a conexão com a internet cair, o seu aplicativo continuará funcionando de acordo com as permissões do seu plano contratado:
            </p>
          </div>

          {/* Plan Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl max-w-3xl mx-auto">
            {(['starter', 'pocketPro', 'business', 'enterprise', 'enterpriseFiscal'] as const).map(planKey => {
              const plan = offlineFeaturesByPlan[planKey];
              const isSelected = selectedPlanTab === planKey;
              return (
                <button
                  key={planKey}
                  onClick={() => setSelectedPlanTab(planKey)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span>{plan.name.split(' ')[0]}</span>
                  {planKey === 'enterpriseFiscal' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-300'}`}>
                      30d Grátis
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Plan Details Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-800">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${currentPlanDetails.badgeColor}`}>
                    {currentPlanDetails.badge}
                  </span>
                  {selectedPlanTab === 'enterpriseFiscal' && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Liberado nos primeiros 30 dias de teste
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  {currentPlanDetails.name}
                </h3>
                <p className="text-zinc-400 text-sm max-w-xl">
                  {currentPlanDetails.description}
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">
                  {currentPlanDetails.price}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {currentPlanDetails.period}
                </div>
                <Link
                  to="/pagamento"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  Contratar com 70% de desconto <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Capabilities List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
              {currentPlanDetails.capabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    cap.included 
                      ? 'bg-zinc-900/60 border-zinc-800 hover:border-amber-500/30' 
                      : 'bg-zinc-950/40 border-zinc-900 opacity-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mt-0.5 flex-shrink-0 ${
                    cap.included 
                      ? 'bg-amber-400/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {cap.included ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${cap.included ? 'text-white' : 'text-zinc-500 line-through'}`}>
                      {cap.label}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trial Rule Reminder */}
            <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-300 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Como funciona o período de teste e a volta ao plano gratuito:</strong>
                <p className="text-zinc-400 mt-1 leading-relaxed">
                  Toda nova conta ganha <strong>30 dias gratuitos de teste</strong> com o plano maior (<strong>Enterprise Fiscal</strong>) totalmente liberado no Android offline. Após os 30 dias, caso não assine, a conta retorna automaticamente ao <strong>Plano Gratuito (Starter)</strong>, mantendo o app ativo no celular para lançamento de até 20 pedidos e cardápio essencial offline.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: STEP-BY-STEP ANDROID INSTALLATION GUIDE */}
        <div id="passo-a-passo" className="space-y-8 scroll-mt-28">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Instalação Simples & Direta
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Como instalar no seu celular ou tablet Android
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Você não precisa baixar arquivos pesados nem usar a Google Play Store. Siga estes 3 passos rápidos:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black font-extrabold flex items-center justify-center text-lg mb-4 shadow-lg shadow-amber-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-white mb-2">Abra no Google Chrome</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Acesse o endereço do SISTENFOX no navegador Google Chrome do seu celular Android.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Navegador Chrome ou Samsung Internet</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black font-extrabold flex items-center justify-center text-lg mb-4 shadow-lg shadow-amber-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-white mb-2">Toque no Menu (⋮)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Toque nos três pontinhos no canto superior direito da tela e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Opção: "Instalar Aplicativo"</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-black font-extrabold flex items-center justify-center text-lg mb-4 shadow-lg shadow-emerald-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-white mb-2">Pronto! Use 100% Offline</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                O ícone do SISTENFOX estará na sua gaveta de aplicativos. Ele abre em tela cheia como um app nativo e funciona mesmo em modo avião.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-2">
                <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
                <span>Funciona sem sinal ou internet</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button within section */}
          <div className="text-center pt-4">
            <button
              onClick={handleInstallClick}
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2.5"
            >
              <Download className="w-4 h-4" />
              {canInstall ? 'Disparar Instalação Agora' : 'Instalar no Meu Android'}
            </button>
          </div>
        </div>

        {/* SECTION: FAQ OFFLINE ANDROID */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-2xl font-serif font-bold text-white">
              Perguntas Frequentes sobre o App Offline
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Tudo o que você precisa saber sobre o funcionamento sem internet no Android
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-400" />
                O app realmente abre se meu celular estiver sem internet?
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sim! Graças ao Service Worker e à tecnologia PWA, todo o código do aplicativo fica instalado na memória do seu Android. Você pode abrir o app em modo avião ou sem chip e ele abrirá instantaneamente em tela cheia.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                O que acontece com os pedidos e mesas registrados offline?
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Eles são gravados no banco de dados local do seu aparelho (IndexedDB). Assim que o celular detectar sinal de Wi-Fi ou 4G/5G, todos os pedidos e alterações são sincronizados com a nuvem automaticamente.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                Como funciona a emissão fiscal offline no plano Enterprise Fiscal?
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No plano Enterprise Fiscal, o sistema gera notas em contingência offline com numeração sequencial segura e armazena os lotes no celular. Ao reconectar, a transmissão para os servidores da SEFAZ é realizada sem perda de dados.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                E se meu período de 30 dias acabar?
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Se você não assinar após os 30 dias, sua conta volta automaticamente ao Plano Gratuito (Starter). O aplicativo continua funcionando normalmente no seu Android, permitindo até 20 produtos e 20 pedidos/mês offline.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
