import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Database, 
  Cpu, 
  Layers, 
  Utensils, 
  ShoppingBag, 
  Calendar, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Palette,
  Briefcase
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/SistenfoxDS';
import { generateAppWithAi, AiAppGenerationReport } from './AiEngine';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function AiAppCreator() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('restaurant');
  const [brandTone, setBrandTone] = useState<string>('elegant');
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState('#22d3ee');
  const [desiredDomain, setDesiredDomain] = useState('');
  const [plan, setPlan] = useState('pro');
  const [ownerEmail, setOwnerEmail] = useState('');

  // Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLog, setActiveLog] = useState<string>('');
  const [generationReport, setGenerationReport] = useState<AiAppGenerationReport | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !businessName || !ownerEmail || !description) {
      toast.error('Por favor, preencha todos os campos obrigatórios (incluindo a descrição detalhada do negócio).');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationReport(null);
      setActiveLog('Despertando motor neural Sistenfox...');

      // Run AI Generator Orchestrator on Server
      const report = await generateAppWithAi(
        {
          clientName,
          businessName,
          appType: selectedTemplate,
          brandTone,
          colors,
          description,
          desiredDomain,
          plan,
          ownerEmail
        },
        user?.uid || '0wRwjIHf5V1...',
        (log) => {
          setActiveLog(log);
        }
      );

      setGenerationReport(report);
      toast.success('Aplicativo gerado e implantado por IA com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Falha ao gerar o app com IA.');
      setActiveLog(`ERRO CRÍTICO NA ENGINE: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'restaurant': return <Utensils className="w-5 h-5" />;
      case 'store': return <ShoppingBag className="w-5 h-5" />;
      case 'service': return <Calendar className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const getToneLabel = (tone: string) => {
    switch (tone) {
      case 'elegant': return 'Elegante (Luxo, Preto e Ouro)';
      case 'bold': return 'Ousado (Brilhante, Neon)';
      case 'minimalist': return 'Minimalista (Suíço, Monocromático)';
      case 'brutalist': return 'Brutalista (Alto Contraste, Técnico)';
      default: return tone;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="cyan" className="text-xs tracking-[0.2em] font-extrabold px-3 py-1 bg-cyan-950/40 border-cyan-400/20">
            FOX NEURAL STUDIO
          </Badge>
          <span className="text-zinc-600 font-mono text-xs">V3.5 ACTIVE</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-4">
          Criar App com IA
        </h1>
        <p className="text-zinc-400 text-lg font-light max-w-2xl">
          Descreva sua ideia e assista nossa inteligência artificial redigir a landing page, projetar o banco de dados e implantar o PWA sob medida com o design system DSX-1.
        </p>
      </div>

      {!generationReport && !isGenerating && (
        <form onSubmit={handleGenerate} className="space-y-10">
          {/* Section 1: Descrição Criativa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/20 text-cyan-400 flex items-center justify-center font-bold text-xs">1</span>
              <h3 className="text-lg font-semibold text-white">O que o aplicativo deve fazer?</h3>
            </div>
            
            <Card className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                  Prompt Descritivo (Seja Específico)
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Uma cafeteria vegana sofisticada no bairro de pinheiros chamada 'Verde Puro'. Deve focar em café especial orgânico, doces refinados sem glúten, ambiente intimista com plantas e estética minimalista com madeira e detalhes em ouro..."
                  className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-2xl p-4 text-sm focus:border-cyan-400 outline-none transition-all placeholder:text-zinc-600 leading-relaxed font-light"
                />
              </div>
            </Card>
          </div>

          {/* Section 2: Configuração de Marca */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/20 text-cyan-400 flex items-center justify-center font-bold text-xs">2</span>
              <h3 className="text-lg font-semibold text-white">Modelo de Negócio & Direção de Arte</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Business Type & Tone */}
              <Card className="bg-zinc-950 border border-zinc-900 p-6 space-y-6 lg:col-span-2">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tipo de Negócio Base</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'restaurant', name: 'Alimentação' },
                      { id: 'store', name: 'E-commerce' },
                      { id: 'service', name: 'Serviços' },
                      { id: 'custom', name: 'Customizado' }
                    ].map((type) => {
                      const isSelected = selectedTemplate === type.id;
                      return (
                        <div
                          key={type.id}
                          onClick={() => setSelectedTemplate(type.id)}
                          className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                            isSelected 
                              ? 'bg-zinc-900 border-cyan-400 text-white' 
                              : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          {getTemplateIcon(type.id)}
                          <span className="text-xs font-bold font-mono uppercase tracking-wider">{type.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tom da Marca</label>
                    <select
                      value={brandTone}
                      onChange={(e) => setBrandTone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl p-3 text-sm focus:border-cyan-400 outline-none transition-all"
                    >
                      <option value="elegant">Elegante (Alta Costura, Premium)</option>
                      <option value="bold">Ousado (Impactante, Energético)</option>
                      <option value="minimalist">Minimalista (Sóbrio, Limpo)</option>
                      <option value="brutalist">Brutalista (Técnico, Tecnológico)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5" /> Cor de Destaque DSX-1
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={colors}
                        onChange={(e) => setColors(e.target.value)}
                        className="w-12 h-11 bg-zinc-950 border border-zinc-850 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colors}
                        onChange={(e) => setColors(e.target.value)}
                        placeholder="#22d3ee"
                        className="flex-1 bg-zinc-950 border border-zinc-850 text-white rounded-xl px-4 text-xs font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Right Column: Customer Details */}
              <Card className="bg-zinc-950 border border-zinc-900 p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Dados do Contrato</span>
                  <Input
                    label="Nome do Cliente"
                    placeholder="Ex: Marley Mai"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                  <Input
                    label="E-mail do Cliente"
                    type="email"
                    placeholder="Ex: marley@gourmet.com"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                  />
                  <Input
                    label="Nome Oficial do App"
                    placeholder="Ex: Verde Puro Café"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Section 3: Plano & Domínio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/20 text-cyan-400 flex items-center justify-center font-bold text-xs">3</span>
              <h3 className="text-lg font-semibold text-white">Plano e Configurações de Rede</h3>
            </div>

            <Card className="bg-zinc-950 border border-zinc-900 p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Plano Contratado</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-2xl px-4 py-4 text-sm focus:border-cyan-400 outline-none transition-all"
                >
                  <option value="pocket">Pocket Pro (70% OFF: R$ 20,70/mês por 2 anos)</option>
                  <option value="pro">Business (70% OFF: R$ 29,70/mês por 2 anos)</option>
                  <option value="premium">Enterprise (70% OFF: R$ 44,70/mês por 2 anos)</option>
                  <option value="fiscal">Enterprise Fiscal (70% OFF: R$ 59,70/mês por 2 anos)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Input
                  label="Domínio Customizado (Opcional)"
                  placeholder="Ex: verdepuro.com.br"
                  value={desiredDomain}
                  onChange={(e) => setDesiredDomain(e.target.value)}
                />
                <p className="text-[10px] text-zinc-600 font-light ml-1">
                  Se deixado em branco, a IA criará automaticamente <span className="text-cyan-400 font-mono">verdepuro.sistenfox.com</span>
                </p>
              </div>
            </Card>
          </div>

          {/* Action Trigger Button */}
          <div className="flex justify-end pt-4">
            <Button
              variant="neon"
              size="lg"
              type="submit"
              className="flex items-center gap-3 group px-8"
            >
              <Sparkles className="w-5 h-5 animate-pulse text-cyan-300" /> 
              Gerar App com Inteligência Artificial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </div>
        </form>
      )}

      {/* Loading Terminal Simulation */}
      {isGenerating && (
        <Card className="bg-black border border-zinc-900 p-8 space-y-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-cyan-400/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              <div>
                <h3 className="text-lg font-bold text-white">Raciocínio Generativo Ativo</h3>
                <p className="text-xs text-zinc-500 font-light">
                  Gemini está decodificando sua descrição para estruturar os assets e códigos
                </p>
              </div>
            </div>
            <Badge variant="cyan" className="animate-pulse px-3 py-1 bg-cyan-950 text-cyan-400">AI PIPELINE GENERATION</Badge>
          </div>

          {/* Simulated Pipeline Steps */}
          <div className="space-y-3 font-mono text-xs text-zinc-400">
            <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
              <span className="text-cyan-400">Step 1: Engenharia de Prompt Especializado</span>
              <span className="text-emerald-400 font-bold">CONCLUÍDO</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl animate-pulse">
              <span className="text-cyan-400">Step 2: Geração de Conteúdo Estruturado da Landing Page</span>
              <span className="text-cyan-400 font-bold">EXECUTANDO...</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-600">
              <span>Step 3: Criação de Catálogos & Métricas no Cloud Firestore</span>
              <span>AGUARDANDO</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-600">
              <span>Step 4: Compilação de Assets de Estilo & PWA Deploy</span>
              <span>AGUARDANDO</span>
            </div>
          </div>

          {/* Output Terminal */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 font-mono text-xs text-cyan-400 space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>TERMINAL DE SAÍDA COGNITIVA</span>
            </div>
            <div className="space-y-1.5 leading-relaxed font-light">
              <p className="text-zinc-500">[COGNITIVE] Lendo prompt criativo: "{description.substring(0, 80)}..."</p>
              <p className="text-zinc-500">[MODEL] Invocando LLM Gemini 3.5-flash com schema estruturado...</p>
              <p className="text-cyan-300 font-medium">&gt;&gt; {activeLog}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Success Generation Report */}
      {generationReport && (
        <div className="space-y-10">
          <Card glow className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-950 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    App Criado por IA! <Badge variant="green" className="text-[9px]">DSX-1 ATIVO</Badge>
                  </h3>
                  <p className="text-xs text-zinc-500 font-light">
                    O ecossistema foi provisionado com dados gerados dinamicamente via IA cognitiva
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="neon" 
                  size="sm"
                  onClick={() => window.open(generationReport.deployResult.deployedUrl, '_blank')}
                  className="flex items-center gap-2 text-xs"
                >
                  <ExternalLink className="w-4 h-4" /> Visitar App
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setGenerationReport(null)}
                  className="text-xs"
                >
                  Criar Outro com IA
                </Button>
              </div>
            </div>

            {/* Quick Metrics of AI Generation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">CLIENTE ID (FIRESTORE)</span>
                <span className="text-xs font-mono font-semibold text-white block truncate">{generationReport.clientId}</span>
              </div>
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">DOMÍNIO SELECIONADO</span>
                <span className="text-xs font-mono font-semibold text-cyan-400 truncate block">{generationReport.domainConfig.domain}</span>
              </div>
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">ITENS SEEDADOS POR IA</span>
                <span className="text-sm font-semibold text-white">{generationReport.dbResult.recordsInserted} registros</span>
              </div>
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">TOM ARTÍSTICO APLICADO</span>
                <span className="text-sm font-semibold text-emerald-400 capitalize">{getToneLabel(brandTone).split(' ')[0]}</span>
              </div>
            </div>
          </Card>

          {/* Deep Visual Previews tailored by AI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Landing Page Tailored preview */}
            <Card className="bg-zinc-950 border border-zinc-900 p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">LANDING PAGE GERADA POR IA</span>
                <Badge variant="cyan" style={{ borderColor: colors, color: colors }}>FUNDO PRETO PREMIUM</Badge>
              </div>

              {/* Simulated mini landing page in black container */}
              <div className="rounded-2xl border border-zinc-850 bg-black p-6 space-y-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-cyan-400/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="flex justify-between items-center text-xs text-zinc-500 border-b border-zinc-900 pb-4">
                  <span className="font-bold text-white tracking-widest uppercase">{businessName}</span>
                  <div className="flex gap-3">
                    {generationReport.aiOutput.navigation.slice(0, 3).map((nav, i) => (
                      <span key={i} className="hover:text-white transition-colors">{nav.label}</span>
                    ))}
                  </div>
                </div>

                <div className="py-8 space-y-4">
                  <h4 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                    {generationReport.aiOutput.landingPage.heroTitle}
                  </h4>
                  <p className="text-xs text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
                    {generationReport.aiOutput.landingPage.heroSubtitle}
                  </p>
                  <div className="pt-2">
                    <button 
                      className="px-6 py-3 rounded-xl text-xs font-bold text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                      style={{ backgroundColor: colors }}
                    >
                      {generationReport.aiOutput.landingPage.ctaText}
                    </button>
                  </div>
                </div>

                {/* Bullet list of features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left border-t border-zinc-900 pt-6">
                  {generationReport.aiOutput.landingPage.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-zinc-400">
                      <span className="text-emerald-400 mt-0.5" style={{ color: colors }}>✔️</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Dashboard tailored preview */}
            <Card className="bg-zinc-950 border border-zinc-900 p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">DASHBOARD DO INQUILINO</span>
                <Badge variant="cyan">MOCK_MIGRATION</Badge>
              </div>

              {/* Mini dashboard client interface mockup */}
              <div className="rounded-2xl border border-zinc-850 bg-black p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">CONECTADO AO FIRESTORE</span>
                    <span className="text-sm font-bold text-white">Painel da Administração</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs">
                    🦊
                  </div>
                </div>

                {/* Micro Stats inside Client App mockup */}
                <div className="grid grid-cols-3 gap-3">
                  {generationReport.aiOutput.mockData.metrics.map((met, i) => (
                    <div key={i} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">{met.label}</span>
                      <span className="text-xs font-bold text-white block mt-1">{met.value}</span>
                      <span className="text-[8px] text-emerald-400 font-bold">{met.change}</span>
                    </div>
                  ))}
                </div>

                {/* Pre-seeded catalog items list */}
                <div className="space-y-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">CATÁLOGO INICIAL (GERADO POR IA)</span>
                  <div className="space-y-2">
                    {generationReport.aiOutput.mockData.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900/20 border border-zinc-900 rounded-xl text-xs">
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-[10px] text-zinc-500 font-light truncate max-w-[200px]">{item.description}</p>
                        </div>
                        <span className="font-mono text-white font-bold shrink-0" style={{ color: colors }}>
                          R$ {item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
