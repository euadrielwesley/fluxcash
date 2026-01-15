
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';

const LoginPage: React.FC = () => {
  const { login, loginDemo, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Status de Conexão
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [latency, setLatency] = useState(0);

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const start = performance.now();
      try {
        // Tenta fazer um ping simples no Supabase
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

        const end = performance.now();
        setLatency(Math.round(end - start));

        // Se a tabela não existe (42P01), o supabase respondeu, então está conectado.
        if (error && error.code !== '42P01') {
          // Erros de rede (Failed to fetch) cairão no catch ou terão status específicos
          if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
            throw error;
          }
        }

        setConnectionStatus('connected');
      } catch (err) {
        console.warn('Supabase offline or invalid keys:', err);
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) throw new Error('Nome é obrigatório');
        await register(name, email, password);
        setRegistrationSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      await loginDemo();
    } catch (e) {
      setError('Erro ao iniciar modo demo.');
    }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 transition-colors relative">
        <div className="w-full max-w-md z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8 text-center"
          >
            <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verifique seu Email</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
              Enviamos um link de confirmação para <strong>{email}</strong>.<br />
              Por favor, clique no link para ativar sua conta e acessar o painel.
            </p>
            <button
              onClick={() => { setRegistrationSuccess(false); setIsLogin(true); }}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Voltar para Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 transition-colors relative">
      <div className="w-full max-w-md z-10">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="size-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-violet-500/20 mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">bolt</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">FluxCash</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Controle financeiro inteligente.</p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8 relative overflow-hidden"
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            </div>
          )}

          <div className="flex gap-4 mb-8 p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-primary transition-colors"
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-primary transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-bold text-center bg-rose-50 dark:bg-rose-900/20 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={connectionStatus === 'error'}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? 'Acessar Painel' : 'Começar Agora'}
            </button>
          </form>

          {/* DEMO BUTTON (Always visible if error, or optional) */}
          {(connectionStatus === 'error' || true) && (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 py-3 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                Entrar como Demonstração {connectionStatus === 'error' && '(Offline)'}
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-400">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Connection Status Indicator */}
      <div className="absolute bottom-6 flex flex-col items-center gap-2 animate-fade-in">
        <div className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm backdrop-blur-md transition-colors ${connectionStatus === 'connected' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' :
            connectionStatus === 'error' ? 'bg-rose-50/80 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' :
              'bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700'
          }`}>
          <div className={`size-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
              connectionStatus === 'error' ? 'bg-rose-500' :
                'bg-zinc-400 animate-bounce'
            }`}></div>
          {connectionStatus === 'connected' && `Supabase Conectado (${latency}ms)`}
          {connectionStatus === 'error' && 'Backend Desconectado'}
          {connectionStatus === 'checking' && 'Verificando Servidor...'}
        </div>
        {connectionStatus === 'error' && (
          <p className="text-[10px] text-zinc-400 max-w-xs text-center">
            Não foi possível conectar ao banco de dados. Use o modo demonstração.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
