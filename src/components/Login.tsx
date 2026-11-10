import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebaseClient';
import { toast } from 'sonner';
import { sanitizeInput } from '../lib/utils';
import TechLogo from './TechLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(email);
      const { isAdminMaster } = await import('../utils/starterFreePlan');
      const { validateStaffAccess } = await import('../services/staffService');
      
      const isMaster = isAdminMaster(sanitizedEmail);

      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      const user = userCredential.user;

      // Get user role from Firestore users collection
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebaseClient');
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let userRole: any = 'client';
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        userRole = userData.role || 'client';

        // Quando o dono faz login, atualiza lastLoginAt
        await updateDoc(userDocRef, {
          lastLoginAt: Date.now()
        });
      }

      if (isMaster) {
        userRole = 'admin';
      }

      // Verificação normal de funcionário / staff
      if (userRole === 'staff' || userRole === 'superadmin') {
        const canAccessStaff = await validateStaffAccess(sanitizedEmail);
        if (!canAccessStaff) {
          toast.error("Acesso recusado. Esta conta não possui perfil de funcionário.");
          setIsLoading(false);
          return;
        }
      }

      // Log action login
      const { logAction } = await import('../services/auditService');
      await logAction(user.uid, 'login', { email: user.email, role: userRole });
         
      // Sincroniza com o backend para gerar o cookie de refresh token
      try {
        const syncResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firebaseUser: user })
        });
        
        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          login({
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Usuário',
            email: user.email || '',
            role: userRole
          }, syncData.token, '');
        } else {
          login({
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Usuário',
            email: user.email || '',
            role: userRole
          }, await user.getIdToken(), '');
        }
      } catch (e) {
        login({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          role: userRole
        }, await user.getIdToken(), '');
      }
      
      toast.success(`Bem-vindo de volta!`);
      
      if (isMaster) {
        navigate('/admin/dashboard');
        return;
      }

      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'staff') {
        navigate('/funcionario');
      } else if (userRole === 'customer') {
        navigate('/cliente');
      } else if (userRole === 'endCustomer') {
        navigate('/final');
      } else {
        navigate('/login?erro=nao-autorizado');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-cyan-400 opacity-70 hover:opacity-100 transition-opacity z-50">
        <ChevronLeft size={16} />
        Voltar
      </Link>

      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-16 h-16 bg-cyan-400 rounded-3xl flex items-center justify-center text-black font-semibold text-3xl group-hover:rotate-12 transition-all shadow-xl shadow-cyan-400/20">🦊</div>
          </Link>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">SISTENFOX</h1>
          <p className="text-zinc-500 font-light text-sm">Acesse sua plataforma premium</p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-cyan-400 transition-all" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:border-cyan-400 outline-none transition-all text-white font-light"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Senha</label>
                <button type="button" className="text-[10px] font-bold text-cyan-400 hover:underline uppercase tracking-widest">Esqueceu?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-cyan-400 transition-all" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-4 focus:border-cyan-400 outline-none transition-all text-white font-light"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold shadow-xl shadow-cyan-400/5 hover:bg-cyan-400 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="pt-6 border-t border-zinc-800 text-center">
              <p className="text-sm text-zinc-500 font-light">
                Não tem uma conta? {' '}
                <Link to="/register" className="text-cyan-400 font-bold hover:underline">Cadastre-se agora</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
            © 2026 SISTENFOX • Todos os direitos reservados
          </p>
        </div>
      </motion.div>
    </div>
  );
}
