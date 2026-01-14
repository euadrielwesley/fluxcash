
import React, { useState, useMemo } from 'react';
import { useTransactions } from './TransactionsContext';
import { Transaction } from '../types';

interface RecentTransactionsProps {
  onEdit?: (transaction: Transaction) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onEdit }) => {
  const { transactions, removeTransaction, privacyMode } = useTransactions();
  const [filter, setFilter] = useState<'all' | 'expense' | 'income' | 'scheduled'>('all');

  // Group transactions by Date for display
  const groupedTransactions = useMemo(() => {
    // Filter first
    const filtered = transactions.filter(t => {
      if (filter === 'all') return true;
      if (filter === 'scheduled') return false; // Not implemented yet
      return t.type === filter;
    });

    // Sort by date desc
    filtered.sort((a, b) => {
        const da = a.dateIso ? new Date(a.dateIso).getTime() : 0;
        const db = b.dateIso ? new Date(b.dateIso).getTime() : 0;
        return db - da;
    });

    // Group by Date string
    const groups: { date: string; total: number; items: Transaction[] }[] = [];
    
    filtered.forEach(transaction => {
      let dateLabel = "Data Desconhecida";
      if (transaction.dateIso) {
         const date = new Date(transaction.dateIso);
         const today = new Date();
         const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
         
         // Create yesterday date correctly
         const yesterday = new Date(today);
         yesterday.setDate(today.getDate() - 1);
         const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
         
         if (isToday) dateLabel = "Hoje";
         else if (isYesterday) dateLabel = "Ontem";
         else dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      }

      const existingGroup = groups.find(g => g.date === dateLabel);
      if (existingGroup) {
        existingGroup.items.push(transaction);
        existingGroup.total += transaction.amount;
      } else {
        groups.push({
          date: dateLabel,
          total: transaction.amount,
          items: [transaction]
        });
      }
    });

    return groups;
  }, [transactions, filter]);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja apagar "${title}"?`)) {
      removeTransaction(id);
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-3xl shadow-soft dark:shadow-none border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden h-full transition-colors">
      
      {/* 1. Header & Filters */}
      <div className="pt-6 pb-4 px-6 border-b border-zinc-50 dark:border-zinc-800/50 bg-white dark:bg-[#18181b] z-20 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            Smart Feed
          </h3>
          <button className="text-zinc-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
        
        {/* Scrollable Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <FilterPill label="Todos" active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterPill label="📉 Gastos" active={filter === 'expense'} onClick={() => setFilter('expense')} />
          <FilterPill label="📈 Entradas" active={filter === 'income'} onClick={() => setFilter('income')} />
        </div>
      </div>

      {/* 2. The Feed List */}
      <div className="flex flex-col overflow-y-auto no-scrollbar max-h-[600px] bg-slate-50/30 dark:bg-[#18181b]">
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col relative">
              
              {/* Sticky Date Header */}
              <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md px-6 py-3 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center shadow-sm">
                <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  {group.date}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${group.total >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'} ${privacyMode ? 'blur-sm select-none' : ''}`}>
                  {group.total >= 0 ? '+' : ''} R$ {Math.abs(group.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Transactions Rows */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50 bg-white dark:bg-[#18181b]">
                {group.items.map((tx) => (
                  <TransactionRow 
                    key={tx.id} 
                    transaction={tx} 
                    privacyMode={privacyMode}
                    onDelete={() => handleDelete(tx.id, tx.title)}
                    onEdit={() => onEdit && onEdit(tx)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-zinc-400">
             <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
             <p className="text-sm">Nenhuma transação encontrada.</p>
          </div>
        )}
        
        {/* End of List Decorator */}
        {groupedTransactions.length > 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 gap-2">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
            <span className="text-xs font-medium uppercase tracking-widest">Isso é tudo</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub Components ---

const TransactionRow: React.FC<{ transaction: Transaction; privacyMode: boolean; onDelete: () => void; onEdit: () => void }> = ({ transaction, privacyMode, onDelete, onEdit }) => {
  return (
    <div className="group relative flex items-center justify-between py-4 px-6 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-all cursor-default">
      
      {/* Left: Icon or Image & Info */}
      <div className="flex items-center gap-5 flex-1">
        {/* Logic: If logoUrl exists, show image. Else, show Icon */}
        <div className="shrink-0 relative">
          {transaction.logoUrl ? (
             <img 
               src={transaction.logoUrl} 
               alt={transaction.title} 
               className="size-12 rounded-full object-cover shadow-sm border border-zinc-100 dark:border-zinc-700"
             />
          ) : (
            <div className={`size-12 rounded-full flex items-center justify-center ${transaction.colorClass}`}>
              <span className="material-symbols-outlined text-[24px]">{transaction.icon}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 dark:text-zinc-100 text-base leading-tight">
            {transaction.title}
          </span>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-500">
            <span>{transaction.category}</span>
            <span className="size-1 rounded-full bg-slate-300 dark:bg-zinc-600"></span>
            <span>{transaction.account}</span>
          </div>
        </div>
      </div>

      {/* Right: Value & Badges & Hover Actions */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <span className={`font-bold text-base tracking-tight ${
            transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          } ${privacyMode ? 'blur-sm select-none' : ''}`}>
            {transaction.type === 'income' ? '+' : '-'} R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          
          <div className="flex gap-1.5 justify-end">
            {transaction.isRecurring && (
              <Badge label="Mensal" color="text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 border-indigo-100 dark:border-indigo-500/30" icon="loop" />
            )}
            {transaction.installment && (
              <Badge label={transaction.installment} color="text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/20 border-sky-100 dark:border-sky-500/30" icon="pie_chart" />
            )}
          </div>
        </div>

        {/* Hover Actions (Fade In) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 bg-white/95 dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 p-1 rounded-lg z-20">
          <ActionBtn icon="edit" tooltip="Editar" onClick={onEdit} />
          <ActionBtn icon="delete" tooltip="Apagar" danger onClick={onDelete} />
        </div>
      </div>
    </div>
  );
};

const FilterPill: React.FC<{ label: string; active?: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
      ${active 
        ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-slate-900 dark:border-zinc-100 shadow-md' 
        : 'bg-white dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600'}
    `}
  >
    {label}
  </button>
);

const Badge: React.FC<{ label: string; color: string; icon: string }> = ({ label, color, icon }) => (
  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${color}`}>
    <span className="material-symbols-outlined text-[12px]">{icon}</span>
    <span>{label}</span>
  </div>
);

const ActionBtn: React.FC<{ icon: string; tooltip: string; danger?: boolean; onClick: () => void }> = ({ icon, tooltip, danger, onClick }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`p-1.5 rounded-md transition-colors ${
      danger 
        ? 'hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400' 
        : 'hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400'
    }`} 
    title={tooltip}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
  </button>
);

export default RecentTransactions;
