import React, { useState } from 'react';
import { Download, X, Smartphone, WifiOff, Sparkles, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const { canInstall, isInstalled, isAndroid, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
    }
    return false;
  });
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already installed or dismissed this session, don't show the persistent bottom bar
  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleInstallClick = async () => {
    if (canInstall) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setDismissed(true);
      }
    } else {
      // Show instructions for manual home screen install on Android Chrome
      setShowAndroidGuide(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[999999] animate-slideUp">
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none" />

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
            title="Fechar aviso"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black flex-shrink-0 shadow-lg shadow-amber-500/20">
              <Smartphone className="w-6 h-6 text-black" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Android & Offline
                </span>
                <span className="text-zinc-400 text-xs flex items-center gap-1">
                  <WifiOff className="w-3 h-3 text-amber-400" /> 100% Offline
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1">
                Instale o App no seu Android
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5 leading-snug">
                Acesse mesmo sem sinal de internet ou Wi-Fi com velocidade nativa e tela cheia.
              </p>
              <a 
                href="/baixar-app"
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline mt-1.5 inline-block"
              >
                Ver recursos offline por assinatura →
              </a>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              {canInstall ? 'Instalar no Android' : 'Como Instalar no Android'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>

      {showAndroidGuide && (
        <div className="fixed inset-0 z-[9999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl relative">
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Instalar no Chrome do Android
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Siga estes 2 passos rápidos para ter o app direto na sua tela inicial:
            </p>

            <ol className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  1
                </span>
                <span>Toque no ícone de <strong>três pontos (⋮)</strong> no canto superior direito do Google Chrome.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  2
                </span>
                <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  <Check className="w-3 h-3 text-black" />
                </span>
                <span>Pronto! O ícone dourado do Sistenfox estará na gaveta de aplicativos e funcionará 100% offline.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full mt-6 bg-amber-400 hover:bg-amber-300 text-black font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
