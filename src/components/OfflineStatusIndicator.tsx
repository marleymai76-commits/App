import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OfflineStatusIndicator() {
  const { isOnline, backOnlineNotice } = useOnlineStatus();

  if (isOnline && !backOnlineNotice) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999999] pointer-events-none flex justify-center px-4 pt-2">
      {!isOnline && (
        <div className="pointer-events-auto bg-amber-950/90 border border-amber-500/40 text-amber-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-fadeIn">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Modo Offline Ativo:</strong> O app está funcionando localmente no seu Android sem internet.
          </span>
        </div>
      )}

      {backOnlineNotice && (
        <div className="pointer-events-auto bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-fadeIn">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Conexão restabelecida!</strong> Sincronizando dados em segundo plano...
          </span>
        </div>
      )}
    </div>
  );
}
