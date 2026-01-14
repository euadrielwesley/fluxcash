
import React, { useState, useEffect, useMemo } from 'react';
import { useTransactions } from './TransactionsContext';

interface MonthlyReviewProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLIDE_DURATION = 5000;

const MonthlyReview: React.FC<MonthlyReviewProps> = ({ isOpen, onClose }) => {
  const { transactions } = useTransactions();
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- DYNAMIC DATA CALCULATION ---
  const stats = useMemo(() => {
    const today = new Date();
    // Target: Previous Month
    const targetMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    const targetYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
    const targetDate = new Date(targetYear, targetMonth, 1);
    const monthName = targetDate.toLocaleDateString('pt-BR', { month: 'long' });

    // Compare with: 2 Months ago
    const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1;
    const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear;

    let income = 0;
    let expense = 0;
    let prevExpense = 0;
    const categoryMap: Record<string, number> = {};

    transactions.forEach(t => {
        if (!t.dateIso) return;
        const d = new Date(t.dateIso);
        
        // Current Target Month
        if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
            if (t.type === 'income') income += t.amount;
            else {
                const val = Math.abs(t.amount);
                expense += val;
                categoryMap[t.category] = (categoryMap[t.category] || 0) + val;
            }
        }
        
        // Comparison Month
        if (d.getMonth() === prevMonth && d.getFullYear() === prevYear && t.type === 'expense') {
            prevExpense += Math.abs(t.amount);
        }
    });

    const balance = income - expense;
    
    // Find Villain (Max Category)
    const sortedCats = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    const villain = sortedCats.length > 0 ? sortedCats[0] : ['Nada', 0];

    return {
        monthName,
        income,
        expense,
        balance,
        villainCategory: villain[0],
        villainAmount: villain[1],
        prevExpense,
        saved: prevExpense - expense // Positive means saved money vs previous month
    };
  }, [transactions]);

  useEffect(() => {
    if (isOpen) setCurrentSlide(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (currentSlide === 3) return; // Stop on last slide

    const timer = setTimeout(() => {
      handleNext();
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [isOpen, currentSlide]);

  const handleNext = () => {
    if (currentSlide < 3) setCurrentSlide(prev => prev + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 text-white font-sans flex flex-col overflow-hidden animate-fade-in">
      
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 pt-6 flex gap-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all ease-linear ${
                index < currentSlide ? 'w-full duration-0' : 
                index === currentSlide ? 'w-full duration-[5000ms]' : 'w-0 duration-0'
              }`}
            />
          </div>
        ))}
      </div>

      <button onClick={onClose} className="absolute top-6 right-4 z-50 p-2 text-white/50 hover:text-white transition-colors">
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>

      <div className="absolute inset-0 z-40 flex">
        <div className="w-1/3 h-full cursor-w-resize" onClick={handlePrev} title="Voltar" />
        <div className="w-2/3 h-full cursor-e-resize" onClick={handleNext} title="Avançar" />
      </div>

      <div className="flex-1 relative flex items-center justify-center pointer-events-none z-30">
        
        {/* SLIDE 0: SUMMARY */}
        {currentSlide === 0 && (
          <div className="flex flex-col items-center w-full max-w-md px-8 animate-zoom-in">
            <h2 className="text-3xl font-black text-center mb-12 tracking-tight capitalize">
              {stats.monthName} foi <span className="text-indigo-400">intenso</span>!
            </h2>
            
            <div className="relative w-full h-64 mb-12">
              <div className="absolute top-0 left-0 size-40 rounded-full bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 flex flex-col items-center justify-center p-4 animate-float">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-1">Entrou</span>
                <span className="text-xl font-bold text-emerald-100">R$ {stats.income > 1000 ? (stats.income/1000).toFixed(1)+'k' : stats.income}</span>
              </div>
              
              <div className="absolute bottom-0 right-0 size-44 rounded-full bg-rose-600/20 backdrop-blur-md border border-rose-500/30 flex flex-col items-center justify-center p-4 animate-float-reverse">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-300 mb-1">Saiu</span>
                <span className="text-xl font-bold text-rose-100">R$ {stats.expense > 1000 ? (stats.expense/1000).toFixed(1)+'k' : stats.expense}</span>
              </div>
            </div>

            <div className="text-center space-y-2 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl w-full">
              <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider">Resultado Final</p>
              <p className={`text-4xl font-black ${stats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.balance >= 0 ? '+' : ''} R$ {Math.abs(stats.balance).toLocaleString('pt-BR', {maximumFractionDigits:0})} <span className="text-2xl">{stats.balance >= 0 ? '🎉' : '💸'}</span>
              </p>
            </div>
          </div>
        )}

        {/* SLIDE 1: VILLAIN */}
        {currentSlide === 1 && (
          <div className="flex flex-col items-center w-full max-w-md px-8 animate-slide-right">
            <div className="absolute inset-0 bg-rose-900/20 z-[-1] transition-colors duration-1000" />
            
            <div className="size-32 bg-rose-500/20 rounded-full flex items-center justify-center mb-8 border-4 border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.3)] animate-pulse">
              <span className="material-symbols-outlined text-[64px] text-rose-400">warning</span>
            </div>

            <h2 className="text-3xl font-black text-center mb-4 leading-none">
              O foco foi em <span className="text-rose-500 underline decoration-rose-500/30">{stats.villainCategory}</span>.
            </h2>
            
            <p className="text-lg text-zinc-300 text-center mb-12">
              Você destinou <strong className="text-white text-2xl block mt-2">R$ {stats.villainAmount.toLocaleString()}</strong> para esta categoria.
            </p>
          </div>
        )}

        {/* SLIDE 2: COMPARISON */}
        {currentSlide === 2 && (
          <div className="flex flex-col items-center w-full max-w-md px-8 animate-slide-right">
            <div className="absolute inset-0 bg-emerald-900/20 z-[-1] transition-colors duration-1000" />

            {stats.saved > 0 ? (
                <>
                    <h2 className="text-3xl font-bold text-center mb-12">
                    Você gastou <span className="text-emerald-400">menos</span> que no mês anterior!
                    </h2>
                    <p className="text-center text-lg font-medium text-emerald-100">
                    Economia de <span className="font-bold text-white text-3xl block mt-2">R$ {stats.saved.toLocaleString()}</span>
                    </p>
                </>
            ) : (
                <>
                    <h2 className="text-3xl font-bold text-center mb-12">
                    Atenção aos gastos totais.
                    </h2>
                    <p className="text-center text-lg font-medium text-rose-200">
                    Você gastou <span className="font-bold text-white text-3xl block mt-2">R$ {Math.abs(stats.saved).toLocaleString()}</span> a mais que no mês anterior.
                    </p>
                </>
            )}
          </div>
        )}

        {/* SLIDE 3: REWARD */}
        {currentSlide === 3 && (
          <div className="flex flex-col items-center w-full max-w-md px-8 animate-pop-in">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               {[...Array(20)].map((_, i) => (
                 <div key={i} className="absolute text-2xl animate-fall" 
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `-10%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 3}s`
                      }}>
                    ✨
                 </div>
               ))}
            </div>

            <div className="relative mb-10">
              <div className="absolute inset-0 bg-amber-500 blur-[60px] opacity-40 animate-pulse"></div>
              <div className="relative size-48 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-amber-200">
                <span className="material-symbols-outlined text-[80px] text-amber-950 filled">verified</span>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-amber-600 px-4 py-1 rounded-full font-black uppercase tracking-widest text-sm shadow-lg whitespace-nowrap">
                Mês Concluído
              </div>
            </div>

            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 mb-2">
              +500 XP
            </h2>
            <p className="text-zinc-400 mb-12">A consistência é a chave da riqueza.</p>

            <button 
              onClick={onClose}
              className="pointer-events-auto w-full py-4 bg-white text-zinc-900 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              Continuar
            </button>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pop-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slide-right { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float-reverse { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(20px); } }
        @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-zoom-in { animation: zoom-in 0.5s ease-out forwards; }
        .animate-pop-in { animation: pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-slide-right { animation: slide-right 0.5s ease-out forwards; }
        .animate-float { animation: float 4s infinite ease-in-out; }
        .animate-float-reverse { animation: float-reverse 5s infinite ease-in-out; }
        .animate-fall { animation: fall 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default MonthlyReview;
