import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseClient';
import { VitalicioSorteioCard } from './VitalicioSorteioCard';
import { toast } from 'sonner';
import { 
  Users, 
  Sparkles, 
  Trophy, 
  AlertTriangle, 
  Crown, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import { useAuthStore } from '../lib/store';

interface Participant {
  id: string;
  email: string;
  plano: string;
  joinedAt: number;
}

interface Winner {
  id: string;
  uid: string;
  email: string;
  plano: string;
  sorteadoEm: number;
}

function formatarDataCurta(dataStr?: string | number | null): string {
  if (!dataStr) return '01/07/2027';
  if (typeof dataStr === 'number') {
    return new Date(dataStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  const parts = String(dataStr).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return String(dataStr);
}

interface SorteioConfig {
  total: number;
  sorteados: number;
  ultimoSorteio: number | null;
  inicio?: string;
  ativo?: boolean;
}

export default function SorteioVitalicioPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SorteioConfig>({ total: 10, sorteados: 0, ultimoSorteio: null, inicio: '2027-07-01', ativo: true });
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [userPlan, setUserPlan] = useState<string>('');
    const [isParticipating, setIsParticipating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
  
    const currentUser = auth.currentUser;
  
    // Plan eligibility list
    const eligiblePlans = ["pocketPro", "business", "enterprise", "enterpriseFiscal"];
  
    const fetchData = async () => {
      setLoading(true);
      let loadedFromApi = false;

      // 1. Try server API first
      try {
        const uid = currentUser?.uid || '';
        const res = await fetch(`/api/sorteio/full-data?uid=${encodeURIComponent(uid)}`, {
          headers: uid ? { 'x-user-uid': uid } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            if (data.config) setConfig(data.config);
            if (Array.isArray(data.participants)) setParticipants(data.participants);
            if (Array.isArray(data.winners)) setWinners(data.winners);
            if (typeof data.isParticipating === 'boolean') setIsParticipating(data.isParticipating);
            loadedFromApi = true;
          }
        }
      } catch {
        // Fallback to client Firestore
      }

      // 2. Fetch User Profile & Firestore fallback if needed
      try {
        if (!loadedFromApi) {
          // Get Sorteio Configuration
          const configRef = doc(db, 'appConfig', 'sorteioVitalicio');
          const configSnap = await getDoc(configRef);
          let currentConfig = { 
            total: 10, 
            sorteados: 0, 
            inicio: "2027-07-01", 
            ultimoSorteio: null, 
            ativo: true 
          };
          
          if (configSnap.exists()) {
            currentConfig = { ...currentConfig, ...configSnap.data() };
          }
          setConfig(currentConfig);

          // Fetch Participants
          const participantsSnap = await getDocs(collection(db, 'sorteioParticipantes'));
          const participantsList: Participant[] = [];
          let joined = false;

          participantsSnap.forEach((docSnap) => {
            const data = docSnap.data();
            participantsList.push({
              id: docSnap.id,
              email: data.email || 'N/A',
              plano: data.plano || 'N/A',
              joinedAt: data.joinedAt || Date.now(),
            });
            if (currentUser && docSnap.id === currentUser.uid) {
              joined = true;
            }
          });
          setParticipants(participantsList);
          setIsParticipating(joined);

          // Fetch Winners
          const winnersSnap = await getDocs(collection(db, 'sorteioVencedores'));
          const winnersList: Winner[] = [];
          winnersSnap.forEach((docSnap) => {
            const data = docSnap.data();
            winnersList.push({
              id: docSnap.id,
              uid: data.uid || '',
              email: data.email || '',
              plano: data.plano || '',
              sorteadoEm: data.sorteadoEm || Date.now(),
            });
          });
          winnersList.sort((a, b) => b.sorteadoEm - a.sorteadoEm);
          setWinners(winnersList);
        }

        // Fetch user profile from Firestore or store
        if (currentUser) {
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setUserPlan(userData.plan || 'trial');
              setIsAdmin(userData.role === 'admin' || userData.type === 'superadmin' || userData.master_unlimited === true);
            } else {
              const storeUser = useAuthStore.getState().user;
              if (storeUser) {
                setUserPlan((storeUser as any).plan || 'trial');
                setIsAdmin(storeUser.role === 'admin' || (storeUser as any).type === 'superadmin');
              }
            }
          } catch {
            const storeUser = useAuthStore.getState().user;
            if (storeUser) {
              setUserPlan((storeUser as any).plan || 'trial');
              setIsAdmin(storeUser.role === 'admin');
            }
          }
        }
      } catch (error: any) {
        console.warn('Aviso ao sincronizar dados do sorteio via Firestore:', error?.message || error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Handle Joining Raffle
  const handleJoinRaffle = async () => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para participar.');
      return;
    }

    if (!eligiblePlans.includes(userPlan)) {
      toast.error('Seu plano atual não é elegível para o sorteio vitalício. Altere o plano abaixo para testar!');
      return;
    }

    setIsSubmitting(true);
    try {
      // Register via server endpoint first
      await fetch('/api/sorteio/participar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email || 'desconhecido@sistenfox.pt',
          plano: userPlan,
        })
      });

      try {
        const pDocRef = doc(db, 'sorteioParticipantes', currentUser.uid);
        await setDoc(pDocRef, {
          email: currentUser.email || 'desconhecido@sistenfox.pt',
          plano: userPlan,
          joinedAt: Date.now()
        });
      } catch {
        // Safe ignore client offline error since server already registered the user
      }

      toast.success('Inscrição realizada com sucesso! Boa sorte! 🎉');
      setIsParticipating(true);
      fetchData();
    } catch (error: any) {
      console.warn('Aviso ao registrar participação:', error?.message || error);
      toast.error('Ocorreu um erro ao registrar sua participação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to change plan for testing/simulation
  const handleUpdateTestPlan = async (plan: string) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        email: currentUser.email,
        plan: plan,
        role: isAdmin ? 'admin' : 'client'
      }, { merge: true });

      setUserPlan(plan);
      toast.success(`Plano simulado alterado para "${plan}"!`);
      // Re-trigger data sync
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar plano de teste:', error);
      toast.error('Não foi possível alterar seu plano.');
    }
  };

  // Admin function: Simulate Monthly Drawing
  const handleSimulateMonthlyDraw = async () => {
    if (participants.length === 0) {
      toast.error('Nenhum participante inscrito para sortear.');
      return;
    }

    if (config.sorteados >= config.total) {
      toast.error('Todas as contas vitalícias da campanha já foram sorteadas!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sorteio/admin/sortear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        toast.success(`Parabéns! ${json?.winner?.email || 'Participante'} foi o vencedor sorteado! 👑`);
        fetchData();
        return;
      }

      // Fallback to client Firestore
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winner = participants[randomIndex];

      await addDoc(collection(db, 'sorteioVencedores'), {
        uid: winner.id,
        email: winner.email,
        plano: winner.plano,
        sorteadoEm: Date.now()
      });

      const configRef = doc(db, 'appConfig', 'sorteioVitalicio');
      const updatedSorteados = config.sorteados + 1;
      const updatedUltimoSorteio = Date.now();
      
      await updateDoc(configRef, {
        sorteados: updatedSorteados,
        ultimoSorteio: updatedUltimoSorteio
      });

      toast.success(`Parabéns! ${winner.email} foi o vencedor sorteado! 👑`);
      fetchData();
    } catch (error: any) {
      console.warn('Aviso ao realizar sorteio:', error?.message || error);
      toast.error('Erro ao processar o sorteio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin function: Update start date
  const handleUpdateSorteioDate = async (novaData: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sorteio/admin/update-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inicio: novaData })
      });
      if (res.ok) {
        toast.success(`Data do sorteio atualizada para ${formatarDataCurta(novaData)}!`);
        fetchData();
        return;
      }
      const configRef = doc(db, 'appConfig', 'sorteioVitalicio');
      await updateDoc(configRef, {
        inicio: novaData,
        proximoSorteio: new Date(novaData + "T00:00:00Z").getTime()
      });
      toast.success(`Data do sorteio atualizada para ${formatarDataCurta(novaData)}!`);
      fetchData();
    } catch {
      toast.error('Erro ao atualizar data do sorteio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin function: Reset Sorteio for testing
  const handleResetDraws = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sorteio/admin/reset', { method: 'POST' });
      if (res.ok) {
        toast.info('Sorteio reiniciado para configuração oficial de 8 meses à frente (0 sorteados).');
        fetchData();
        return;
      }

      const configRef = doc(db, 'appConfig', 'sorteioVitalicio');
      await setDoc(configRef, {
        total: 10,
        sorteados: 0,
        inicio: "2027-07-01",
        ultimoSorteio: null,
        ativo: true
      });

      toast.info('Sorteio reiniciado para configuração oficial (0 sorteados).');
      fetchData();
    } catch (e) {
      toast.error('Erro ao reiniciar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasEligiblePlan = eligiblePlans.includes(userPlan);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400">
        <div className="w-10 h-10 border-4 border-t-[#ffb300] border-zinc-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Carregando painel de sorteio vitalício...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#ffb300] mb-2 flex items-center gap-2">
            🎁 Sorteio Vitalício — Início: {formatarDataCurta(config.inicio)}
          </h2>
          <p className="text-zinc-400 text-sm">
            1 conta sorteada por mês até completar as 10.
          </p>
        </div>
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="md:hidden self-start px-4 py-2 border border-zinc-800 rounded-xl text-xs text-zinc-400 hover:text-white"
          >
            Menu
          </button>
        )}
      </div>

      {/* Sorteio Status Card */}
      <VitalicioSorteioCard 
        total={config.total} 
        sorteados={config.sorteados} 
        ultimoSorteio={config.ultimoSorteio}
      />

      {/* User Participation Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Action to participate */}
        <div className="md:col-span-2 premium-card flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2 mb-4">
              <Crown className="text-[#ffb300] w-5 h-5" />
              Sua Participação
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                <div>
                  <span className="text-xs text-zinc-500 font-bold block uppercase tracking-wider">Seu Plano</span>
                  <span className="text-sm font-semibold text-white capitalize">{userPlan || 'Nenhum'}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-bold block uppercase tracking-wider text-right">Elegibilidade</span>
                  {hasEligiblePlan ? (
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                      Elegível
                    </span>
                  ) : (
                    <span className="text-xs text-red-400 font-bold bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20">
                      Ineligível
                    </span>
                  )}
                </div>
              </div>

              {isParticipating ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-300">
                  <CheckCircle2 size={32} className="shrink-0 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-sm">Você está participando!</h4>
                    <p className="text-xs opacity-80">Sua conta já está incluída nos próximos sorteios mensais automáticos.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-300">
                  <AlertTriangle size={32} className="shrink-0 text-[#ffb300]" />
                  <div>
                    <h4 className="font-bold text-sm">Não participando</h4>
                    <p className="text-xs opacity-80">Clique no botão abaixo para garantir sua inscrição no sorteio.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800">
            {isParticipating ? (
              <button
                disabled
                className="w-full bg-zinc-800 text-zinc-500 font-bold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
              >
                Inscrito no Sorteio
              </button>
            ) : (
              <button
                onClick={handleJoinRaffle}
                disabled={isSubmitting || !hasEligiblePlan}
                className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl ${
                  hasEligiblePlan 
                    ? 'bg-[#ffb300] hover:bg-[#e09e00] text-black hover:scale-[1.01]' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Sparkles size={18} />
                {isSubmitting ? 'Inscrevendo...' : 'Participar do Sorteio'}
              </button>
            )}
            {!hasEligiblePlan && (
              <p className="text-[11px] text-zinc-500 text-center mt-3 leading-relaxed">
                * Para participar do sorteio você precisa de uma assinatura <strong>Pocket Pro</strong> ou superior. Use os controles de teste ao lado para atualizar seu plano de simulação.
              </p>
            )}
          </div>
        </div>

        {/* Right column: Sandbox Plan Simulation controls */}
        <div className="premium-card bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#ffb300] flex items-center gap-1.5 mb-2">
              <RotateCcw size={14} />
              Simulação de Plano
            </h4>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Use estes controles para simular diferentes assinaturas de conta e verificar como o sistema de elegibilidade se comporta em tempo real.
            </p>

            <div className="space-y-3">
              {[
                { id: 'starter', label: 'Starter (Grátis) ⏳', desc: 'R$ 0,00 • Plano gratuito básico (não elegível)' },
                { id: 'trial', label: 'Teste Grátis (30 Dias)', desc: '30 dias no Plano Maior sem custo (não elegível)' },
                { id: 'pocketPro', label: 'Pocket Pro ⭐', desc: 'R$ 20,70/mês (70% OFF por 2 anos) • Elegível' },
                { id: 'business', label: 'Business 🚀', desc: 'R$ 29,70/mês (70% OFF por 2 anos) • Elegível' },
                { id: 'enterprise', label: 'Enterprise 👑', desc: 'R$ 44,70/mês (70% OFF por 2 anos) • Elegível' },
                { id: 'enterpriseFiscal', label: 'Enterprise Fiscal 💼', desc: 'R$ 59,70/mês (70% OFF por 2 anos) • Elegível' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleUpdateTestPlan(item.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    userPlan === item.id 
                      ? 'bg-[#ffb300]/10 border-[#ffb300] text-[#ffb300]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="font-bold text-xs">{item.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-zinc-600 mt-6 pt-4 border-t border-zinc-800 leading-relaxed">
            * No ambiente de produção, este plano é herdado diretamente das faturas confirmadas pelo Stripe ou Gateway integrado.
          </div>
        </div>
      </div>

      {/* List of Participants and Previous Winners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* List of Active Participants */}
        <div className="premium-card bg-zinc-900/40">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-cyan-400" />
              Participantes ({participants.length})
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Nesta Rodada</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
            {participants.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-2xl">
                Nenhum participante inscrito ainda. Seja o primeiro!
              </div>
            ) : (
              participants.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3.5 bg-zinc-950 rounded-2xl border border-zinc-900">
                  <div className="truncate pr-4">
                    <span className="text-sm font-medium text-white block truncate">{p.email}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider capitalize">Plano: {p.plano}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0 font-medium">
                    {new Date(p.joinedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Previous Winners List */}
        <div className="premium-card bg-zinc-900/40 border-[#ffb300]/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Trophy size={18} className="text-[#ffb300]" />
              Vencedores dos Sorteios
            </h3>
            <span className="text-[10px] text-[#ffb300] uppercase font-bold tracking-wider">Histórico</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
            {winners.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-2xl">
                Nenhum sorteio foi realizado na campanha atual ainda.
              </div>
            ) : (
              winners.map((w) => (
                <div key={w.id} className="flex justify-between items-center p-3.5 bg-zinc-950/60 border border-[#ffb300]/10 rounded-2xl">
                  <div className="truncate pr-4">
                    <span className="text-sm font-bold text-[#ffb300] block truncate">{w.email}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider capitalize">Plano: {w.plano}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0 font-bold bg-[#ffb300]/5 px-2 py-1 rounded-lg border border-[#ffb300]/10 text-right">
                    {new Date(w.sorteadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin Operations Section (Only visible to admin) */}
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 border-2 border-[#ffb300]/20 bg-gradient-to-br from-[#ffb300]/5 to-zinc-950 rounded-3xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#ffb300] flex items-center gap-2">
                <Crown size={20} className="text-[#ffb300]" />
                Simulador do Admin
              </h3>
              <p className="text-xs text-zinc-400">
                Ações administrativas exclusivas para testar a Cloud Function do sorteio e gerenciar a campanha.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleResetDraws}
                disabled={isSubmitting}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                Zerar Sorteios
              </button>

              <button
                onClick={handleSimulateMonthlyDraw}
                disabled={isSubmitting || participants.length === 0}
                className="px-5 py-2.5 bg-[#ffb300] hover:bg-[#e09e00] text-black rounded-xl text-xs font-extrabold shadow-lg shadow-[#ffb300]/10 transition-all flex items-center gap-1.5"
              >
                <Play size={14} fill="currentColor" />
                Sorteio Mensal (Agora)
              </button>
            </div>
          </div>

          {/* Sorteio Date Controls */}
          <div className="mb-6 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="text-[#ffb300] shrink-0" size={16} />
              <div>
                <span className="text-xs font-bold text-white block">Data de Início da Campanha</span>
                <span className="text-[11px] text-zinc-400">Atualmente configurada para: <strong className="text-[#ffb300]">{formatarDataCurta(config.inicio)}</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleUpdateSorteioDate("2027-07-01")}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-[#ffb300]/10 hover:bg-[#ffb300]/20 border border-[#ffb300]/30 text-[#ffb300] rounded-xl text-xs font-bold transition-all"
                title="8 meses à frente da data atual (Julho/2027)"
              >
                01/07/2027 (+8 meses)
              </button>
              <button
                onClick={() => handleUpdateSorteioDate("2027-04-01")}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-medium transition-all"
                title="8 meses à frente de Agosto (Abril/2027)"
              >
                01/04/2027
              </button>
              <input
                type="date"
                defaultValue={config.inicio || "2027-07-01"}
                onChange={(e) => {
                  if (e.target.value) handleUpdateSorteioDate(e.target.value);
                }}
                disabled={isSubmitting}
                className="bg-black border border-zinc-800 text-white rounded-xl px-2.5 py-1 text-xs focus:border-[#ffb300] outline-none"
              />
            </div>
          </div>

          <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-900 text-xs text-zinc-500 leading-relaxed">
            <strong>Como funciona a Automação do Sorteio Vitalício:</strong> Em produção, a Cloud Function <code>sorteioMensal</code> é ativada de forma agendada no Firebase Cron no primeiro minuto de cada mês. Ela valida as inscrições de forma assíncrona, escolhe aleatoriamente um vencedor do banco de dados unificado, insere-o no histórico de vencedores e atualiza o painel público e privado instantaneamente.
          </div>
        </motion.div>
      )}
    </div>
  );
}
