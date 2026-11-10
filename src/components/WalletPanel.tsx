import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Coins, 
  ArrowRight, 
  QrCode, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Globe, 
  Play, 
  Check, 
  HelpCircle,
  Menu
} from 'lucide-react';
import { db } from '../lib/firebaseClient';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../lib/utils';
import { THEME, Button } from './SistenfoxDS';
import { toast } from 'sonner';
import { NativeNotificationService } from '../services/nativeNotification';
import { useNotificationStore } from '../lib/store';

export default function WalletPanel({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { user } = useAuth();
  
  // States
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('BRL');
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [creditsToBuy, setCreditsToBuy] = useState<number>(100);
  const [customCredits, setCustomCredits] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('BRL');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [rateLoading, setRateLoading] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  
  // Payment info state
  const [activePayment, setActivePayment] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    amountBRL: number;
    isDemo: boolean;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // 1. Real-time balance listener from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    // Sintonizar na coleção de wallets
    const walletRef = doc(db, 'wallets', user.uid);
    const unsubscribe = onSnapshot(walletRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBalance(data.balance || 0);
        setCurrency(data.currency || 'BRL');
      } else {
        setBalance(0);
        setCurrency('BRL');
      }
      setLoadingBalance(false);
    }, (error) => {
      console.error("Error listening to wallet balance:", error);
      setLoadingBalance(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Fetch live exchange rate when currency changes
  useEffect(() => {
    const fetchRate = async () => {
      if (selectedCurrency === 'BRL') {
        setExchangeRate(1);
        return;
      }
      setRateLoading(true);
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${selectedCurrency}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && data.rates['BRL']) {
            setExchangeRate(data.rates['BRL']);
            setRateLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("API exchange rate fetch failed, using fallback.", err);
      }
      
      // Offline fallback rates
      const fallbackRates: Record<string, number> = {
        USD: 5.50,
        EUR: 6.00,
      };
      setExchangeRate(fallbackRates[selectedCurrency] || 1);
      setRateLoading(false);
    };

    fetchRate();
  }, [selectedCurrency]);

  const activeCredits = customCredits !== '' ? parseFloat(customCredits) || 0 : creditsToBuy;
  const estimatedBRLCost = parseFloat((activeCredits * exchangeRate).toFixed(2));

  // 3. Create Mercado Pago PIX Payment
  const handlePurchaseCredits = async () => {
    if (activeCredits <= 0) {
      toast.error("Por favor, selecione ou digite uma quantidade de créditos válida.");
      return;
    }

    setCreatingPayment(true);
    try {
      const response = await safeFetch('/api/wallet/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken() || ''}`,
          'x-user-uid': user?.uid || ''
        },
        body: JSON.stringify({
          credits: activeCredits,
          currency: selectedCurrency
        })
      });

      if (response.ok && response.data) {
        setActivePayment(response.data);
        toast.success(response.data.isDemo 
          ? "Demonstração de pagamento PIX gerada com sucesso!" 
          : "Pix copia e cola gerado via Mercado Pago!"
        );
      } else {
        throw new Error(response.error || "Falha ao gerar o Pix com Mercado Pago");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Não foi possível iniciar o pagamento.");
    } finally {
      setCreatingPayment(false);
    }
  };

  // 4. Simulate payment approval (Demo mode only)
  const handleSimulateApproval = async () => {
    if (!activePayment) return;
    setSimulatingPayment(true);
    try {
      const response = await safeFetch('/api/wallet/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken() || ''}`,
          'x-user-uid': user?.uid || ''
        },
        body: JSON.stringify({
          paymentId: activePayment.paymentId
        })
      });

      if (response.ok) {
        // Dispatch Native Browser Notification
        NativeNotificationService.notifyPaymentApproved({
          amount: activePayment.amountBRL,
          method: 'PIX',
          client: user?.displayName || user?.email || 'Carteira Digital',
          description: 'Recarga de Saldo SISTENFOX',
        });

        // Add to in-app notification center
        useNotificationStore.getState().addNotification({
          title: 'Pagamento Aprovado',
          message: `Recarga de R$ ${activePayment.amountBRL.toFixed(2)} confirmada via PIX. Créditos adicionados.`,
          type: 'success',
          critical: true,
        });

        toast.success(`Pagamento de R$ ${activePayment.amountBRL.toFixed(2)} aprovado com sucesso! Seus créditos foram adicionados.`);
        setActivePayment(null);
      } else {
        throw new Error(response.error || "Erro ao simular aprovação do pagamento.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Simulação falhou.");
    } finally {
      setSimulatingPayment(false);
    }
  };

  const copyPixPayload = () => {
    if (!activePayment) return;
    navigator.clipboard.writeText(activePayment.qrCode);
    setCopied(true);
    toast.success("Código Copia e Cola copiado com sucesso!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 text-white max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-all"
            >
              <Menu size={24} />
            </button>
          )}
          <div>
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] block mb-1">
              Mercado Pago & Sistema de Créditos
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Wallet className="w-8 h-8 text-cyan-400" /> Minha Carteira
            </h1>
          </div>
        </div>

        <div className="text-zinc-500 text-xs font-mono hidden md:block">
          SISTENFOX PAY ID: <span className="text-zinc-400">{user?.uid || 'carregando...'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Wallet Status & Recharge */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Card: Current Balance */}
          <div className="relative overflow-hidden bg-zinc-950 p-8 rounded-3xl border border-zinc-900 shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/5 rounded-full -mr-24 -mt-24 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                  Saldo Disponível
                </span>
                
                {loadingBalance ? (
                  <div className="flex items-center gap-3 py-1">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                    <span className="text-zinc-400 text-sm">Carregando saldo...</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                      {balance !== null ? balance.toLocaleString('pt-BR', { minimumFractionDigits: 1 }) : '0,0'}
                    </span>
                    <span className="text-cyan-400 font-bold text-sm tracking-widest uppercase">
                      créditos
                    </span>
                  </div>
                )}
                
                <p className="text-xs text-zinc-400 mt-2 font-light">
                  Seus créditos podem ser utilizados para contratação de nichos, PWA deploy e automações.
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-400/10 rounded-full flex items-center justify-center text-cyan-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Moeda Principal</span>
                  <span className="text-sm font-bold text-zinc-200">Real Brasileiro (BRL)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Recharge Section */}
          <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-900 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                ⚡ Recarregar Carteira
              </h2>
              <p className="text-xs text-zinc-400 font-light">
                Selecione um pacote de créditos ou digite uma quantia customizada para recarga imediata via PIX.
              </p>
            </div>

            {/* Package Selection Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[50, 100, 500].map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => {
                    setCreditsToBuy(pkg);
                    setCustomCredits('');
                  }}
                  className={`relative p-5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    customCredits === '' && creditsToBuy === pkg
                      ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-400/5 scale-[1.03]'
                      : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <Coins className={`w-5 h-5 ${customCredits === '' && creditsToBuy === pkg ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span className="text-lg font-extrabold">{pkg}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Créditos</span>
                </button>
              ))}
            </div>

            {/* Custom Input / Advanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">
                  Outra Quantia
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 250"
                    value={customCredits}
                    onChange={(e) => {
                      setCustomCredits(e.target.value);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-16 py-3 text-sm focus:border-cyan-400 outline-none transition-colors text-white"
                  />
                  <div className="absolute right-3 top-3.5 text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                    Créditos
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Escolher Moeda
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-cyan-400 outline-none transition-colors text-white"
                >
                  <option value="BRL">Real Brasileiro (BRL - R$)</option>
                  <option value="USD">Dólar Americano (USD - $)</option>
                  <option value="EUR">Euro (EUR - €)</option>
                </select>
              </div>
            </div>

            {/* Exchange rate display */}
            {selectedCurrency !== 'BRL' && (
              <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-2xl flex items-center gap-3">
                <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div className="text-xs font-light text-zinc-300">
                  {rateLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" /> Buscando taxa de câmbio em tempo real...
                    </span>
                  ) : (
                    <span>
                      Taxa de câmbio: <strong className="font-semibold">1 {selectedCurrency} = {exchangeRate.toFixed(2)} BRL</strong>. O valor será convertido automaticamente para BRL para o Mercado Pago.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Invoice checkout review */}
            <div className="bg-black/40 rounded-2xl p-5 border border-zinc-900 flex justify-between items-center text-sm">
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 font-light block">Conversão & Resumo</span>
                <span className="text-white font-semibold">
                  {activeCredits} créditos em {selectedCurrency}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-bold">Total em BRL</span>
                <span className="text-xl font-extrabold text-cyan-400">
                  R$ {estimatedBRLCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Buy Action Button */}
            <button
              onClick={handlePurchaseCredits}
              disabled={creatingPayment || activeCredits <= 0}
              className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {creatingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando Cobrança Mercado Pago...
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  Gerar Pix no Valor de R$ {estimatedBRLCost.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Active Payment / QR Code */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {!activePayment ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-950 rounded-3xl border border-zinc-900 border-dashed p-10 text-center flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 mb-4 border border-zinc-800">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-md font-bold mb-1">Aguardando Cobrança</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto font-light leading-relaxed">
                  Gere um Pix ao lado para receber o código Copia e Cola e o QR Code oficial do Mercado Pago aqui em tempo real.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="payment-active"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-zinc-950 p-6 rounded-3xl border border-cyan-400/20 shadow-2xl relative space-y-6"
              >
                {/* Banner Demo Mode */}
                {activePayment.isDemo && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-amber-400" /> Modo Demonstrativo Ativo
                    </div>
                    <p className="text-[11px] font-light leading-relaxed">
                      Não há chave Mercado Pago oficial configurada. Use o botão de simulação rápida abaixo para testar o webhook e ver o saldo atualizar instantaneamente!
                    </p>
                  </div>
                )}

                {/* QR Code Frame */}
                <div className="text-center space-y-3">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest block">
                    Escaneie para Pagar
                  </span>

                  <div className="bg-white p-4 rounded-2xl w-56 h-56 mx-auto flex items-center justify-center shadow-lg border border-zinc-200">
                    <img 
                      src={activePayment.qrCodeBase64} 
                      alt="PIX QR Code" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-zinc-400 font-light">Valor a Pagar:</span>
                    <span className="text-2xl font-black text-cyan-400 block">
                      R$ {activePayment.amountBRL.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Pix copy and paste code */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    Pix Copia e Cola
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={activePayment.qrCode}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-zinc-400 outline-none truncate"
                    />
                    <button
                      onClick={copyPixPayload}
                      className="bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-800 hover:border-zinc-700 p-3 rounded-xl transition-all active:scale-95"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Simulation button if demo mode */}
                {activePayment.isDemo ? (
                  <button
                    onClick={handleSimulateApproval}
                    disabled={simulatingPayment}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {simulatingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Aprovando Pagamento...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Simular Aprovação de Pagamento PIX
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-850 justify-center">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                    <span className="text-xs text-zinc-400 font-light">Aguardando aprovação do Mercado Pago...</span>
                  </div>
                )}

                <button 
                  onClick={() => setActivePayment(null)}
                  className="w-full bg-transparent border border-zinc-800 text-zinc-400 hover:text-white py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-colors hover:bg-zinc-900"
                >
                  Cancelar Cobrança
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
