
import React, { useState, useMemo } from 'react';
import { useTransactions } from './TransactionsContext';

interface BalanceCardProps {
  onOpenModal?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = React.memo(({ onOpenModal }) => {
  const { balance, transactions, income, privacyMode, addTransaction } = useTransactions();
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // --- LÓGICA TÁTICA (DIÁRIA & SEMANAL) ---
  const { weeklyAvailable, dailyAvailable, weeklySpent, weeklyLimit, progressPercent, statusColor, statusMessage, statusBadgeClass } = useMemo(() => {
    const today = new Date();

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const weeklyTransactions = transactions.filter(t => {
      if (!t.dateIso) return false;
      const tDate = new Date(t.dateIso);
      return t.type === 'expense' && !t.isRecurring && tDate >= firstDayOfWeek;
    });

    const spent = weeklyTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const safeMonthlyIncome = income > 0 ? income : 0;
    const estimatedFixedCosts = transactions.filter(t => t.type === 'expense' && t.isRecurring).reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const freeCashFlow = Math.max(0, safeMonthlyIncome - estimatedFixedCosts);
    const limit = freeCashFlow > 0 ? freeCashFlow / 4 : 750;

    const available = limit - spent;
    const percent = limit > 0 ? Math.min(100, (spent / limit) * 100) : 100;

    const daysRemaining = 7 - today.getDay();
    const dailySafe = Math.max(0, available / daysRemaining);

    let color = 'bg-emerald-500';
    let msg = 'No controle';
    let badgeClass = 'bg-emerald-500/20 text-emerald-300';

    if (percent > 75) {
      color = 'bg-amber-500';
      msg = 'Atenção';
      badgeClass = 'bg-amber-500/20 text-amber-300';
    }
    if (percent >= 100) {
      color = 'bg-rose-500';
      msg = 'Esgotado';
      badgeClass = 'bg-rose-500/20 text-rose-300';
    }

    return {
      weeklyAvailable: available,
      dailyAvailable: dailySafe,
      weeklySpent: spent,
      weeklyLimit: limit,
      progressPercent: percent,
      statusColor: color,
      statusMessage: msg,
      statusBadgeClass: badgeClass
    };
  }, [balance, transactions, income]);

  const formatCurrency = (val: number) =>
    (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Quick Action Handler
  const handleQuickTransfer = () => {
    // Logic handled via generic modal usually, specifically pre-filling would be better in V2
    if (onOpenModal) onOpenModal();
  }

  return (
    <div className="lg:col-span-2 relative group h-full">
      <div className="relative bg-[#0f172a] dark:bg-[#09090b] rounded-[2rem] p-6 md:p-8 h-full flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 border border-slate-800">

        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-violet-600/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* TOP ROW: Patrimônio Total */}
        <div className="flex justify-between items-center mb-6 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 p-2 rounded-lg border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">account_balance</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patrimônio Total</span>
              <span className={`text-xs font-bold text-white/80 ${privacyMode ? 'blur-sm select-none' : ''}`}>
                R$ {formatCurrency(balance)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">{isVisible ? 'visibility' : 'visibility_off'}</span>
          </button>
        </div>

        {/* MIDDLE: Daily & Weekly Focus */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-8 mb-8 z-10 relative">

          {/* HOJE - Primary Focus */}
          <div className="flex-1 relative group/daily">
            <div
              className="flex items-center gap-2 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <p className="text-sm font-bold text-emerald-400 mb-1 flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-[18px] filled">today</span>
                Disponível Hoje
              </p>
              <span className="material-symbols-outlined text-[14px] text-slate-500 hover:text-slate-300">info</span>
            </div>

            {/* UX Tooltip */}
            <div className={`absolute left-0 bottom-full mb-2 bg-slate-800 text-white text-xs p-3 rounded-xl border border-slate-700 shadow-xl transition-all w-48 z-50 pointer-events-none ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <p className="font-bold mb-1">Como calculamos?</p>
              <p className="text-slate-300 text-[10px]">Restante da Semana / Dias que faltam.</p>
              <div className="h-px bg-white/10 my-2"></div>
              <p className="text-emerald-400 text-[10px]">Se sobrar, acumula para amanhã!</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-medium text-slate-500">R$</span>
              <span className={`text-6xl font-black tracking-tighter text-white transition-all ${dailyAvailable <= 0 ? 'text-rose-400' : ''} ${privacyMode ? 'blur-md select-none' : ''}`}>
                {formatCurrency(dailyAvailable)}
              </span>
            </div>
          </div>

          {/* INTEGRATED ACTIONS (UX Improvement #1) */}
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={onOpenModal}
              className="flex-1 md:flex-none h-12 px-4 bg-white text-slate-900 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="hidden md:inline">Novo</span>
            </button>
            <button
              onClick={onOpenModal}
              className="h-12 w-12 md:w-auto md:px-4 bg-white/10 text-white border border-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              title="Scanear Nota"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              <span className="hidden md:inline">Scan</span>
            </button>
            <button
              onClick={onOpenModal}
              className="h-12 w-12 md:w-auto md:px-4 bg-white/10 text-white border border-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              title="Transferir"
            >
              <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
              <span className="hidden md:inline">Pix</span>
            </button>
          </div>
        </div>

        {/* BOTTOM: Progress Bar & Meta */}
        <div className="z-10 relative bg-slate-900/50 p-3 rounded-xl border border-white/5">
          <div className="flex justify-between items-end mb-2 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-slate-500"></span>
              Gasto na Semana: <span className={privacyMode ? 'blur-sm' : ''}>R$ {formatCurrency(weeklySpent)}</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${statusBadgeClass}`}>
              {statusMessage}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${statusColor}`}
              style={{ width: `${Math.max(5, Math.min(progressPercent, 100))}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>

          <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-medium">
            <span>0%</span>
            <span>Teto Semanal: R$ {privacyMode ? '***' : formatCurrency(weeklyLimit)}</span>
            <span>100%</span>
          </div>
        </div>

      </div>
    </div>
  );
});

export default BalanceCard;
