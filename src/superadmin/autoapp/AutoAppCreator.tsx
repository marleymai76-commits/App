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
  ChevronRight, 
  Activity, 
  Utensils, 
  ShoppingBag, 
  Calendar, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Card, Button, Input, Badge, THEME } from '../../components/SistenfoxDS';
import { AUTO_APP_TEMPLATES, AppTemplate } from './AutoAppTemplates';
import { generateAutoApp, AutoAppGenerationReport } from './AutoAppService';
import { DeployStep } from './AutoAppDeploy';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function AutoAppCreator() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('restaurant');
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [desiredDomain, setDesiredDomain] = useState('');
  const [plan, setPlan] = useState('pro');
  const [ownerEmail, setOwnerEmail] = useState('');

  // Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [deploySteps, setDeploySteps] = useState<DeployStep[]>([]);
  const [activeLog, setActiveLog] = useState<string>('');
  const [generationReport, setGenerationReport] = useState<AutoAppGenerationReport | null>(null);

  const currentTemplate = AUTO_APP_TEMPLATES.find(t => t.id === selectedTemplate) || AUTO_APP_TEMPLATES[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !businessName || !ownerEmail) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationReport(null);
      setDeploySteps([]);
      setActiveLog('Iniciando o ecossistema SISTENFOX Auto-App Engine...');

      // Run service orchestrator
      const report = await generateAutoApp(
        {
          clientName,
          businessName,
          appType: selectedTemplate,
          desiredDomain,
          plan,
          ownerEmail
        },
        user?.uid || '0wRwjIHf5V1...',
        (steps) => {
          setDeploySteps(steps);
          // Grab the running step's log for terminal view
          const running = steps.find(s => s.status === 'running');
          if (running) {
            setActiveLog(running.log);
          } else {
            const successOne = [...steps].reverse().find(s => s.status === 'success');
            if (successOne) setActiveLog(successOne.log);
          }
        }
      );

      setGenerationReport(report);
      toast.success('App do cliente criado com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro durante a geração automática do app.');
      setActiveLog(`FALHA NA COMPILAÇÃO: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils className="w-5 h-5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
      case 'Calendar': return <Calendar className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div>
        <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">
          AUTO-APP COMPILER ENGINE
        </h2>
        <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-4">
          Gerador de Apps Sistenfox
        </h1>
        <p className="text-zinc-400 text-lg font-light max-w-2xl">
          Crie, customize, configure domínios e publique PWAs inteiros em contêineres autônomos Cloud Run em menos de 10 segundos.
        </p>
      </div>

      {!generationReport && !isGenerating && (
        <form onSubmit={handleGenerate} className="space-y-10">
          {/* Step 1: Select Template */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/20 text-cyan-400 flex items-center justify-center font-bold text-xs">1</span>
              <h3 className="text-lg font-semibold text-white">Escolha o Modelo de Negócio do Cliente</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {AUTO_APP_TEMPLATES.map((template) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative group ${
                      isSelected 
                        ? 'bg-zinc-900/80 border-cyan-400 shadow-[0_4px_30px_rgba(34,211,238,0.08)]' 
                        : 'bg-zinc-950 border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div 
                        className="p-3 rounded-xl border transition-colors"
                        style={{
                          backgroundColor: isSelected ? `${template.accentColor}15` : '#18181b',
                          borderColor: isSelected ? `${template.accentColor}40` : '#27272a',
                          color: template.accentColor
                        }}
                      >
                        {getTemplateIcon(template.icon)}
                      </div>
                      {isSelected && (
                        <Badge variant="cyan" className="text-[9px]">DSX-1 ATIVO</Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-xs text-zinc-500 font-light leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Form Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/20 text-cyan-400 flex items-center justify-center font-bold text-xs">2</span>
              <h3 className="text-lg font-semibold text-white">Identidade do Cliente e Domínio</h3>
            </div>

            <Card className="bg-zinc-950 border border-zinc-900 p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome do Proprietário / Cliente"
                  placeholder="Ex: Marley Mai"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
                
                <Input
                  label="E-mail do Proprietário"
                  type="email"
                  placeholder="Ex: marley@gourmet.com"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Nome do Negócio (Exibido no App)"
                    placeholder="Ex: Gourmet Burguer ou Loja Minimal"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 block">
                    Plano de Assinatura
                  </label>
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
              </div>

              <div className="space-y-2">
                <Input
                  label="Domínio Próprio ou Subdomínio Desejado (Opcional)"
                  placeholder="Ex: gourmetburguer.com ou deixe em branco para subdomínio gratuito"
                  value={desiredDomain}
                  onChange={(e) => setDesiredDomain(e.target.value)}
                />
                <p className="text-[10px] text-zinc-600 font-light ml-1">
                  Se deixado em branco, geraremos automaticamente <span className="text-cyan-400 font-mono">nome-do-negocio.sistenfox.com</span>
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
              className="flex items-center gap-3 group"
            >
              <Sparkles className="w-5 h-5 animate-pulse" /> 
              Gerar App do Cliente
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </div>
        </form>
      )}

      {/* Generation & Build Terminal Simulation */}
      {isGenerating && (
        <Card className="bg-black border border-zinc-900 p-8 space-y-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-cyan-400/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              <div>
                <h3 className="text-lg font-bold text-white">Compilador Ativo</h3>
                <p className="text-xs text-zinc-500 font-light">SISTENFOX Auto-App Engine está provisionando serviços</p>
              </div>
            </div>
            <Badge variant="cyan" className="animate-pulse">BUILDING CONTAINER</Badge>
          </div>

          {/* Pipeline Tracker */}
          <div className="space-y-4">
            {deploySteps.map((step, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  step.status === 'running' 
                    ? 'bg-cyan-950/20 border-cyan-400/30 shadow-[0_4px_20px_rgba(34,211,238,0.03)]' 
                    : step.status === 'success'
                    ? 'bg-zinc-950 border-zinc-900 text-zinc-400'
                    : 'bg-zinc-950/20 border-zinc-950 text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border font-mono text-xs ${
                    step.status === 'running'
                      ? 'border-cyan-400 text-cyan-400 animate-pulse'
                      : step.status === 'success'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-zinc-800 text-zinc-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-sm font-semibold ${step.status === 'running' ? 'text-white' : ''}`}>
                    {step.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {step.status === 'running' && (
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                  )}
                  <span className={`text-xs font-mono font-light uppercase tracking-wider ${
                    step.status === 'running'
                      ? 'text-cyan-400 font-semibold'
                      : step.status === 'success'
                      ? 'text-emerald-400 font-semibold'
                      : 'text-zinc-600'
                  }`}>
                    {step.status === 'running' ? 'Executando' : step.status === 'success' ? 'Sucesso' : 'Aguardando'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time terminal output log */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 font-mono text-xs text-cyan-400 space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>TERMINAL DE SAÍDA DE LOGS (SYSTEM_TELEMETRY)</span>
            </div>
            <div className="space-y-1.5 leading-relaxed font-light">
              <p className="text-zinc-500">[SYSTEM] Initializing client container mapping for "{businessName}"...</p>
              <p className="text-zinc-500">[BUILD] Using model config from template: {selectedTemplate}</p>
              <p className="text-zinc-500">[DATABASE] Connecting to active Firestore Cluster...</p>
              <p className="text-cyan-300 font-medium">&gt;&gt; {activeLog}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Success / Report Preview Section */}
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
                  <h3 className="text-2xl font-extrabold text-white">App Criado com Sucesso!</h3>
                  <p className="text-xs text-zinc-500 font-light">
                    O ecossistema foi provisionado e publicado sob as diretrizes de design DSX-1
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
                  Criar Novo App
                </Button>
              </div>
            </div>

            {/* Quick Metrics of Generation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">CLIENTE ID</span>
                <span className="text-sm font-mono font-semibold text-white">{generationReport.clientId}</span>
              </div>
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">URL DO DOMÍNIO</span>
                <span className="text-xs font-mono font-semibold text-cyan-400 truncate block">{generationReport.domainConfig.domain}</span>
              </div>
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">REGISTROS INSERIDOS</span>
                <span className="text-sm font-semibold text-white">{generationReport.dbResult.recordsInserted} registros</span>
              </div>
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">TEMPO DE COMPILAÇÃO</span>
                <span className="text-sm font-semibold text-emerald-400">{(generationReport.deployResult.buildTimeMs / 1000).toFixed(2)}s</span>
              </div>
            </div>
          </Card>

          {/* Premium Preview of Landing Page and Client Panel Mockups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Landing Page Premium Preview */}
            <Card className="bg-zinc-950 border border-zinc-900 p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">PREVIEW LANDING PAGE CLIENTE</span>
                <Badge variant="cyan">DSX-1 ATIVO</Badge>
              </div>

              {/* Simulated mini landing page in black/neon container */}
              <div className="rounded-2xl border border-zinc-850 bg-black p-6 space-y-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-cyan-400/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="flex justify-between items-center text-xs text-zinc-500 border-b border-zinc-900 pb-4">
                  <span className="font-bold text-white tracking-widest uppercase">{businessName}</span>
                  <div className="flex gap-3">
                    {currentTemplate.navigation.slice(0, 3).map((nav, i) => (
                      <span key={i} className="hover:text-white transition-colors">{nav.label}</span>
                    ))}
                  </div>
                </div>

                <div className="py-8 space-y-4">
                  <h4 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                    {currentTemplate.landingPage.heroTitle}
                  </h4>
                  <p className="text-xs text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
                    {currentTemplate.landingPage.heroSubtitle}
                  </p>
                  <div className="pt-2">
                    <button 
                      className="px-6 py-3 rounded-xl text-xs font-bold text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                      style={{ backgroundColor: currentTemplate.accentColor }}
                    >
                      {currentTemplate.landingPage.ctaText}
                    </button>
                  </div>
                </div>

                {/* Bullet list of features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left border-t border-zinc-900 pt-6">
                  {currentTemplate.landingPage.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-zinc-400">
                      <span className="text-emerald-400 mt-0.5">✔️</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Dashboard / Panel Client Preview */}
            <Card className="bg-zinc-950 border border-zinc-900 p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">CLIENT METRICS & PRODUCTS</span>
                <Badge variant="cyan">FIREBASE SYNC</Badge>
              </div>

              {/* Mini dashboard client interface mockup */}
              <div className="rounded-2xl border border-zinc-850 bg-black p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">SISTENFOX ENGINE</span>
                    <span className="text-sm font-bold text-white">Painel do Cliente</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs">
                    🦊
                  </div>
                </div>

                {/* Micro Stats inside Client App mockup */}
                <div className="grid grid-cols-3 gap-3">
                  {currentTemplate.mockData.metrics.map((met, i) => (
                    <div key={i} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">{met.label}</span>
                      <span className="text-xs font-bold text-white block mt-1">{met.value}</span>
                      <span className="text-[8px] text-emerald-400 font-bold">{met.change}</span>
                    </div>
                  ))}
                </div>

                {/* Items preloaded list */}
                <div className="space-y-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">PRODUTOS PRÉ-CARREGADOS (MOCK_ITEMS)</span>
                  <div className="space-y-2">
                    {currentTemplate.mockData.items.slice(0, 2).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900/20 border border-zinc-900 rounded-xl text-xs">
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-[10px] text-zinc-500 font-light">{item.category}</p>
                        </div>
                        <span className="font-mono text-white font-bold" style={{ color: currentTemplate.accentColor }}>
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
