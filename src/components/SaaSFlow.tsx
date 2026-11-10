import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, CreditCard, Layout, Store, ArrowRight, Loader2, Smartphone, Globe, ShieldCheck, ChevronLeft, Sparkles, Zap, AlertTriangle, LogIn, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore, useThemeStore, useNicheStore, NicheType } from '../lib/store';
import { api } from '../services/api';
import { sanitizeInput } from '../lib/utils';
import { generateSistenfoxLogo } from '../lib/logoGenerator';
import { Image as ImageIcon, Wand2 } from 'lucide-react';
import { sfx_createTrial } from '../lib/trial';
import { auth, db } from '../lib/firebaseClient';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { User, onAuthStateChanged } from 'firebase/auth';

interface SaaSFlowProps {
  onComplete: (appId: string, establishmentId: string) => void;
}

export default function SaaSFlow({ onComplete }: SaaSFlowProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [establishmentName, setEstablishmentName] = useState('');
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [generatingLogo, setGeneratingLogo] = useState(false);

  // Estado de autenticação e feedback visual de sessão
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [provisioningStatus, setProvisioningStatus] = useState<'idle' | 'syncing' | 'completed' | 'local_only'>('idle');
  const [sessionFeedbackNotice, setSessionFeedbackNotice] = useState<string | null>(null);

  const { login } = useAuthStore();
  const { setAccent } = useThemeStore();
  const { setNiche } = useNicheStore();

  // Monitora alterações de sessão em tempo real
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setSessionExpired(true);
      } else {
        setSessionExpired(false);
        setSessionFeedbackNotice(null);
      }
    });

    // 1. Tenta carregar dados dinâmicos do Firestore com fallback resiliente
    let isMounted = true;
    async function checkPublicCatalog() {
      try {
        const segSnap = await getDocs(collection(db, 'segments'));
        if (!segSnap.empty && isMounted) {
          console.log(`[SaaS Onboarding] ${segSnap.size} segmentos carregados do catálogo público.`);
        }
      } catch (err: any) {
        console.warn("[SaaS Onboarding] Catálogo público acessado com fallback local:", err?.message || err);
      }
    }
    checkPublicCatalog();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (step === 5) {
      setProvisioningStatus('syncing');

      // 1. Ativa imediatamente o teste de 30 dias com o plano maior no dispositivo
      sfx_createTrial();
      
      // 2. Registra o nicho selecionado e informações da empresa
      if (selectedApp) {
        setNiche(selectedApp as NicheType);
        localStorage.setItem('sfx_active_niche', selectedApp);
      }
      if (establishmentName) {
        localStorage.setItem('sfx_establishment_name', establishmentName);
      }
      if (generatedLogo) {
        localStorage.setItem('sfx_custom_logo', generatedLogo);
      }

      const tenantId = auth.currentUser ? auth.currentUser.uid : (localStorage.getItem('sfx_tenant_id') || `tenant_${Date.now()}`);
      localStorage.setItem('sfx_tenant_id', tenantId);

      // 3. Atualiza conta de usuário e tenant no Firestore com permissões de administrador
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          const tenantDocRef = doc(db, 'tenants', tenantId);

          Promise.all([
            setDoc(userDocRef, {
              uid: auth.currentUser.uid,
              role: 'admin',
              type: 'companyOwner',
              plan: 'enterprise_fiscal',
              trialActive: true,
              activeNiche: selectedApp || 'restaurante',
              businessName: establishmentName || 'Novo Estabelecimento',
              updatedAt: Date.now()
            }, { merge: true }),
            setDoc(tenantDocRef, {
              id: tenantId,
              name: establishmentName || 'Novo Estabelecimento',
              segment: selectedApp || 'restaurante',
              plan: 'enterprise_fiscal',
              trialActive: true,
              ownerId: auth.currentUser.uid,
              updatedAt: Date.now()
            }, { merge: true })
          ])
          .then(() => {
            setProvisioningStatus('completed');
            setSessionFeedbackNotice(null);
          })
          .catch((err) => {
            console.warn('[SaaS Onboarding] Sincronização na nuvem indisponível ou permissão pendente. O app continuará com o teste de 30 dias local:', err);
            setProvisioningStatus('local_only');
            setSessionFeedbackNotice('Sua configuração foi ativada com sucesso no navegador! O teste de 30 dias com o Plano Maior já está operante.');
          });
        } catch (error) {
          setProvisioningStatus('local_only');
          setSessionFeedbackNotice('Configuração ativada localmente com sucesso.');
        }
      } else {
        // Usuário não autenticado ou sessão expirada
        setProvisioningStatus('local_only');
        setSessionExpired(true);
        setSessionFeedbackNotice('Sua sessão expirou ou você ainda não está conectado. O teste de 30 dias com o Plano Maior foi ativado no navegador. Você pode entrar no painel ou fazer login a qualquer momento.');
      }

      const timer = setTimeout(() => {
        setStep(6);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [step, selectedApp, establishmentName, generatedLogo, setNiche]);

  useEffect(() => {
    if (step === 6) {
      const timer = setTimeout(() => {
        onComplete(selectedApp || 'restaurante', establishmentName || 'New Store');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step, selectedApp, establishmentName, onComplete]);

  const apps = [
    { id: 'restaurante', name: 'Restaurantes', icon: <Smartphone className="text-orange-500" />, description: 'D-GUST-AI: Gestão completa de mesas, cozinha e delivery.' },
    { id: 'beleza', name: 'Beleza & Estética', icon: <Globe className="text-pink-500" />, description: 'Agendamentos, profissionais e serviços.' },
    { id: 'varejo', name: 'Lojas & Varejo', icon: <ShieldCheck className="text-blue-500" />, description: 'Controle de estoque, vendas e PDV.' },
    { id: 'clinica', name: 'Clínicas & Saúde', icon: <Smartphone className="text-teal-500" />, description: 'Prontuários, agenda e pacientes.' },
  ];

  const plans = [
    { 
      id: 'pocketPro', 
      name: 'Pocket Pro', 
      priceOriginal: 'R$ 69,00',
      price: 'R$ 20,70', 
      period: '/ mês por 2 anos', 
      description: 'Dashboard, controle de pedidos e cardápio digital com 70% OFF garantido.',
      discount: '70% OFF'
    },
    { 
      id: 'business', 
      name: 'Business', 
      priceOriginal: 'R$ 99,00',
      price: 'R$ 29,70', 
      period: '/ mês por 2 anos', 
      description: 'Mais Vendido. Reservas online, push e gestão avançada para o seu negócio.', 
      featured: true,
      discount: '70% OFF • MAIS VENDIDO'
    },
    { 
      id: 'enterprise', 
      name: 'Enterprise', 
      priceOriginal: 'R$ 149,00',
      price: 'R$ 44,70', 
      period: '/ mês por 2 anos', 
      description: 'Alta performance, relatórios financeiros detalhados e controle de estoque avançado.', 
      discount: '70% OFF'
    },
    { 
      id: 'enterpriseFiscal', 
      name: 'Enterprise Fiscal', 
      priceOriginal: 'R$ 199,00',
      price: 'R$ 59,70', 
      period: '/ mês por 2 anos', 
      description: 'Plano Máximo. Sistema fiscal completo, PDV e pagamentos online integrados.', 
      discount: '70% OFF • COMPLETO'
    },
  ];

  const handleStartPayment = async () => {
    setLoading(true);
    setStep(5);

    try {
      const email = auth.currentUser?.email || 'cliente@sistenfox.pt';
      const planNames: Record<string, string> = {
        pocketPro: 'Plano Pocket Pro',
        business: 'Plano Business',
        enterprise: 'Plano Enterprise',
        enterpriseFiscal: 'Plano Enterprise Fiscal'
      };
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          planName: planNames[selectedPlan || 'business'] || 'Plano Business',
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao iniciar pagamento.');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Erro ao conectar com o provedor de pagamento.');
      setLoading(false);
      setStep(3); // Go back to the form
    }
  };

  const handleGenerateLogo = async () => {
    if (!establishmentName) {
      toast.error('Por favor, insira o nome do estabelecimento primeiro.');
      return;
    }
    setGeneratingLogo(true);
    try {
      const logo = await generateSistenfoxLogo(establishmentName, selectedApp || 'SaaS');
      if (logo) {
        setGeneratedLogo(logo);
        toast.success('Logo gerado com sucesso!');
      } else {
        throw new Error('Falha ao gerar logo.');
      }
    } catch (error) {
      console.error('Logo generation error:', error);
      toast.error('Erro ao gerar logo. Tente novamente.');
    } finally {
      setGeneratingLogo(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4 relative overflow-hidden">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-gold opacity-70 hover:opacity-100 transition-opacity z-50">
        <ChevronLeft size={16} />
        Voltar
      </Link>

      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold mb-3 uppercase tracking-widest border border-gold/20"
          >
            SISTENFOX PREMIUM SAAS
          </motion.div>
          <h1 className="text-4xl font-serif font-bold gold-text-gradient mb-2">Escolha seu Segmento</h1>
          <p className="text-sm opacity-40 font-medium mb-3">Selecione o nicho de atuação para sua nova plataforma SISTENFOX.</p>
          
          {/* Status visual de autenticação e feedback amigável */}
          <div className="flex justify-center">
            {currentUser ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                <CheckCircle size={13} />
                <span>Conta conectada: <strong>{currentUser.email}</strong> (Admin)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-medium border border-amber-500/20">
                <Info size={13} className="text-amber-400 shrink-0" />
                <span>Teste gratuito de 30 dias com Plano Maior ativo localmente</span>
                <span className="opacity-40">•</span>
                <Link to="/login" className="underline hover:text-white font-semibold">
                  Fazer login
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-12 max-w-lg mx-auto relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gold/10 -translate-y-1/2 z-0" />
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-500 border",
                step >= s 
                  ? "gold-gradient text-premium-black border-transparent scale-110 shadow-lg shadow-gold/20" 
                  : "bg-app border-gold/10 text-gold/30"
              )}
            >
              {step > s ? <CheckCircle size={16} /> : s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app.id);
                    setStep(2);
                  }}
                  className={cn(
                    "premium-card p-6 text-left transition-all hover:scale-[1.02] group",
                    selectedApp === app.id ? "border-gold ring-1 ring-gold/20" : "hover:border-gold/30"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                    {app.icon}
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-1 gold-text-gradient">{app.name}</h3>
                  <p className="text-xs opacity-40 leading-relaxed">{app.description}</p>
                </button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setStep(3);
                  }}
                  className={cn(
                    "premium-card p-8 text-center transition-all hover:scale-[1.02] group relative",
                    selectedPlan === plan.id ? "border-gold ring-1 ring-gold/20" : "hover:border-gold/30"
                  )}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-premium-black text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Recomendado
                    </div>
                  )}
                  <h3 className="text-lg font-serif font-bold mb-1 gold-text-gradient">{plan.name}</h3>
                  {plan.priceOriginal && (
                    <div className="text-[11px] text-zinc-500 line-through mb-0.5">
                      De {plan.priceOriginal}
                    </div>
                  )}
                  <div className="mb-3">
                    <span className="text-3xl font-serif font-bold text-gold">{plan.price}</span>
                    <span className="text-xs opacity-60 block mt-0.5">{plan.period}</span>
                  </div>
                  <p className="text-xs opacity-60 leading-relaxed">{plan.description}</p>
                </button>
              ))}
              <button
                onClick={() => setStep(1)}
                className="col-span-full mt-4 py-2 text-gold/40 hover:text-gold text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Voltar para seleção de nicho
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto premium-card p-8"
            >
              <div className="mb-8">
                <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3 ml-1">Nome do Estabelecimento</label>
                <div className="relative group">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-gold transition-all" size={20} />
                  <input
                    type="text"
                    value={establishmentName}
                    onChange={(e) => setEstablishmentName(e.target.value)}
                    placeholder="Ex: Restaurante Gourmet"
                    className="w-full bg-app border border-gold/10 rounded-xl py-4 pl-12 pr-4 focus:border-gold/50 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!establishmentName) {
                    toast.error('Por favor, insira o nome do estabelecimento.');
                    return;
                  }
                  setStep(4);
                }}
                className="w-full gold-gradient text-premium-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-gold/10"
              >
                Próximo Passo
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 py-2 text-gold/40 hover:text-gold text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Voltar para planos
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto premium-card p-8 text-center"
            >
              <div className="mb-8">
                <h3 className="text-xl font-serif font-bold gold-text-gradient mb-2">Identidade Visual</h3>
                <p className="text-xs opacity-40 mb-6">Gere um logo exclusivo para sua marca usando nossa IA premium.</p>
                
                <div className="aspect-square w-full max-w-[200px] mx-auto bg-gold/5 rounded-2xl border border-gold/10 flex items-center justify-center relative overflow-hidden group mb-6">
                  {generatedLogo ? (
                    <img src={generatedLogo} alt="Logo Gerado" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                      <ImageIcon size={48} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Sua Logo Aqui</span>
                    </div>
                  )}
                  
                  {generatingLogo && (
                    <div className="absolute inset-0 bg-premium-black/60 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="text-gold animate-spin" size={32} />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGenerateLogo}
                  disabled={generatingLogo}
                  className="w-full bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
                >
                  <Wand2 size={18} />
                  {generatedLogo ? 'Gerar Outra Opção' : 'Gerar Logo com IA'}
                </button>
              </div>

              <button
                onClick={() => setStep(5)}
                className="w-full gold-gradient text-premium-black font-extrabold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-gold/10"
              >
                Continuar para Ativação do App
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => setStep(3)}
                className="w-full mt-4 py-2 text-gold/40 hover:text-gold text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Voltar para nome
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center premium-card p-8 md:p-10 border border-gold/30 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-cyan-400 animate-pulse" size={32} />
              </div>
              <h2 className="text-2xl font-serif font-bold gold-text-gradient mb-2">Ativando seu Aplicativo</h2>
              <p className="text-xs text-zinc-400 mb-6">
                Liberando sua conta no <strong>Plano Maior (Enterprise Fiscal)</strong> com 30 dias de teste gratuito e permissões completas de Administrador.
              </p>

              {sessionFeedbackNotice && (
                <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left flex items-start gap-3 text-xs text-amber-200">
                  <AlertTriangle size={18} className="shrink-0 text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-amber-300 mb-0.5">Aviso de Sessão</div>
                    <p className="opacity-90">{sessionFeedbackNotice}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3 mb-6 text-left text-xs bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle size={15} className="shrink-0" />
                  <span>Plano Maior (Enterprise Fiscal) liberado por 30 dias</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle size={15} className="shrink-0" />
                  <span>Permissões de Administrador concedidas</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle size={15} className="shrink-0" />
                  <span>Nicho <strong>{selectedApp || 'Restaurante'}</strong> e estabelecimento <strong>{establishmentName || 'Ativo'}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#ffb300] font-bold mb-6 animate-pulse">
                <Loader2 className="animate-spin" size={14} />
                Finalizando provisionamento seguro do app...
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep(6)}
                  className="w-full gold-gradient text-premium-black font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
                >
                  Concluir Inscrição e Abrir App
                  <ArrowRight size={18} />
                </button>

                {sessionExpired && (
                  <Link
                    to="/login"
                    className="w-full block py-2.5 text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-900/60 rounded-xl border border-zinc-800"
                  >
                    Fazer Login para Vincular à Conta
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center premium-card p-8 md:p-10 border border-emerald-500/30 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-serif font-bold gold-text-gradient mb-2">Tudo Pronto!</h2>
              <p className="text-sm text-zinc-300 mb-6">
                Seu acesso ao <strong>{establishmentName || 'seu negócio'}</strong> foi liberado com sucesso com perfil de Administrador.
              </p>
              
              <div className="space-y-3 mb-6 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 text-left text-xs">
                {[
                  'Banco de dados provisionado',
                  'Permissões de administrador configuradas',
                  'Teste gratuito ativo com plano maior (30 dias)',
                  'Desconto de 70% por 2 anos disponível no painel'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 opacity-90 text-zinc-300 font-medium">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onComplete(selectedApp || 'restaurante', establishmentName || 'New Store')}
                className="w-full gold-gradient text-premium-black font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg mb-4 hover:scale-[1.02]"
              >
                Entrar no Painel Agora
                <ArrowRight size={18} />
              </button>

              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Redirecionando automaticamente em 3s...</div>
                <div className="h-1 w-full bg-gold/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3.5 }}
                    className="h-full gold-gradient"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
