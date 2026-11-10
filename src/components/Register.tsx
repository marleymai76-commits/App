import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, User, ChevronLeft } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebaseClient';
import { toast } from 'sonner';
import { sanitizeInput } from '../lib/utils';
import { createUserAccount } from '../services/userAccount';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const queryParams = new URLSearchParams(location.search);
  const qType = queryParams.get('type') || queryParams.get('role') || '';
  const qCompanyId = queryParams.get('companyId') || queryParams.get('establishmentId') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email);

      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: sanitizedName });

      // Determine correct role and type based on QR code scan (query params) or default to owner
      let registrationType = 'owner';
      let registrationCompanyId = `company_${Math.random().toString(36).substring(2, 10)}`;

      if (qType === 'endCustomer' || qType === 'finalCustomer') {
        registrationType = 'endCustomer';
        registrationCompanyId = qCompanyId || 'company_default';
      }

      await createUserAccount(user.uid, registrationCompanyId, registrationType);

      const finalRole = registrationType === 'owner' ? 'admin' : 'endCustomer';

      toast.success(`Cadastro realizado com sucesso!`);
        
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
            name: sanitizedName,
            email: sanitizedEmail,
            role: finalRole
          }, syncData.token, '');
        } else {
          login({
            id: user.uid,
            name: sanitizedName,
            email: sanitizedEmail,
            role: finalRole
          }, await user.getIdToken(), '');
        }
      } catch (e) {
        login({
          id: user.uid,
          name: sanitizedName,
          email: sanitizedEmail,
          role: finalRole
        }, await user.getIdToken(), '');
      }
      
      if (finalRole === 'admin') {
        navigate('/saas');
      } else {
        navigate('/final');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar cadastro');
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
          <p className="text-zinc-500 font-light text-sm">Crie sua conta de cliente</p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-cyan-400 transition-all" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu Nome"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:border-cyan-400 outline-none transition-all text-white font-light"
                  required
                />
              </div>
            </div>

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
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Senha</label>
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
                  Criar Conta
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 font-light">
              Já tem uma conta? {' '}
              <Link to="/login" className="text-cyan-400 font-bold hover:underline">Entre agora</Link>
            </p>
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
