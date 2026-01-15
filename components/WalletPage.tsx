
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useTransactions } from './TransactionsContext';
import { useNotification } from './NotificationContext';

interface WalletPageProps {
  onBack: () => void;
  onMenuClick: () => void;
}

const WalletPage: React.FC<WalletPageProps> = ({ onBack, onMenuClick }) => {
  const { cards, goals, addCard, addGoal, balance, income, transactions, privacyMode, userProfile } = useTransactions();
  const { pushNotification } = useNotification();
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // --- PM LOGIC: Real Net Worth Calculation ---
  // Assets: Balance + Goals
  // Liabilities: Card Bills (Outstanding)
  const totalGoals = goals.reduce((acc, item) => acc + item.current, 0);
  const totalCardDebt = cards.reduce((acc, card) => acc + card.bill, 0);

  // Net Worth = (Cash + Investments) - Debts
  const netWorth = (balance + totalGoals) - totalCardDebt;
  const isPositive = netWorth >= 0;

  // --- GROWTH LOGIC: Free Plan Limits ---
  const handleAddCardClick = () => {
    // If user is Free and has >= 2 cards, show upgrade modal
    const planName = userProfile?.plan?.name || 'Free';
    if (planName !== 'Obsidian Pro' && cards.length >= 2) {
      setShowUpgradeModal(true);
    } else {
      setShowAddCard(true);
    }
  };

  const handleUpgradeFromModal = () => {
    // This would redirect to stripe or payment flow
    pushNotification({
      title: 'Redirecionando...',
      message: 'Levando você para a página de planos.',
      type: 'info',
      category: 'system'
    });
    setShowUpgradeModal(false);
  };

  // --- ENGINEERING/PM LOGIC: Real Installment Projection ---
  // Parses "X/Y" installments to project future debt commitment
  const tunnelData = useMemo(() => {
    const projection = [0, 0, 0, 0, 0, 0]; // Current, +1, +2...
    const months = ['Atual', '+1 Mês', '+2 Meses', '+3 Meses', '+4 Meses', '+5 Meses'];

    // 1. Base Debt (Current Card Bills)
    // Assuming 'bill' is what is due THIS month.
    projection[0] = totalCardDebt;

    // 2. Installments Logic
    transactions.forEach(t => {
      if (t.type === 'expense' && t.installment) {
        // Format "1/10" or "10/12"
        const parts = t.installment.split('/');
        if (parts.length === 2) {
          const currentParcel = parseInt(parts[0]);
          const totalParcels = parseInt(parts[1]);
          const remaining = totalParcels - currentParcel;
          const parcelValue = Math.abs(t.amount); // Assuming t.amount is the PARCEL value

          // Project into future months
          for (let i = 1; i <= 5; i++) {
            if (i <= remaining) {
              projection[i] += parcelValue;
            }
          }
        }
      }
    });

    return months.map((month, idx) => {
      const value = projection[idx];
      // Warning threshold: 50% of Income
      const isHighRisk = income > 0 && value > (income * 0.5);

      return {
        month,
        value,
        risk: isHighRisk
      };
    });
  }, [totalCardDebt, income, transactions]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 md:rounded-3xl shadow-soft md:border border-zinc-100 dark:border-zinc-800 overflow-hidden relative font-sans transition-colors">

      {/* 1. Header (Patrimônio Líquido Real) */}
      <div className="bg-[#0f172a] text-white pt-8 pb-12 px-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-white/10 text-white/70 transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <button onClick={onBack} className="hidden lg:flex p-2 -ml-2 rounded-full hover:bg-white/10 text-white/70 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-xl font-bold tracking-tight">Carteira</h2>
          </div>
          <button className="p-2 rounded-full hover:bg-white/10 text-white/70">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
              Patrimônio Líquido
              <span className="material-symbols-outlined text-[14px] text-slate-500 cursor-help" title="Saldo + Metas - Faturas de Cartão">help</span>
            </p>
            <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mb-2 ${isPositive ? 'text-white' : 'text-rose-400'} ${privacyMode ? 'blur-md select-none' : ''}`}>
              R$ {netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h1>
            <p className="text-sm text-slate-400">
              Você tem <span className={`text-white font-bold ${privacyMode ? 'blur-sm' : ''}`}>R$ {(balance + totalGoals).toLocaleString()}</span> em ativos e <span className={`text-rose-400 font-bold ${privacyMode ? 'blur-sm' : ''}`}>R$ {totalCardDebt.toLocaleString()}</span> em faturas.
            </p>
          </div>

          <div className="flex gap-4 md:justify-end">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 md:flex-none md:w-40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                <span className="text-xs font-bold text-slate-300">Disponível</span>
              </div>
              <span className={`text-lg font-bold block ${privacyMode ? 'blur-md select-none' : ''}`}>R$ {(balance > 0 ? balance : 0).toLocaleString()}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 md:flex-none md:w-40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]"></span>
                <span className="text-xs font-bold text-slate-300">Guardado</span>
              </div>
              <span className={`text-lg font-bold block ${privacyMode ? 'blur-md select-none' : ''}`}>R$ {totalGoals.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-zinc-50 dark:bg-zinc-950 -mt-6 rounded-t-3xl relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-colors">

        {/* 2. Seção Meus Cartões (Carousel) */}
        <div className="pt-8 pb-4">
          <div className="px-6 flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Meus Cartões</h3>
            <button className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
              Gerenciar <span className="material-symbols-outlined text-[14px]">settings</span>
            </button>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-4 px-6 pb-8 snap-x snap-mandatory">
            {cards.map(card => {
              // CS Logic: Smart "Best Buy Date"
              // Mocking: If last digit is even, assume closing date passed (Best Buy)
              const isBestBuy = parseInt(card.lastDigits) % 2 === 0;
              const limitUsedPercent = (card.bill / card.limit) * 100;

              return (
                <div
                  key={card.id}
                  className={`snap-center shrink-0 w-[300px] h-[180px] rounded-2xl p-6 text-white shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group bg-gradient-to-br ${card.color}`}
                >
                  {/* Dark Overlay for Contrast (UX Fix) */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>

                  {/* Decorative Shine */}
                  <div className="absolute -right-10 -top-10 size-32 bg-white/10 rounded-full blur-2xl"></div>

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-lg tracking-wide drop-shadow-md">{card.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-black/30 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 font-mono tracking-wider">
                            •••• {card.lastDigits}
                          </span>
                          {isBestBuy && (
                            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/90 text-white px-2 py-0.5 rounded font-bold shadow-sm animate-pulse">
                              <span className="material-symbols-outlined text-[12px]">shopping_bag</span>
                              Melhor Dia
                            </span>
                          )}
                        </div>
                      </div>
                      {card.brand === 'mastercard' && <div className="flex -space-x-3 opacity-90"><div className="size-6 bg-red-500 rounded-full mix-blend-screen"></div><div className="size-6 bg-yellow-500 rounded-full mix-blend-screen"></div></div>}
                      {card.brand === 'visa' && <span className="font-black italic text-xl opacity-90">VISA</span>}
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-white/80 font-medium mb-0.5">Fatura Atual</span>
                          <span className={`text-2xl font-bold tracking-tight drop-shadow-sm ${privacyMode ? 'blur-md select-none' : ''}`}>R$ {card.bill.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-white/80 block">Disponível</span>
                          <span className={`text-sm font-bold ${privacyMode ? 'blur-sm select-none' : ''}`}>R$ {(card.limit - card.bill).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                          className={`h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ${limitUsedPercent > 80 ? 'bg-rose-400' : 'bg-white/90'}`}
                          style={{ width: `${limitUsedPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleAddCardClick}
              className="snap-center shrink-0 w-[60px] h-[180px] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 hover:border-violet-500 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors gap-2 group bg-zinc-50 dark:bg-zinc-900"
            >
              <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Contas & Túnel Grid (Improved) */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-500">tunnel_mode</span>
                  Túnel de Parcelas
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Comprometimento futuro real.</p>
              </div>
              {income > 0 && (
                <div className="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-lg text-[10px] font-bold border border-violet-100 dark:border-violet-800/30">
                  {Math.round((tunnelData[1].value / income) * 100)}% prox. mês
                </div>
              )}
            </div>

            <div className={`flex-1 min-h-[160px] w-full ${privacyMode ? 'opacity-20 blur-sm' : ''}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tunnelData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Comprometido']}
                  />
                  <ReferenceLine y={income} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Renda', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                    {tunnelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.risk ? '#f43f5e' : (index === 0 ? '#6366f1' : '#cbd5e1')}
                        className="transition-all hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Growth/Gamification Element: Freedom Progress */}
          <div className="bg-white dark:bg-[#18181b] rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 filled">flag</span>
                Independência
              </h3>
              <span className="text-xs font-bold text-slate-400">Meta: 6 Meses de Reserva</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  <span>Reserva de Emergência</span>
                  <span>{Math.min(100, Math.round((balance / (2000 * 6)) * 100))}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(100, (balance / 12000) * 100)}%` }}></div>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Baseado em custo de vida est. R$ 2.000/mês</p>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex gap-3 items-center">
                <div className="size-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Dica de Growth</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">Antecipar parcelas do "Túnel" pode gerar até 10% de desconto no Nubank.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Metas & Cofres */}
        <div className="px-6 pb-12">
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            Metas & Cofres
            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{goals.length} Ativos</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {goals.map(goal => {
              const percentage = Math.round((goal.current / goal.target) * 100);
              return (
                <div key={goal.id} className="bg-white dark:bg-[#18181b] rounded-2xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:border-violet-200 dark:hover:border-violet-800/50 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer">
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800">
                    <div className={`h-full ${goal.color}`} style={{ width: `${percentage}%` }}></div>
                  </div>

                  <div className="flex justify-between items-start mb-3">
                    <div className={`size-10 rounded-full ${goal.color} bg-opacity-10 flex items-center justify-center text-${goal.color.replace('bg-', '')}-600 dark:text-white`}>
                      <span className="material-symbols-outlined text-slate-800 dark:text-white">{goal.icon}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-zinc-300 dark:text-zinc-600 text-[18px]">edit</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm mb-1 truncate">{goal.name}</h4>
                  <p className={`text-xs text-zinc-400 mb-3 ${privacyMode ? 'blur-sm' : ''}`}>Faltam R$ {(goal.target - goal.current).toLocaleString()}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-800 dark:text-zinc-200">{percentage}%</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      {percentage >= 100 ? 'Concluído!' : 'Em progresso'}
                    </span>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => setShowAddGoal(true)}
              className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors p-4 min-h-[140px] group"
            >
              <div className="size-10 bg-zinc-50 dark:bg-zinc-900 group-hover:bg-white dark:group-hover:bg-zinc-800 rounded-full flex items-center justify-center mb-2 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-2xl">add</span>
              </div>
              <span className="text-xs font-bold">Nova Meta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddCardModal isOpen={showAddCard} onClose={() => setShowAddCard(false)} onSave={addCard} />
      <AddGoalModal isOpen={showAddGoal} onClose={() => setShowAddGoal(false)} onSave={addGoal} />

      {/* UPGRADE MODAL - GROWTH FEATURE */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl w-full max-w-sm p-8 text-center animate-fade-in shadow-2xl border border-white/10">
            <div className="size-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-yellow-400">diamond</span>
            </div>
            <h2 className="text-2xl font-black mb-2">Desbloqueie o Infinito</h2>
            <p className="text-slate-300 mb-6">O plano gratuito permite até 2 cartões. Remova os limites e tenha controle total.</p>

            <ul className="text-left space-y-3 mb-8 bg-black/20 p-4 rounded-xl">
              <li className="flex gap-2 text-sm"><span className="text-emerald-400">✓</span> Cartões Ilimitados</li>
              <li className="flex gap-2 text-sm"><span className="text-emerald-400">✓</span> IA de Categorização</li>
              <li className="flex gap-2 text-sm"><span className="text-emerald-400">✓</span> Backups na Nuvem</li>
            </ul>

            <button
              onClick={handleUpgradeFromModal}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform"
            >
              Virar Pro (R$ 29,90)
            </button>
            <button onClick={() => setShowUpgradeModal(false)} className="mt-4 text-xs text-slate-400 hover:text-white">Agora não</button>
          </div>
        </div>
      )}
    </div>
  );
};

import { CreditCard, FinancialGoal } from '../types';

// --- MODALS (Reused) ---
const AddCardModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (c: Omit<CreditCard, 'id'>) => void }> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [brand, setBrand] = useState<CreditCard['brand']>('mastercard');
  const [lastDigits, setLastDigits] = useState('');

  const handleSubmit = () => {
    onSave({
      name,
      limit: Number(limit),
      brand,
      bill: 0,
      dueDate: 'Dia 10',
      color: 'from-slate-700 to-slate-900',
      lastDigits: lastDigits || '0000'
    });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 relative z-10 animate-fade-in border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-zinc-100">Adicionar Cartão</h3>
        <div className="space-y-3">
          <input className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-slate-900 dark:text-zinc-100" placeholder="Apelido do Cartão" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-slate-900 dark:text-zinc-100" type="number" placeholder="Limite (R$)" value={limit} onChange={e => setLimit(e.target.value)} />
          <input className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-slate-900 dark:text-zinc-100" type="text" maxLength={4} placeholder="Últimos 4 dígitos" value={lastDigits} onChange={e => setLastDigits(e.target.value)} />
          <select className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-slate-900 dark:text-zinc-100" value={brand} onChange={e => setBrand(e.target.value as CreditCard['brand'])}>
            <option value="mastercard">Mastercard</option>
            <option value="visa">Visa</option>
          </select>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-2 items-start">
            <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5">info</span>
            <p className="text-[10px] text-blue-700 dark:text-blue-300">Dica de Growth: Conecte o Open Finance para importar seus cartões automaticamente e evitar erros manuais.</p>
          </div>
          <button onClick={handleSubmit} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl mt-2">Salvar Cartão</button>
        </div>
      </div>
    </div>
  );
};

const AddGoalModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (g: Omit<FinancialGoal, 'id'>) => void }> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');

  const handleSubmit = () => {
    onSave({
      name,
      target: Number(target),
      current: Number(current),
      deadline: '2025-01-01',
      icon: 'savings',
      color: 'bg-indigo-500'
    });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 relative z-10 animate-fade-in border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-zinc-100">Nova Meta Financeira</h3>
        <div className="space-y-3">
          <input className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-slate-900 dark:text-zinc-100" placeholder="Nome da Meta" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-slate-900 dark:text-zinc-100" type="number" placeholder="Valor Alvo" value={target} onChange={e => setTarget(e.target.value)} />
          <input className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-slate-900 dark:text-zinc-100" type="number" placeholder="Já guardado" value={current} onChange={e => setCurrent(e.target.value)} />
          <button onClick={handleSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl mt-2">Criar Meta</button>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
