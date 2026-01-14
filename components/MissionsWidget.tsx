
import React, { useMemo } from 'react';
import { useTransactions } from './TransactionsContext';

const MissionsWidget: React.FC = () => {
  const { activeMissions, completeMission } = useTransactions();

  // Find the highest priority UNCOMPLETED mission
  // If all completed, show the last one completed or a generic "All Done" state
  const activeMission = useMemo(() => {
    return activeMissions.find(m => !m.isCompleted) || activeMissions[activeMissions.length - 1];
  }, [activeMissions]);

  if (!activeMission) return null;

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-[2rem] p-6 shadow-soft dark:shadow-none border border-zinc-200 dark:border-zinc-800 flex flex-col h-full relative overflow-hidden group hover:border-violet-500/30 transition-colors">
      
      {/* Dynamic Header based on Mission Category */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 ${activeMission.textColor}`}>
                    {activeMission.category}
                </span>
                {!activeMission.isCompleted && (
                    <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeMission.textColor.split(' ')[0].replace('text-', 'bg-')}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${activeMission.textColor.split(' ')[0].replace('text-', 'bg-')}`}></span>
                    </span>
                )}
            </div>
            <h3 className={`text-lg font-bold leading-tight ${activeMission.isCompleted ? 'text-zinc-400 line-through' : 'text-slate-900 dark:text-white'}`}>
               {activeMission.title}
            </h3>
        </div>
        
        {/* XP Badge */}
        <div className={`flex flex-col items-center justify-center size-12 rounded-2xl bg-gradient-to-br ${activeMission.color} text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
            {activeMission.isCompleted ? (
                <span className="material-symbols-outlined text-2xl">check</span>
            ) : (
                <>
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span className="text-[10px] font-black">+{activeMission.xp}</span>
                </>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between relative z-10">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {activeMission.desc}
        </p>

        {!activeMission.isCompleted ? (
            <button 
                onClick={() => completeMission(activeMission.id)}
                className={`w-full mt-4 py-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 group/btn ${activeMission.bg} border-transparent hover:border-current ${activeMission.textColor}`}
            >
                <span className="material-symbols-outlined text-[16px] group-hover/btn:animate-bounce">{activeMission.icon}</span>
                {activeMission.actionLabel || 'Completar Missão'}
            </button>
        ) : (
            <div className="w-full mt-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-bold text-xs flex items-center justify-center gap-2 cursor-default">
                Missão Concluída
            </div>
        )}
      </div>

      {/* Decorative Background Blob */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 bg-gradient-to-tr ${activeMission.color}`}></div>
    </div>
  );
};

export default MissionsWidget;
