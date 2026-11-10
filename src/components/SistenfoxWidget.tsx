import React, { useState, useEffect } from 'react';
import { sfx_checkTrial, TrialStatus } from '../lib/trial';

// Informações de contato (Portugal)
const SISTENFOX_CONTATO = {
  telefone: "+351 928332154",
  whatsapp: "https://wa.me/351928332154", // link direto para WhatsApp
  localizacao: "Lisboa, Portugal",
  email: "contato@sistenfox.pt",
  infoIcon: "/assets/icons/info.svg" // ícone para abrir modal de informações
};

export default function SistenfoxWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);

  useEffect(() => {
    const update = () => {
      setTrialStatus(sfx_checkTrial());
    };
    update();
    window.addEventListener('sfx_trial_updated', update);
    return () => window.removeEventListener('sfx_trial_updated', update);
  }, []);

  if (!trialStatus) return null;

  return (
    <>
      {/* Container */}
      <div className="fixed bottom-[22px] right-[22px] z-[999999999] flex flex-col items-end font-sans">
        
        {/* Menu */}
        <div 
          className="bg-zinc-950 border border-zinc-800 rounded-3xl mb-[10px] p-[10px] shadow-2xl flex flex-col gap-[8px] min-w-[210px]"
          style={{ display: isOpen ? 'flex' : 'none' }}
        >
          {trialStatus.ativo ? (
            <div className="bg-cyan-950/40 border border-cyan-500/30 px-[14px] py-[10px] rounded-2xl text-zinc-300 text-[13px] font-medium">
              <span className="text-cyan-400 font-bold block mb-0.5">Plano Maior Liberado</span>
              <strong>Teste 30 Dias:</strong> {trialStatus.diasRestantes} {trialStatus.diasRestantes === 1 ? 'dia restante' : 'dias restantes'}
            </div>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-500/30 px-[14px] py-[10px] rounded-2xl text-emerald-300 text-[12px] font-medium text-center">
              <span className="font-bold block text-white text-[13px] mb-0.5">Plano Gratuito (Starter)</span>
              App ativo e operacional
            </div>
          )}

          <a 
            href={SISTENFOX_CONTATO.whatsapp} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-400/30 px-[14px] py-[10px] rounded-2xl text-zinc-300 hover:text-cyan-400 text-[14px] cursor-pointer transition-all duration-200 block no-underline font-medium text-center"
          >
            WhatsApp
          </a>

          <div 
            onClick={() => {
              setShowModal(true);
              setIsOpen(false);
            }}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-400/30 px-[14px] py-[10px] rounded-2xl text-zinc-300 hover:text-cyan-400 text-[14px] cursor-pointer transition-all duration-200 block font-medium text-center"
          >
            Informações
          </div>

          <div 
            onClick={() => {
              console.log("Abrindo suporte Sistenfox");
              setIsOpen(false);
            }}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-400/30 px-[14px] py-[10px] rounded-2xl text-zinc-300 hover:text-cyan-400 text-[14px] cursor-pointer transition-all duration-200 block font-medium text-center"
          >
            Suporte Sistenfox
          </div>

          {!trialStatus.ativo && (
            <a 
              href="/#pricing" 
              className="px-[14px] py-[10px] rounded-2xl text-[13px] cursor-pointer transition-all duration-200 block no-underline text-center font-bold bg-[#ffb300]/15 hover:bg-[#ffb300]/25 border border-[#ffb300]/40 text-[#ffb300]"
            >
              Upgrade com 70% OFF (2 Anos)
            </a>
          )}
        </div>

        {/* Bubble */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-cyan-400 text-black w-[58px] h-[58px] rounded-full flex justify-center items-center cursor-pointer shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95 text-[26px]"
        >
          🦊
        </div>
      </div>

      {/* Modal */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-black/75 backdrop-blur-sm flex justify-center items-center z-[999999999] font-sans"
        style={{ display: showModal ? 'flex' : 'none' }}
      >
        <div className="bg-zinc-950 border border-zinc-800 p-[30px] rounded-3xl w-[90%] max-w-[400px] shadow-2xl">
          <div className="flex items-center gap-3 mb-[20px]">
            <div className="w-10 h-10 bg-cyan-400 rounded-2xl flex items-center justify-center text-black font-semibold text-lg">🦊</div>
            <h2 className="text-[22px] font-bold text-white">Contato Sistenfox</h2>
          </div>

          <div className="space-y-[14px] text-[15px] text-zinc-300">
            <p className="border-b border-zinc-900 pb-[10px]"><strong>📍 Localização:</strong> <span className="text-zinc-400">{SISTENFOX_CONTATO.localizacao}</span></p>
            <p className="border-b border-zinc-900 pb-[10px]"><strong>📞 Telefone:</strong> <span className="text-zinc-400">{SISTENFOX_CONTATO.telefone}</span></p>
            <p className="border-b border-zinc-900 pb-[10px]"><strong>📧 Email:</strong> <span className="text-zinc-400">{SISTENFOX_CONTATO.email}</span></p>

            <div className="mt-[20px]">
              <p className="mb-[8px]"><strong>💬 WhatsApp Direct:</strong></p>
              <a 
                href={SISTENFOX_CONTATO.whatsapp} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white hover:bg-zinc-100 px-[14px] py-[12px] rounded-2xl text-black text-[15px] cursor-pointer transition-all duration-200 block no-underline text-center font-bold shadow-lg"
              >
                Falar no WhatsApp
              </a>
            </div>

            <p className="mt-[15px] text-[13px] text-zinc-500 italic">
              Atendimento híbrido: bot inteligente + equipa Sistenfox.
            </p>
          </div>

          <button 
            onClick={() => setShowModal(false)}
            className="mt-[20px] py-3.5 w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-400/20 text-zinc-300 hover:text-white rounded-2xl cursor-pointer text-[15px] transition-all font-bold"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}
