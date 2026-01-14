
import React, { useMemo } from 'react';
import { useTransactions } from './TransactionsContext';

const WeeklyBurnChart: React.FC = () => {
  const { transactions } = useTransactions();

  // --- REAL DATA CALCULATION ---
  const { chartData, trendPercentage, isPositiveTrend } = useMemo(() => {
    const today = new Date();
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const last7Days = [];
    
    // Date ranges
    const startOfCurrentPeriod = new Date();
    startOfCurrentPeriod.setDate(today.getDate() - 6);
    
    const startOfPreviousPeriod = new Date(startOfCurrentPeriod);
    startOfPreviousPeriod.setDate(startOfPreviousPeriod.getDate() - 7);
    
    let totalCurrentWeek = 0;
    let totalPrevWeek = 0;

    // Initialize chart buckets
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      last7Days.push({
        dayName: days[d.getDay()],
        fullDate: d.toDateString(),
        value: 0,
        isToday: i === 0
      });
    }

    // Process transactions
    transactions.forEach(t => {
      if (t.type === 'expense' && t.dateIso) {
        const tDate = new Date(t.dateIso);
        
        // Check if in current 7 days
        if (tDate >= startOfCurrentPeriod && tDate <= today) {
            totalCurrentWeek += Math.abs(t.amount);
            const bucket = last7Days.find(d => d.fullDate === tDate.toDateString());
            if (bucket) bucket.value += Math.abs(t.amount);
        }
        
        // Check if in previous 7 days (for trend)
        // End of prev period is start of current period
        if (tDate >= startOfPreviousPeriod && tDate < startOfCurrentPeriod) {
            totalPrevWeek += Math.abs(t.amount);
        }
      }
    });

    const diff = totalCurrentWeek - totalPrevWeek;
    // Avoid division by zero
    const percentage = totalPrevWeek > 0 ? Math.round((diff / totalPrevWeek) * 100) : (totalCurrentWeek > 0 ? 100 : 0);

    const maxValue = Math.max(...last7Days.map(d => d.value), 100);

    return {
      chartData: last7Days.map(d => ({ ...d, percentageHeight: (d.value / maxValue) * 100 })),
      trendPercentage: Math.abs(percentage),
      isPositiveTrend: percentage < 0 // Spending LESS is positive
    };
  }, [transactions]);

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-[2rem] p-6 shadow-soft dark:shadow-none border border-zinc-200 dark:border-zinc-800 flex flex-col transition-colors h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Gasto Semanal</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Últimos 7 dias</p>
        </div>
        <div className={`px-2 py-1 rounded-lg border flex items-center gap-1 ${isPositiveTrend ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30'}`}>
          <span className={`material-symbols-outlined text-[14px] ${isPositiveTrend ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositiveTrend ? 'trending_down' : 'trending_up'}
          </span>
          <span className={`text-xs font-bold ${isPositiveTrend ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trendPercentage}%
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 px-1 h-40">
        {chartData.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer h-full justify-end">
            <div className="relative w-full flex justify-center h-full items-end">
                {/* Tooltip on Hover */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10">
                    R$ {day.value.toLocaleString()}
                </div>
                
                <div 
                className={`w-full max-w-[24px] rounded-t-lg transition-all duration-500 relative ${
                    day.isToday 
                    ? 'bg-primary shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                    : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary/50'
                }`}
                style={{ height: `${Math.max(day.percentageHeight, 5)}%` }}
                />
            </div>
            <span className={`text-[10px] font-bold ${day.isToday ? 'text-primary' : 'text-zinc-400 dark:text-zinc-500'}`}>
              {day.dayName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyBurnChart;
