
import React, { useMemo } from 'react';
import { useTransactions } from './TransactionsContext';

const TopCategories: React.FC = () => {
  const { transactions } = useTransactions();

  // --- ENGINEERING: Aggregate Real Data ---
  const topCategories = useMemo(() => {
    const expenseTx = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTx.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const catMap: Record<string, number> = {};

    expenseTx.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
    });

    const sorted = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // Top 3
      .map(([name, value], index) => {
        const percentage = totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0;
        
        // Dynamic styling based on index
        let color = 'bg-zinc-500'; 
        if (index === 0) color = 'bg-primary'; 
        if (index === 1) color = 'bg-pink-500';
        if (index === 2) color = 'bg-cyan-500';

        return { name, value, percentage, color };
      });

    return sorted;
  }, [transactions]);

  if (topCategories.length === 0) {
     return (
        <div className="bg-white dark:bg-[#18181b] rounded-[2rem] p-6 shadow-soft dark:shadow-none border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center h-full transition-colors">
            <span className="material-symbols-outlined text-zinc-300 dark:text-zinc-700 text-4xl mb-2">pie_chart</span>
            <p className="text-xs text-zinc-400 font-medium">Sem dados de gastos ainda.</p>
        </div>
     )
  }

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-[2rem] p-6 shadow-soft dark:shadow-none border border-zinc-200 dark:border-zinc-800 flex flex-col transition-colors h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Gastos</h3>
        <button className="text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </div>

      <div className="flex flex-col justify-center gap-5 h-full">
        {topCategories.map((cat, idx) => (
          <div key={idx} className="flex flex-col gap-2 group cursor-default">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`size-2.5 rounded-full ${cat.color} shadow-[0_0_8px_currentColor] opacity-80`}></div>
                <span className="font-medium text-slate-700 dark:text-zinc-200">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-zinc-400 group-hover:text-zinc-500 transition-colors">R$ {cat.value.toLocaleString()}</span>
                 <span className="font-bold text-slate-900 dark:text-white">{cat.percentage}%</span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${cat.color} rounded-full transition-all duration-1000 ease-out`} 
                style={{ width: `${cat.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCategories;
