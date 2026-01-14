
import React, { useState, useMemo } from 'react';
import { useTransactions } from './TransactionsContext';

interface IncomePageProps {
  onBack: () => void;
  onMenuClick: () => void;
  onAddClick?: () => void;
}

const IncomePage: React.FC<IncomePageProps> = ({ onBack, onMenuClick, onAddClick }) => {
  const { transactions, currentDate } = useTransactions();
  const [activeTab, setActiveTab] = useState<'all' | 'recurring' | 'extra'>('all');
  
  // --- PM LOGIC: Real Financial Projection ---
  const { recurringIncome, extraIncome, totalReceivables, totalReceived, progressPercent } = useMemo(() => {
    // Filter for current month view
    const currentMonthTx = transactions.filter(t => {
       if (t.type !== 'income') return false;
       if (!t.dateIso) return true; // Assume current if no date
       const d = new Date(t.dateIso);
       return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });

    const recurring = currentMonthTx.filter(t => t.isRecurring);
    const extra = currentMonthTx.filter(t => !t.isRecurring);

    // Mock logic: Assume past dates are "Received", future dates are "Pending"
    const now = new Date();
    let received = 0;
    let pending = 0;

    currentMonthTx.forEach(t => {
        const d = t.dateIso ? new Date(t.dateIso) : new Date();
        // If recurring, we assume it's received if day passed, or specific logic
        // For simplicity: If date < now, received.
        if (d <= now) received += Math.abs(t.amount);
        else pending += Math.abs(t.amount);
    });

    const total = received + pending;
    const percent = total > 0 ? Math.round((received / total) * 100) : 0;

    return {
      recurringIncome: recurring,
      extraIncome: extra.sort((a,b) => (new Date(b.dateIso || 0).getTime()) - (new Date(a.dateIso || 0).getTime())),
      totalReceivables: total,
      totalReceived: received,
      progressPercent: percent
    };
  }, [transactions, currentDate]);

  // --- CS/UX Feature: Smart Message Generator ---
  const handleContactAction = (title: string, value: number, isRecurring: boolean) => {
    const formattedValue = value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    let text = '';
    
    if (isRecurring) {
        text = `Olá! Confirmando o recebimento recorrente de *R$ ${formattedValue}* referente a *${title}*. Tudo certo este mês?`;
    } else {
        text = `Olá! Estou enviando o comprovante/registro do serviço *${title}* no valor de *R$ ${formattedValue}*. Obrigado!`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentMonthName = currentDate.toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-zinc-950 md:rounded-3xl shadow-soft md:border border-zinc-100 dark:border-zinc-800 overflow-hidden relative font-sans transition-colors">
      
      {/* 1. Header with Stats (The "PM Dashboard") */}
      <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 px-6 pt-6 pb-6 flex flex-col gap-6 shrink-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <button onClick={onBack} className="hidden lg:flex p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Entradas</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{currentMonthName} {currentDate.getFullYear()}</p>
            </div>
          </div>
          
          <button 
            onClick={onAddClick}
            className="bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
          >
             <span className="material-symbols-outlined text-[20px]">add</span>
             <span className="hidden sm:inline">Nova Renda</span>
          </button>
        </div>

        {/* Financial Thermometer */}
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Previsto</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        R$ {totalReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                        {progressPercent}% Recebido
                    </span>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        R$ {totalReceived.toLocaleString('pt-BR')} / R$ {totalReceivables.toLocaleString('pt-BR')}
                    </span>
                </div>
            </div>
            {/* Progress Bar */}
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out relative"
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-zinc-50/50 dark:bg-zinc-950/50">
        
        {/* 2. Modern Tabs */}
        <div className="flex p-1 bg-zinc-200/50 dark:bg-zinc-900 rounded-xl w-full max-w-md border border-zinc-200/50 dark:border-zinc-800">
             <button 
                onClick={() => setActiveTab('all')} 
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
             >
                Visão Geral
             </button>
             <button 
                onClick={() => setActiveTab('recurring')} 
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${activeTab === 'recurring' ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
             >
                Fixas
             </button>
             <button 
                onClick={() => setActiveTab('extra')} 
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${activeTab === 'extra' ? 'bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
             >
                Extras
             </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
             
             {/* Recurring Section (UX Upgrade: Card Style) */}
             {(activeTab === 'all' || activeTab === 'recurring') && (
               <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 px-2">
                    <span className="material-symbols-outlined text-emerald-500 filled">verified</span>
                    Renda Recorrente
                  </h3>
                  
                  {recurringIncome.length > 0 ? recurringIncome.map(item => (
                    <div key={item.id} className="group bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900 transition-all relative overflow-hidden">
                       {/* Background Pattern */}
                       <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                       <div className="relative z-10 flex justify-between items-start">
                           <div className="flex gap-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center font-bold ${item.colorClass} shadow-sm`}>
                                    <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Mensal</span>
                                        <span className="text-xs text-zinc-400">Dia 05</span>
                                    </div>
                                </div>
                           </div>
                           <div className="text-right">
                                <p className="font-black text-slate-900 dark:text-white text-lg">R$ {Math.abs(item.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                <button 
                                    onClick={() => handleContactAction(item.title, Math.abs(item.amount), true)}
                                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-end gap-1 mt-1"
                                >
                                    Confirmar <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                </button>
                           </div>
                       </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-zinc-400 text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                       Nenhuma renda fixa cadastrada.
                    </div>
                  )}
               </div>
             )}

             {/* Receivables List (UX Upgrade: Clean List) */}
             {(activeTab === 'all' || activeTab === 'extra') && (
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500">work_history</span>
                        Entradas Extras
                    </h3>
                    <span className="text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">{extraIncome.length} itens</span>
                  </div>
                  
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                     {extraIncome.length > 0 ? extraIncome.map((item, idx) => (
                        <div key={item.id} className="relative group p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                           <div className="flex items-center gap-4">
                              <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-indigo-500`}>
                                 {item.title.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{item.title}</span>
                                 <span className="text-[11px] text-zinc-400 font-medium">{item.category} • {new Date(item.dateIso || Date.now()).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'})}</span>
                              </div>
                           </div>

                           <div className="flex items-center gap-4">
                              <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                                + R$ {Math.abs(item.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                              </span>
                              
                              {/* The "Fixed" Button */}
                              <button 
                                onClick={() => handleContactAction(item.title, Math.abs(item.amount), false)}
                                className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-all relative group/btn" 
                                title="Enviar Cobrança / Comprovante"
                              >
                                 <span className="material-symbols-outlined text-[18px]">chat</span>
                                 {/* Tooltip */}
                                 <div className="absolute bottom-full mb-2 right-0 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    Enviar Recibo
                                 </div>
                              </button>
                           </div>
                        </div>
                     )) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                           <div className="size-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                                <span className="material-symbols-outlined text-zinc-300 text-2xl">savings</span>
                           </div>
                           <p className="text-zinc-400 text-sm">Nenhuma renda extra este mês.</p>
                           <button onClick={onAddClick} className="mt-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">Adicionar manualmente</button>
                        </div>
                     )}
                  </div>
               </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default IncomePage;
