
import React, { useState } from 'react';
import { useTransactions } from './TransactionsContext';

const Alerts: React.FC = () => {
  const { balance, expenses } = useTransactions();
  const [dismissed, setDismissed] = useState<string[]>([]);

  // CS Logic: Create "Tasks" not just "Alerts"
  const generateInsights = () => {
    const list = [];

    // 1. High Priority: Negative Balance
    if (balance < 0) {
      list.push({
        id: 'neg_bal',
        type: 'critical',
        title: 'Saldo Negativo',
        desc: 'Sua conta entrou no vermelho. Evite juros.',
        action: 'Cobrir Agora',
        icon: 'gpp_bad'
      });
    }

    // 2. Medium: Budget Warning
    const budget = 5000;
    if (expenses > budget * 0.9) {
      list.push({
        id: 'budget_warn',
        type: 'warning',
        title: 'Atenção ao Limite',
        desc: 'Você atingiu 90% do orçamento planejado.',
        action: 'Revisar Gastos',
        icon: 'data_usage'
      });
    }

    // 3. Growth/Positive: Investment Opportunity
    if (balance > 2000) {
      list.push({
        id: 'invest_opp',
        type: 'opportunity',
        title: 'Dinheiro Parado',
        desc: 'Você tem R$ 2k livres. Que tal investir?',
        action: 'Ver CDBs',
        icon: 'trending_up'
      });
    }

    // 4. Smart: Subscription Check
    list.push({
      id: 'sub_check',
      type: 'info',
      title: 'Netflix subiu',
      desc: 'Sua assinatura aumentou R$ 5,00 este mês.',
      action: 'Confirmar',
      icon: 'subscriptions'
    });

    return list.filter(i => !dismissed.includes(i.id));
  };

  const insights = generateInsights();

  const handleDismiss = (id: string) => {
    setDismissed(prev => [...prev, id]);
  };

  const getStyles = (type: string) => {
    switch(type) {
      case 'critical': return 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-300';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300';
      case 'opportunity': return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300';
      default: return 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300';
    }
  };

  if (insights.length === 0) {
    return (
      <div className="bg-white dark:bg-[#18181b] rounded-2xl p-6 shadow-soft dark:shadow-none border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center h-full text-center transition-colors">
        <div className="size-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check</span>
        </div>
        <p className="font-bold text-slate-900 dark:text-zinc-100">Tudo em ordem!</p>
        <p className="text-xs text-zinc-500">Nenhuma pendência financeira hoje.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-2xl p-6 shadow-soft dark:shadow-none border border-zinc-200 dark:border-zinc-800 flex flex-col h-full transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
           <span className="material-symbols-outlined text-amber-500 filled">lightbulb</span>
           Insights
           <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-full">{insights.length}</span>
        </h3>
      </div>
      
      <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[250px] pr-1">
        {insights.map(item => (
          <div key={item.id} className={`p-3 rounded-xl border relative group transition-all hover:shadow-md ${getStyles(item.type)}`}>
            <button 
              onClick={() => handleDismiss(item.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
            
            <div className="flex gap-3">
              <div className={`mt-0.5 p-1.5 rounded-lg bg-white/50 dark:bg-black/20 shrink-0 h-fit`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm leading-tight mb-1">{item.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed mb-2 pr-4">{item.desc}</p>
                <button className="text-xs font-bold bg-white/60 dark:bg-black/30 hover:bg-white/90 dark:hover:bg-black/50 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                  {item.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
