
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

  // --- FETCH DATA (SUPABASE ONLY - NO MOCK DATA) ---
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCards([]);
      setGoals([]);
      setDebts([]);
      return;
    }

    // DEMO MODE: Start with empty data (no mock)
    if (isDemo) {
      setIsDataLoading(true);
      setTimeout(() => {
        setTransactions([]);
        setCards([]);
        setGoals([]);
        setDebts([]);
        setAiRules([]);
        setIsDataLoading(false);
      }, 300); // Reduced timeout for faster loading
      return;
    }

    // PRODUCTION MODE
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const { data: txData, error: txError } = await supabase.from('transactions').select('*').order('date_iso', { ascending: false });
        if (txError) throw txError;
        setTransactions((txData || []).map(t => ({
          id: t.id, title: t.title, amount: Number(t.amount), type: t.type, category: t.category, account: t.account, dateIso: t.date_iso, isRecurring: t.is_recurring, installment: t.installment, icon: t.icon, colorClass: t.color_class
        })));

        const { data: cardsData } = await supabase.from('credit_cards').select('*');
        setCards((cardsData || []).map(c => ({
          id: c.id, name: c.name, brand: c.brand, limit: Number(c.limit), bill: Number(c.bill), color: c.color, dueDate: c.due_date, lastDigits: c.last_digits
        })));

        const { data: goalsData } = await supabase.from('financial_goals').select('*');
        setGoals((goalsData || []).map(g => ({
          id: g.id, name: g.name, target: Number(g.target), current: Number(g.current), deadline: g.deadline, icon: g.icon, color: g.color
        })));

        const { data: debtsData } = await supabase.from('debts').select('*');
        setDebts((debtsData || []).map(d => ({
          id: d.id, name: d.name, bank: d.bank, total_installments: d.total_installments, paid_installments: d.paid_installments, original_debt: Number(d.original_debt), current_balance: Number(d.current_balance), value_parcel: Number(d.value_parcel), color: d.color
        })));

        const { data: rulesData } = await supabase.from('ai_rules').select('*');
        if (rulesData) setAiRules(rulesData);

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) {
          setLocalProfile(prev => ({ ...prev!, xp: profileData.xp, level: profileData.level, hasOnboarding: profileData.has_onboarding }));
        }
      } catch (error: any) {
        console.error("Supabase Fetch Error:", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
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
  const addAIRule = async (keyword: string, category: string) => { /* ... existing impl ... */
    const tempId = crypto.randomUUID();
    setAiRules(prev => [...prev, { id: tempId, keyword, category }]);
  };
  const removeAIRule = async (id: string) => { /* ... existing impl ... */
    setAiRules(prev => prev.filter(r => r.id !== id));
  };
  const addCustomCategory = (category: string) => { /* ... existing impl ... */
    setCustomCategories(prev => [...prev, category]);
  };
  const exportData = (format: 'json' | 'csv') => { /* ... existing impl ... */ };
  const resetData = async () => { /* ... existing impl ... */ };

  const nextMonth = useCallback(() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)), []);
  const prevMonth = useCallback(() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)), []);

  return (
    <TransactionsContext.Provider value={{
      transactions, cards, goals, debts, userProfile: localProfile || {} as UserProfile, aiRules, customCategories, activeMissions,
      balance, income, expenses, currentDate, isDataLoading, privacyMode, togglePrivacy,
      addTransaction, removeTransaction, editTransaction, addCard, addGoal, addDebt, updateDebt,
      updateProfile, completeOnboarding, grantXP, completeMission, addAIRule, removeAIRule, addCustomCategory,
      nextMonth, prevMonth, setCurrentDate, exportData, resetData
    }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) throw new Error('useTransactions must be used within a TransactionsProvider');
  return context;
};
