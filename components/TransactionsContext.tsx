
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Transaction, CreditCard, FinancialGoal, UserProfile, AIRule, Debt, Mission } from '../types';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

interface TransactionsContextType {
  transactions: Transaction[];
  cards: CreditCard[];
  goals: FinancialGoal[];
  debts: Debt[];
  userProfile: UserProfile;
  aiRules: AIRule[];
  customCategories: string[];
  activeMissions: Mission[]; // Nova propriedade exposta

  balance: number;
  income: number;
  expenses: number;
  currentDate: Date;
  isDataLoading: boolean;
  privacyMode: boolean;

  togglePrivacy: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  addCard: (card: Omit<CreditCard, 'id'>) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string | number, updated: Partial<Debt>) => void;

  updateProfile: (data: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  grantXP: (amount: number, reason?: string) => void;
  completeMission: (missionId: string) => void; // Ação de completar missão
  addAIRule: (keyword: string, category: string) => void;
  removeAIRule: (id: string) => void;
  addCustomCategory: (category: string) => void;

  nextMonth: () => void;
  prevMonth: () => void;
  setCurrentDate: (date: Date) => void;
  exportData: (format: 'json' | 'csv') => void;
  resetData: () => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Moradia', 'Educação', 'Receita', 'Dívidas'];

export const TransactionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { pushNotification } = useNotification();
  const { user, isDemo } = useAuth();

  // --- STATE ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [aiRules, setAiRules] = useState<AIRule[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]); // Track completed mission IDs locally for the session/day

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  // Sync Local Profile with Auth User initially
  useEffect(() => {
    if (user) setLocalProfile(user);
  }, [user]);

  // STALE-WHILE-REVALIDATE PATTERN
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCards([]);
      setGoals([]);
      setDebts([]);
      return;
    }

    // DEMO MODE
    if (isDemo) {
      setIsDataLoading(true);
      setTimeout(() => {
        setTransactions([]);
        setCards([]);
        setGoals([]);
        setDebts([]);
        setAiRules([]);
        setIsDataLoading(false);
      }, 300);
      return;
    }

    // PRODUCTION: Load Cache -> Then Fetch
    const loadData = async () => {
      // 1. Load from Cache (Instant)
      try {
        const cachedTx = localStorage.getItem(`flux_tx_${user.id}`);
        const cachedCards = localStorage.getItem(`flux_cards_${user.id}`);
        const cachedGoals = localStorage.getItem(`flux_goals_${user.id}`);
        const cachedDebts = localStorage.getItem(`flux_debts_${user.id}`);
        const cachedProfile = localStorage.getItem(`flux_profile_${user.id}`);

        if (cachedTx) setTransactions(JSON.parse(cachedTx));
        if (cachedCards) setCards(JSON.parse(cachedCards));
        if (cachedGoals) setGoals(JSON.parse(cachedGoals));
        if (cachedDebts) setDebts(JSON.parse(cachedDebts));
        if (cachedProfile) setLocalProfile(JSON.parse(cachedProfile));
      } catch (e) {
        console.warn('Cache error', e);
      }

      // 2. Background Fetch (Single Single Source of Truth)
      if (transactions.length === 0) setIsDataLoading(true);

      try {
        const [txRes, cardsRes, goalsRes, debtsRes, rulesRes, profileRes] = await Promise.all([
          supabase.from('transactions').select('*').order('date_iso', { ascending: false }).limit(300),
          supabase.from('credit_cards').select('*'),
          supabase.from('financial_goals').select('*'),
          supabase.from('debts').select('*'),
          supabase.from('ai_rules').select('*'),
          supabase.from('profiles').select('*').eq('id', user.id).single()
        ]);

        if (txRes.data) {
          const mappedTx = txRes.data.map(t => ({
            id: t.id, title: t.title, amount: Number(t.amount), type: t.type, category: t.category, account: t.account, dateIso: t.date_iso, isRecurring: t.is_recurring, installment: t.installment, icon: t.icon, colorClass: t.color_class
          }));
          setTransactions(mappedTx);
          localStorage.setItem(`flux_tx_${user.id}`, JSON.stringify(mappedTx));
        }

        if (cardsRes.data) {
          const mappedCards = cardsRes.data.map(c => ({
            id: c.id, name: c.name, brand: c.brand, limit: Number(c.limit), bill: Number(c.bill), color: c.color, dueDate: c.due_date, lastDigits: c.last_digits
          }));
          setCards(mappedCards);
          localStorage.setItem(`flux_cards_${user.id}`, JSON.stringify(mappedCards));
        }

        if (goalsRes.data) {
          const mappedGoals = goalsRes.data.map(g => ({
            id: g.id, name: g.name, target: Number(g.target), current: Number(g.current), deadline: g.deadline, icon: g.icon, color: g.color
          }));
          setGoals(mappedGoals);
          localStorage.setItem(`flux_goals_${user.id}`, JSON.stringify(mappedGoals));
        }

        if (debtsRes.data) {
          const mappedDebts = debtsRes.data.map(d => ({
            id: d.id, name: d.name, bank: d.bank, total_installments: d.total_installments, paid_installments: d.paid_installments, original_debt: Number(d.original_debt), current_balance: Number(d.current_balance), value_parcel: Number(d.value_parcel), color: d.color
          }));
          setDebts(mappedDebts);
          localStorage.setItem(`flux_debts_${user.id}`, JSON.stringify(mappedDebts));
        }

        if (rulesRes.data) setAiRules(rulesRes.data);

        if (profileRes.data) {
          const updatedProfile = { ...localProfile!, xp: profileRes.data.xp, level: profileRes.data.level, hasOnboarding: profileRes.data.has_onboarding, plan: { ...localProfile?.plan, name: profileRes.data.plan_name || 'Free' } };
          setLocalProfile(updatedProfile);
          localStorage.setItem(`flux_profile_${user.id}`, JSON.stringify(updatedProfile));
        }

      } catch (error) {
        console.error("Supabase Sync Error:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [user, isDemo]);

  // --- ACTIONS ---
  const togglePrivacy = useCallback(() => setPrivacyMode(prev => !prev), []);

  const grantXP = useCallback(async (amount: number, reason?: string) => {
    if (!user) return;
    const newXp = (localProfile?.xp || 0) + amount;
    const newLevel = Math.floor(newXp / 500) + 1;
    setLocalProfile(prev => prev ? { ...prev, xp: newXp, level: newLevel } : null);
    if (!isDemo) {
      await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('id', user.id);
      if (reason) await supabase.from('xp_history').insert({ user_id: user.id, amount, reason });
    }
    if (newLevel > (localProfile?.level || 1)) {
      pushNotification({ title: 'Level Up!', message: `Você alcançou o nível ${newLevel}!`, type: 'success', category: 'gamification' });
    }
  }, [user, localProfile, isDemo, pushNotification]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    setLocalProfile(prev => prev ? { ...prev, hasOnboarding: true } : null);
    if (!isDemo) await supabase.from('profiles').update({ has_onboarding: true }).eq('id', user.id);
  }, [user, isDemo]);

  // --- CORE LOGIC: ACTIVE MISSIONS ---
  const isSameMonth = (dateIso: string | undefined) => {
    if (!dateIso) return false;
    const d = new Date(dateIso);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  };

  const income = transactions.filter(t => t.type === 'income' && isSameMonth(t.dateIso)).reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense' && isSameMonth(t.dateIso)).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const balance = transactions.reduce((acc, t) => acc + t.amount, 0);

  const activeMissions = useMemo(() => {
    const missions: Mission[] = [];
    const today = new Date();

    // 1. Daily Log
    const hasTxToday = transactions.some(t => {
      if (!t.dateIso) return false;
      const d = new Date(t.dateIso);
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });

    missions.push({
      id: 'daily_log',
      title: 'Check-in da Riqueza',
      desc: 'Milionários sabem para onde vai cada centavo. Registre 1 movimentação hoje.',
      category: 'Hábito',
      xp: 100,
      type: 'habit',
      icon: 'edit_square',
      color: 'from-blue-600 to-indigo-600',
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      textColor: 'text-blue-600 dark:text-blue-400',
      isCompleted: hasTxToday || completedMissions.includes('daily_log'),
      actionLabel: 'Registrar Agora'
    });

    // 2. Spending Brake
    if (expenses > (income * 0.4) && income > 0) {
      missions.push({
        id: 'defense_mode',
        title: 'Modo Defesa Ativo',
        desc: 'Você atingiu 40% da renda mensal. A missão é: "Gasto Zero" hoje.',
        category: 'Proteção',
        xp: 250,
        type: 'saving',
        icon: 'shield_lock',
        color: 'from-amber-500 to-orange-600',
        bg: 'bg-amber-50 dark:bg-amber-900/10',
        textColor: 'text-amber-600 dark:text-amber-400',
        isCompleted: completedMissions.includes('defense_mode'),
        actionLabel: 'Confirmar Economia'
      });
    }

    // 3. Invest
    if (balance > 500) {
      missions.push({
        id: 'invest_now',
        title: 'O Dinheiro não Dorme',
        desc: `Capital livre detectado. Invista R$ 100 em uma meta ou CDB.`,
        category: 'Ataque',
        xp: 500,
        type: 'investing',
        icon: 'rocket_launch',
        color: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        isCompleted: completedMissions.includes('invest_now'),
        actionLabel: 'Ver Carteira'
      });
    }

    // 4. Education (Always present fallback)
    missions.push({
      id: 'review_week',
      title: 'Visão de Águia',
      desc: 'Abra a aba "Analytics" e analise sua maior categoria de gasto.',
      category: 'Sabedoria',
      xp: 150,
      type: 'learning',
      icon: 'query_stats',
      color: 'from-violet-600 to-purple-600',
      bg: 'bg-violet-50 dark:bg-violet-900/10',
      textColor: 'text-violet-600 dark:text-violet-400',
      isCompleted: completedMissions.includes('review_week'),
      actionLabel: 'Ir para Analytics'
    });

    return missions;
  }, [transactions, income, expenses, balance, completedMissions]);

  const completeMission = useCallback((missionId: string) => {
    const mission = activeMissions.find(m => m.id === missionId);
    if (mission && !mission.isCompleted) {
      setCompletedMissions(prev => [...prev, missionId]);
      grantXP(mission.xp, `Missão: ${mission.title}`);
    }
  }, [activeMissions, grantXP]);

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id'>) => {
    if (!user) return;
    let finalCategory = data.category;
    if (finalCategory === 'Geral' || !finalCategory) {
      const lowerTitle = data.title.toLowerCase();
      const matchedRule = aiRules.find(r => lowerTitle.includes(r.keyword.toLowerCase()));
      if (matchedRule) finalCategory = matchedRule.category;
    }
    const tempId = crypto.randomUUID();
    const newTx: Transaction = { ...data, id: tempId, category: finalCategory, dateIso: data.dateIso || new Date().toISOString() };
    setTransactions(prev => [newTx, ...prev]);
    grantXP(10, 'Nova Transação');
    if (!isDemo) {
      const newTxPayload = { user_id: user.id, title: data.title, amount: data.amount, type: data.type, category: finalCategory, account: data.account, date_iso: newTx.dateIso, is_recurring: data.isRecurring || false, installment: data.installment, icon: data.icon, color_class: data.colorClass };
      const { data: inserted, error } = await supabase.from('transactions').insert(newTxPayload).select().single();
      if (inserted) setTransactions(prev => prev.map(t => t.id === tempId ? { ...t, id: inserted.id } : t));
    }
  }, [user, aiRules, isDemo, grantXP]);

  const removeTransaction = useCallback(async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (!isDemo) await supabase.from('transactions').delete().eq('id', id);
  }, [isDemo]);

  const editTransaction = useCallback(async (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    if (!isDemo) await supabase.from('transactions').update(updated as any).eq('id', id);
  }, [isDemo]);

  const addCard = useCallback(async (card: Omit<CreditCard, 'id'>) => {
    const tempId = crypto.randomUUID();
    setCards(prev => [...prev, { ...card, id: tempId }]);
    grantXP(50);
  }, [grantXP]);
  const addGoal = useCallback(async (goal: Omit<FinancialGoal, 'id'>) => {
    const tempId = crypto.randomUUID();
    setGoals(prev => [...prev, { ...goal, id: tempId }]);
    grantXP(50);
  }, [grantXP]);
  const addDebt = useCallback(async (debt: Omit<Debt, 'id'>) => {
    const tempId = crypto.randomUUID();
    setDebts(prev => [...prev, { ...debt, id: tempId }]);
    grantXP(30);
  }, [grantXP]);
  const updateDebt = useCallback(async (id: string | number, updated: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
  }, []);
  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setLocalProfile(prev => prev ? { ...prev, ...data } : null);
  }, []);
  const addAIRule = useCallback(async (keyword: string, category: string) => {
    if (!user) return;
    const tempId = crypto.randomUUID();
    setAiRules(prev => [...prev, { id: tempId, keyword, category }]);
    if (!isDemo) await supabase.from('ai_rules').insert({ user_id: user.id, keyword, category });
  }, [user, isDemo]);

  const removeAIRule = useCallback(async (id: string) => {
    setAiRules(prev => prev.filter(r => r.id !== id));
    if (!isDemo) await supabase.from('ai_rules').delete().eq('id', id);
  }, [isDemo]);

  const addCustomCategory = useCallback(async (category: string) => {
    setCustomCategories(prev => [...prev, category]);
    if (user && !isDemo) await supabase.from('custom_categories').insert({ user_id: user.id, name: category });
  }, [user, isDemo]);

  const exportData = useCallback((format: 'json' | 'csv') => {
    if (!transactions.length) {
      pushNotification({ title: 'Sem dados', message: 'Faça transações antes de exportar.', type: 'info' });
      return;
    }
    const dataStr = format === 'json' ? JSON.stringify(transactions, null, 2) : transactions.map(t => `${t.dateIso},${t.title},${t.amount},${t.category}`).join('\n');
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluxcash_export_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
  }, [transactions, pushNotification]);

  const resetData = useCallback(async () => {
    if (!user) return;
    if (isDemo) {
      pushNotification({ title: 'Modo Demo', message: 'Dados de demonstração não podem ser apagados.', type: 'info' });
      return;
    }

    setIsDataLoading(true);
    try {
      // 1. Delete all user data from Supabase
      // Note: RLS policies ensure we only delete our own data
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', user.id),
        supabase.from('credit_cards').delete().eq('user_id', user.id),
        supabase.from('financial_goals').delete().eq('user_id', user.id),
        supabase.from('debts').delete().eq('user_id', user.id),
        supabase.from('ai_rules').delete().eq('user_id', user.id),
        supabase.from('custom_categories').delete().eq('user_id', user.id),
        supabase.from('xp_history').delete().eq('user_id', user.id),
        supabase.from('user_achievements').delete().eq('user_id', user.id),
        supabase.from('weekly_challenges').delete().eq('user_id', user.id),
        supabase.from('streaks').delete().eq('user_id', user.id)
      ]);

      // 2. Reset Profile Stats (keep account)
      await supabase.from('profiles').update({
        xp: 0,
        level: 1,
        main_goal: null,
        current_situation: null
      }).eq('user_id', user.id);

      // 3. Clear Local State
      setTransactions([]);
      setCards([]);
      setGoals([]);
      setDebts([]);
      setAiRules([]);
      setCustomCategories(DEFAULT_CATEGORIES);
      setCompletedMissions([]);
      if (localProfile) {
        setLocalProfile({ ...localProfile, xp: 0, level: 1 });
      }

      // 4. Clear Cache
      localStorage.removeItem(`flux_tx_${user.id}`);
      localStorage.removeItem(`flux_cards_${user.id}`);
      localStorage.removeItem(`flux_goals_${user.id}`);
      localStorage.removeItem(`flux_debts_${user.id}`);
      localStorage.removeItem(`flux_profile_${user.id}`);

      pushNotification({
        title: 'Dados Apagados',
        message: 'Sua conta foi limpa com sucesso. Comece do zero!',
        type: 'success',
        category: 'system'
      });

    } catch (error) {
      console.error('Error resetting data:', error);
      pushNotification({
        title: 'Erro no Reset',
        message: 'Ocorreu um erro ao tentar apagar os dados.',
        type: 'error',
        category: 'system'
      });
    } finally {
      setIsDataLoading(false);
    }
  }, [user, isDemo, localProfile, pushNotification]);

  const nextMonth = useCallback(() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)), []);
  const prevMonth = useCallback(() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)), []);

  const SAFE_DEFAULT_PROFILE: UserProfile = {
    id: 'guest',
    name: 'Convidado',
    email: 'guest@fluxcash.ai',
    avatarUrl: '',
    xp: 0,
    level: 1,
    profession: 'Visitante',
    plan: { name: 'Free', status: 'active', renewalDate: new Date().toISOString(), price: 0 },
    hasOnboarding: false
  };

  // ... inside component ...

  const contextValue = useMemo(() => ({
    transactions, cards, goals, debts, userProfile: localProfile || SAFE_DEFAULT_PROFILE, aiRules, customCategories, activeMissions,
    balance, income, expenses, currentDate, isDataLoading, privacyMode, togglePrivacy,
    addTransaction, removeTransaction, editTransaction, addCard, addGoal, addDebt, updateDebt,
    updateProfile, completeOnboarding, grantXP, completeMission, addAIRule, removeAIRule, addCustomCategory,
    nextMonth, prevMonth, setCurrentDate, exportData, resetData
  }), [
    transactions, cards, goals, debts, localProfile, aiRules, customCategories, activeMissions,
    balance, income, expenses, currentDate, isDataLoading, privacyMode, togglePrivacy,
    addTransaction, removeTransaction, editTransaction, addCard, addGoal, addDebt, updateDebt,
    updateProfile, completeOnboarding, grantXP, completeMission, addAIRule, removeAIRule, addCustomCategory,
    nextMonth, prevMonth, setCurrentDate, exportData, resetData
  ]);

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) throw new Error('useTransactions must be used within a TransactionsProvider');
  return context;
};
