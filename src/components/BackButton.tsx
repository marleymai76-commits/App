import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../lib/store';

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const path = location.pathname.replace(/\/$/, '');
  const isAtDashboardRoot = path === '/dashboard' || 
    path === '/admin' || 
    path === '/manager' || 
    path === '/waiter' || 
    path === '/kitchen' || 
    path === '/cashier' || 
    path === '/client';

  if (isAtDashboardRoot) {
    return null;
  }

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      const rootPath = user ? `/${user.role}` : '/dashboard';
      navigate(rootPath);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleBack}
      className="flex items-center gap-2.5 px-4 py-2 mt-6 mb-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] border border-[#E2E8F0] shadow-sm dark:bg-gold/10 dark:hover:bg-gold/20 dark:text-gold dark:border-gold/20 transition-all group w-fit font-bold"
      aria-label="Voltar"
    >
      <div className="p-1.5 rounded-lg bg-slate-200 group-hover:bg-slate-300 text-[#0F172A] dark:bg-gold/10 dark:group-hover:bg-gold/20 dark:text-gold transition-colors">
        <ArrowLeft size={18} />
      </div>
      <span className="text-sm font-bold uppercase tracking-widest text-[#0F172A] dark:text-gold">Voltar</span>
    </motion.button>
  );
}
