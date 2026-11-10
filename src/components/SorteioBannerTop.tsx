import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { Link, useLocation } from 'react-router-dom';
import { Gift } from 'lucide-react';

function formatarDataCurta(dataStr?: string | number | null): string {
  if (!dataStr) return '01/07';
  if (typeof dataStr === 'number') {
    return new Date(dataStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  const parts = String(dataStr).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return String(dataStr);
}

export function SorteioBannerTop() {
  const [total, setTotal] = useState(10);
  const [sorteados, setSorteados] = useState(0);
  const [inicio, setInicio] = useState('2027-07-01');
  const location = useLocation();

  useEffect(() => {
    let unsubscribe = () => {};

    // 1. Fetch initial public data immediately from API
    fetch('/api/sorteio/public-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.config) {
          if (typeof data.config.total === 'number') setTotal(data.config.total);
          if (typeof data.config.sorteados === 'number') setSorteados(data.config.sorteados);
          if (data.config.inicio) setInicio(data.config.inicio);
        }
      })
      .catch(() => {});

    // 2. Real-time updates via Firestore
    try {
      const configRef = doc(db, 'appConfig', 'sorteioVitalicio');
      unsubscribe = onSnapshot(
        configRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (typeof data.total === 'number') setTotal(data.total);
            if (typeof data.sorteados === 'number') setSorteados(data.sorteados);
            if (data.inicio) setInicio(data.inicio);
          }
        },
        (error) => {
          console.warn('Aviso ao sincronizar banner do sorteio:', error?.message || error);
        }
      );
    } catch (e: any) {
      console.warn('Aviso de conexão do banner do sorteio:', e?.message || e);
    }

    return () => unsubscribe();
  }, []);

  const restantes = Math.max(0, total - sorteados);

  // If the user is already on the raffle landing page or specific areas, hide it
  if (location.pathname === '/sorteio' || location.pathname === '/admin/sorteio-vitalicio' || location.pathname.includes('sorteio-vitalicio')) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[9999]">
      <div className="fixed top-0 left-0 w-full bg-[#0f0f0f] border-b border-[#ffb300] py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Gift className="text-[#ffb300] animate-pulse shrink-0" size={18} />
            <span className="font-bold text-[#ffb300] text-xs sm:text-base md:text-lg">
              🎁 Sorteio Vitalício — Restantes: {restantes} • Próximo sorteio: {formatarDataCurta(inicio)}
            </span>
          </div>

          <Link
            to="/sorteio"
            className="bg-[#ffb300] text-black font-bold text-xs sm:text-sm px-4 py-2 rounded-lg hover:bg-[#e6c75f] transition shrink-0"
          >
            Participar
          </Link>
        </div>
      </div>
    </div>
  );
}

