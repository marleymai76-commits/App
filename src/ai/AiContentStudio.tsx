import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  Mail, 
  Compass, 
  BookOpen, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/SistenfoxDS';
import { AI_PROMPT_PRESETS, PromptPreset } from './AiPromptPresets';
import { generateContentWithAi } from './AiEngine';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function AiContentStudio() {
  const { user } = useAuth();
  const [selectedPresetId, setSelectedPresetId] = useState<string>(AI_PROMPT_PRESETS[0].id);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('elegant');

  // Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Auto-fill form fields if we have a preset
  const selectedPreset = AI_PROMPT_PRESETS.find(p => p.id === selectedPresetId);

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !description) {
      toast.error('Preencha o Nome do Negócio e a Descrição para guiar a IA.');
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedText('');
      
      const response = await generateContentWithAi({
        presetId: selectedPresetId,
        businessName,
        businessType,
        description,
        tone
      }, user?.uid || '0wRwjIHf5V1...');

      setGeneratedText(response.text);
      toast.success('Conteúdo gerado com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao comunicar com a IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    toast.success('Texto copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getPresetCategoryIcon = (category: string) => {
    switch (category) {
      case 'landing': return <Compass className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'onboarding': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="cyan" className="text-xs tracking-[0.2em] font-extrabold px-3 py-1 bg-cyan-950/40 border-cyan-400/20">
            FOX COPYWRITER STUDIO
          </Badge>
          <span className="text-zinc-600 font-mono text-xs">ONLINE AND SECURE</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-4">
          Estúdio de Conteúdo com IA
        </h1>
        <p className="text-zinc-400 text-lg font-light max-w-2xl">
          Redija copias premium e textos de onboarding sob medida para seus clientes usando prompts estrategicamente desenhados pela Sistenfox.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Preset Selector & Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-zinc-950 border border-zinc-900 p-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">Passo 1: Selecione o Modelo</span>
            
            <div className="space-y-3">
              {AI_PROMPT_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all space-y-1 ${
                      isSelected 
                        ? 'bg-zinc-900 border-cyan-400 text-white' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider">{preset.name}</span>
                      <span className="text-zinc-600">{getPresetCategoryIcon(preset.category)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-light leading-relaxed">{preset.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">Passo 2: Parâmetros do Prompt</span>
            
            <form onSubmit={handleGenerateContent} className="space-y-4">
              <Input
                label="Nome do Negócio"
                placeholder="Ex: Belle Maison Salão"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Tipo de Negócio</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-3 text-sm focus:border-cyan-400 outline-none transition-all"
                >
                  <option value="restaurant">Alimentação / Gastronomia</option>
                  <option value="store">Loja / E-commerce / Moda</option>
                  <option value="service">Agendamentos / Salões / Clínicas</option>
                  <option value="custom">Outros Serviços</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Tom de Linguagem</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-3 text-sm focus:border-cyan-400 outline-none transition-all"
                >
                  <option value="elegant">Elegante (Luxuoso e Exclusivo)</option>
                  <option value="bold">Ousado (Comercial, Impactante)</option>
                  <option value="minimalist">Minimalista (Suíço, Direto ao Ponto)</option>
                  <option value="brutalist">Tecnológico (Moderno, Futurista)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Descrição Breve do Negócio</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Salão de beleza premium com foca em tratamento capilar orgânico, mechas seguras e terapia de bem estar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl p-3 text-sm focus:border-cyan-400 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="neon"
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 group text-xs font-bold"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Escrevendo com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" /> Gerar Texto Premium
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right column: Display generated copy (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <Card className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl flex-1 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">Resultados da Redação IA</span>
                </div>
                {generatedText && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-cyan-400 transition-colors bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-xl"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                )}
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-80 space-y-4">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <div className="text-center">
                    <p className="text-sm text-white font-medium">A IA está redigindo seu material...</p>
                    <p className="text-xs text-zinc-500 font-light mt-1">Refinando a cadência, tom e formatação DSX-1</p>
                  </div>
                </div>
              ) : generatedText ? (
                <div className="bg-black/40 border border-zinc-900 rounded-2xl p-6 font-serif text-zinc-300 text-lg leading-relaxed whitespace-pre-line min-h-[300px]">
                  {generatedText}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-zinc-900 rounded-2xl text-center p-6">
                  <Sparkles className="w-10 h-10 text-zinc-700 mb-3 animate-pulse" />
                  <p className="text-sm text-zinc-500 font-light max-w-sm">
                    Configure os parâmetros do prompt no painel ao lado e clique em <strong className="text-cyan-400">"Gerar Texto Premium"</strong> para obter conteúdo exclusivo.
                  </p>
                </div>
              )}
            </div>

            {generatedText && (
              <div className="border-t border-zinc-900 pt-6 mt-6 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>MODEL: GEMINI-3.5-FLASH</span>
                <span>STATUS: PRONTO PARA IMPLEMENTAR</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
