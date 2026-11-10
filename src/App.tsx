import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebaseClient';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Versions from './components/Versions';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Pagamento from './components/Pagamento';
import Wizard from './components/Wizard';
import { useThemeStore, useAuthStore, UserRole } from './lib/store';
import { initGA, trackPageView } from './services/analytics';

import SaaSFlow from './components/SaaSFlow';
import SistenfoxWidget from './components/SistenfoxWidget';
import QualityPanel from './components/QualityPanel';
import { sfx_checkTrial } from './lib/trial';
import { AuthProvider, useAuth } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import SuperAdminRoutes from './superadmin/routes/SuperAdminRoutes';
import SorteioLanding from './components/SorteioLanding';
import { SorteioBannerTop } from './components/SorteioBannerTop';
import TrialStatusBanner from './components/TrialStatusBanner';
import OfflineStatusIndicator from './components/OfflineStatusIndicator';
import PWAInstallBanner from './components/PWAInstallBanner';
import DownloadAndroidPage from './components/DownloadAndroidPage';

function BlockedBlocker() {
  const { isBlocked, blockReason, user, refreshUserStatus, logout } = useAuth();
  const [reactivating, setReactivating] = useState(false);
  const location = useLocation();

  if (!user || !isBlocked) return null;

  // Permite visualizar a página inicial ou login/register sem bloqueio
  if (['/', '/login', '/register'].includes(location.pathname)) {
    return null;
  }

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        isBlocked: false,
        blockReason: null,
        lastLoginAt: Date.now()
      });
      await refreshUserStatus();
      
      const { logAction } = await import('./services/auditService');
      await logAction(user.uid, 'reactivation', { email: user.email });

      toast.success("Sua conta foi reativada com sucesso! Bem-vindo de volta.");
    } catch (error: any) {
      console.error("Erro ao reativar conta:", error);
      toast.error("Ocorreu um erro ao tentar reativar sua conta.");
    } finally {
      setReactivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999999] bg-black/95 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-[#0f0f0f] border border-[#d4af37] p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        
        <div className="w-20 h-20 bg-red-950/50 border border-red-500/30 text-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-red-950/20">
          🔒
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-white mb-4">
          Sua conta foi bloqueada por inatividade.
        </h2>
        
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          {blockReason ? `Motivo: ${blockReason}` : 'Por favor, reative sua conta para prosseguir.'}
          <br />
          <span className="text-zinc-500 text-xs mt-2 block">Faça login para reativar.</span>
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleReactivate}
            disabled={reactivating}
            className="w-full bg-[#d4af37] text-black font-bold py-3 px-4 rounded-xl hover:bg-[#e6c75f] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/10"
          >
            {reactivating ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              'Reativar conta'
            )}
          </button>
          
          <button 
            onClick={() => logout()}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { theme, accent, initSystemListener } = useThemeStore();
  const location = useLocation();

  // Listen to operating system prefers-color-scheme changes automatically
  useEffect(() => {
    const cleanup = initSystemListener();
    return () => {
      cleanup?.();
    };
  }, [initSystemListener]);

  // Initialize Google Analytics on mount
  useEffect(() => {
    initGA();
  }, []);

  // Track page view automatically when the URL path or search parameters change
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-accent', accent);
    root.style.colorScheme = theme;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#F8FAFC');
    }
  }, [theme, accent]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      <OfflineStatusIndicator />
      <SorteioBannerTop />
      <TrialStatusBanner />
      <BlockedBlocker />
      {children}
      <SistenfoxWidget />
      <PWAInstallBanner />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they try to access unauthorized area
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Versions />
      <Pricing />
      <Footer />
    </>
  );
}

import { DashboardSkeleton } from './components/DashboardSkeleton';

function AppContent() {
  const { loading } = useAuth();
  
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen hero-gradient bg-app text-app transition-colors duration-300">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/baixar-app" element={<DownloadAndroidPage />} />
            <Route path="/download" element={<DownloadAndroidPage />} />
            <Route path="/android" element={<DownloadAndroidPage />} />
            <Route path="/app-offline" element={<DownloadAndroidPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pagamento" element={<Pagamento />} />
            <Route path="/sorteio" element={<SorteioLanding />} />
            <Route path="/wizard/:appId" element={<Wizard />} />
            <Route path="/saas" element={<SaaSFlow onComplete={() => {
              window.location.href = '/admin';
            }} />} />
            <Route path="/global/quality" element={<RequireAuth allowedRoles={['admin']}><QualityPanel /></RequireAuth>} />
            <Route path="/super-admin/*" element={<RequireAuth allowedRoles={['admin']}><SuperAdminRoutes /></RequireAuth>} />
            <Route path="/superadmin/*" element={<Navigate to="/super-admin" replace />} />
            <Route path="/dashboard/settings" element={<Navigate to="/admin/settings" replace />} />
            <Route path="/dashboard/profile" element={<Navigate to="/admin/profile" replace />} />
            
            {/* Role-based Dashboards */}
            <Route path="/admin/*" element={<RequireAuth allowedRoles={['admin']}><Dashboard /></RequireAuth>} />
            <Route path="/funcionario/*" element={<RequireAuth allowedRoles={['staff']}><Dashboard /></RequireAuth>} />
            <Route path="/cliente/*" element={<RequireAuth allowedRoles={['customer']}><Dashboard /></RequireAuth>} />
            <Route path="/final/*" element={<RequireAuth allowedRoles={['endCustomer']}><Dashboard /></RequireAuth>} />
            <Route path="/manager/*" element={<RequireAuth allowedRoles={['admin', 'manager']}><Dashboard /></RequireAuth>} />
            <Route path="/waiter/*" element={<RequireAuth allowedRoles={['admin', 'manager', 'waiter']}><Dashboard /></RequireAuth>} />
            <Route path="/kitchen/*" element={<RequireAuth allowedRoles={['admin', 'kitchen']}><Dashboard /></RequireAuth>} />
            <Route path="/cashier/*" element={<RequireAuth allowedRoles={['admin', 'cashier']}><Dashboard /></RequireAuth>} />
            <Route path="/client/*" element={<RequireAuth allowedRoles={['client']}><Dashboard /></RequireAuth>} />
            
            {/* Legacy/Fallback */}
            <Route path="/dashboard/*" element={<RequireAuth><Dashboard /></RequireAuth>} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", "verde_tech");
    root.classList.remove("dark");
    root.style.backgroundColor = "";
    root.style.color = "";
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
