import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Store, 
  Palette, 
  Layout, 
  Rocket,
  Upload,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { sfx_createTrial } from '../lib/trial';

export default function Wizard() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appData, setAppData] = useState<any>(null);

  useEffect(() => {
    console.log('Wizard mounted for appId:', appId);
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/apps/${appId}`);
        if (!res.ok) throw new Error('App não encontrado');
        const data = await res.json();
        setAppData(data);
      } catch (error) {
        toast.error('Erro ao carregar configurações do app');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [appId, navigate]);

  const handleUpdate = async (newData: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/apps/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      const updated = await res.json();
      setAppData(updated);
      toast.success('Configurações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (loading) return <div className="h-screen flex items-center justify-center bg-premium-black text-gold">Carregando assistente...</div>;

  const steps = [
    { id: 1, title: 'Identidade', icon: Store },
    { id: 2, title: 'Visual', icon: Palette },
    { id: 3, title: 'Conteúdo', icon: Layout },
    { id: 4, title: 'Domínio', icon: Globe },
    { id: 5, title: 'Publicar', icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-premium-black text-white flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-gold/10 bg-card-app flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center text-premium-black font-bold">
            SF
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold gold-text-gradient">Assistente de Configuração</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest">SISTENFOX Builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s.id ? 'gold-gradient text-premium-black' : 'bg-white/5 text-white/20'
              }`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px ${step > s.id ? 'bg-gold' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card-app border border-gold/10 rounded-3xl p-8 shadow-2xl"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-8">
                    <Store className="text-gold" size={32} />
                    <h2 className="text-3xl font-serif font-bold">Qual o nome do seu negócio?</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Nome do Estabelecimento</label>
                      <input 
                        type="text" 
                        value={appData.name}
                        onChange={(e) => setAppData({...appData, name: e.target.value})}
                        className="w-full bg-white/5 border border-gold/20 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all"
                        placeholder="Ex: Restaurante do Chefe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Slogan / Frase de Efeito</label>
                      <input 
                        type="text" 
                        value={appData.slogan || ''}
                        onChange={(e) => setAppData({...appData, slogan: e.target.value})}
                        className="w-full bg-white/5 border border-gold/20 rounded-xl px-4 py-3 focus:border-gold outline-none transition-all"
                        placeholder="Ex: A melhor picanha da cidade"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-8">
                    <Palette className="text-gold" size={32} />
                    <h2 className="text-3xl font-serif font-bold">Identidade Visual</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 border border-gold/10 rounded-2xl flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-gold/30">
                        <Upload className="text-gold/50" />
                      </div>
                      <button className="text-xs font-bold text-gold uppercase tracking-widest">Subir Logotipo</button>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Cor Principal</label>
                      <div className="flex gap-3">
                        {['#D4AF37', '#FF69B4', '#ff0000', '#6F4E37', '#00ff00'].map(color => (
                          <button 
                            key={color}
                            onClick={() => setAppData({...appData, primaryColor: color})}
                            className={`w-10 h-10 rounded-full border-2 ${appData.primaryColor === color ? 'border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="p-4 rounded-xl border border-gold/20" style={{ backgroundColor: `${appData.primaryColor}10` }}>
                        <p className="text-xs text-center" style={{ color: appData.primaryColor }}>Prévia da cor selecionada</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center text-premium-black mx-auto mb-8 shadow-[0_0_50px_rgba(255,215,0,0.3)]">
                    <Rocket size={48} />
                  </div>
                  <h2 className="text-4xl font-serif font-bold gold-text-gradient">Tudo pronto!</h2>
                  <p className="text-white/60">Seu aplicativo foi gerado com sucesso e está pronto para ser publicado.</p>
                  <div className="p-6 bg-gold/5 border border-gold/20 rounded-2xl text-left">
                    <h4 className="text-gold font-bold mb-2">Resumo do App:</h4>
                    <ul className="text-sm space-y-1 opacity-80">
                      <li>• Nicho: {appData.nicho}</li>
                      <li>• Nome: {appData.name}</li>
                      <li>• Páginas: {appData.pages.length}</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Botões do Wizard */}
              <div className="mt-12 flex items-center justify-between">
                <button 
                  onClick={prevStep}
                  disabled={step === 1}
                  className="flex items-center gap-2 text-white/40 hover:text-white disabled:opacity-0 transition-all"
                >
                  <ChevronLeft size={20} /> Voltar
                </button>
                
                {step < 5 ? (
                  <button 
                    onClick={() => {
                      handleUpdate(appData);
                      nextStep();
                    }}
                    className="gold-gradient text-premium-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    Próximo Passo <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      sfx_createTrial();
                      toast.success('App publicado com sucesso! Teste de 30 dias ativo no plano maior.');
                      navigate('/admin');
                    }}
                    className="gold-gradient text-premium-black px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-gold/20"
                  >
                    Publicar Agora
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="p-6 text-center text-white/20 text-xs uppercase tracking-[0.2em]">
        SISTENFOX Automation Engine — v2.5
      </footer>
    </div>
  );
}
