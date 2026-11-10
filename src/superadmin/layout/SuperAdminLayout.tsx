import React, { useState } from 'react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import { FoxSignature } from '../../components/SistenfoxDS';
import { Menu, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex relative overflow-x-hidden">
      {/* Sidebar (Desktop) */}
      <div className="hidden lg:block shrink-0">
        <SuperAdminSidebar />
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar (Mobile drawer) */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-zinc-950 border-r border-zinc-900 z-50 transform transition-transform duration-300 lg:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SuperAdminSidebar />
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 min-h-screen flex flex-col lg:pl-72">
        {/* Mobile Top Header */}
        <header className="lg:hidden h-20 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <FoxSignature size="sm" />
            <div>
              <span className="text-white font-bold tracking-widest text-sm block">SISTENFOX</span>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">SUPER ADMIN</span>
            </div>
          </div>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-zinc-400 hover:text-white"
            aria-label="Toggle Sidebar Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Global Super Admin Banner */}
        <div className="hidden lg:flex px-8 h-20 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-zinc-400">
            <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Painel Sistêmico Centralizado</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-semibold text-white block">Sistenfox Super Admin</span>
              <span className="text-[10px] text-zinc-500 block font-light">{user?.email || 'master@sistenfox.com'}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 text-sm shadow-md shadow-cyan-400/5 select-none">
              SA
            </div>
          </div>
        </div>

        {/* Dynamic Content wrapper with global glow background */}
        <main className="flex-1 p-6 md:p-8 lg:p-12 relative overflow-y-auto">
          {/* Subtle Cyberpunk grid/ambient light */}
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-cyan-400/5 blur-[120px] rounded-full pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-cyan-400/3 blur-[120px] rounded-full pointer-events-none z-0" />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
