
import React, { useState, useMemo } from 'react';
import { useTransactions } from './TransactionsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mission } from '../types';

type ViewMode = 'missions' | 'guide' | 'calendar';

interface Belt {
  id: number;
  name: string;
  color: string;
  minXp: number;
  requirement: string;
  wisdom: string;
}

const BELTS: Belt[] = [
  { id: 1, name: 'Faixa Branca', color: 'bg-zinc-100 text-zinc-600 border-zinc-300', minXp: 0, requirement: 'Registrar gastos por 7 dias seguidos.', wisdom: 'A consciência precede o controle. Você não pode gerenciar o que não mede.' },
  { id: 2, name: 'Faixa Amarela', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', minXp: 1000, requirement: 'Saldo positivo no fim do mês.', wisdom: 'Gastar menos do que ganha é a lei fundamental da riqueza.' },
  { id: 3, name: 'Faixa Azul', color: 'bg-blue-100 text-blue-700 border-blue-300', minXp: 3000, requirement: 'Reserva de Emergência (3 meses).', wisdom: 'A segurança financeira elimina a ansiedade e permite decisões inteligentes.' },
  { id: 4, name: 'Faixa Roxa', color: 'bg-purple-100 text-purple-700 border-purple-300', minXp: 6000, requirement: 'Investir 20% da renda mensal.', wisdom: 'Pague-se primeiro. O seu "eu" do futuro agradecerá.' },
  { id: 5, name: 'Faixa Preta', color: 'bg-slate-900 text-white border-slate-700', minXp: 15000, requirement: 'Patrimônio Líquido > R$ 1 Milhão.', wisdom: 'Liberdade. O dinheiro agora trabalha para você, não o contrário.' },
];

const Gamification: React.FC = () => {
  const { userProfile, activeMissions, completeMission, transactions } = useTransactions();
  const [viewMode, setViewMode] = useState<ViewMode>('missions');
  const [showBeltModal, setShowBeltModal] = useState(false);
  
  // --- PROGRESS LOGIC ---
  const currentBeltIndex = BELTS.findIndex((b, i) => userProfile.xp >= b.minXp && userProfile.xp < (BELTS[i+1]?.minXp || Infinity));
  const currentBelt = BELTS[currentBeltIndex] || BELTS[0];
  const nextBelt = BELTS[currentBeltIndex + 1];
  
  const xpInBelt = userProfile.xp - currentBelt.minXp;
  const xpNeeded = nextBelt ? nextBelt.minXp - currentBelt.minXp : 10000;
  const progressPercent = Math.min(100, Math.max(0, (xpInBelt / xpNeeded) * 100));

  // --- CALENDAR DATA ---
  const calendarDays = useMemo(() => {
      const days = [];
      const today = new Date();
      const uniqueDates = new Set(transactions.map(t => t.dateIso?.split('T')[0]));
      
      for(let i=13; i>=0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const hasTx = uniqueDates.has(dateStr);
          days.push({ day: d.getDate(), hasTx, isToday: i===0 });
      }
      return days;
  }, [transactions]);

  return (
    <div className="flex flex-col h-full gap-6 pb-12 animate-fade-in font-sans">
      
      {/* HEADER: The Guide Visualization */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div onClick={() => setShowBeltModal(true)} className="cursor-pointer group">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold mb-1">Seu Nível Atual</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 font-bold text-sm shadow-sm transition-transform group-hover:scale-105 ${currentBelt.color}`}>
                    <span className="material-symbols-outlined text-[18px]">military_tech</span>
                    {currentBelt.name}
                </div>
            </div>
            <div className="text-right">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{userProfile.xp.toLocaleString()} <span className="text-sm font-bold text-zinc-400">XP</span></p>
                {nextBelt && <p className="text-xs text-zinc-500">Próxima: {nextBelt.name} ({nextBelt.minXp} XP)</p>}
            </div>
        </div>

        <div className="relative h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
            <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-violet-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
            <div className="absolute top-0 bottom-0 left-[25%] w-px bg-white/20"></div>
            <div className="absolute top-0 bottom-0 left-[50%] w-px bg-white/20"></div>
            <div className="absolute top-0 bottom-0 left-[75%] w-px bg-white/20"></div>
        </div>
        <p className="text-[10px] text-zinc-400 text-center italic">"A jornada de mil milhas começa com um único depósito."</p>
      </div>

      <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl shrink-0">
        <TabButton icon="target" label="Missões IA" active={viewMode === 'missions'} onClick={() => setViewMode('missions')} />
        <TabButton icon="map" label="O Guia" active={viewMode === 'guide'} onClick={() => setViewMode('guide')} />
        <TabButton icon="calendar_month" label="Consistência" active={viewMode === 'calendar'} onClick={() => setViewMode('calendar')} />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode='wait'>
            
            {/* VIEW: AI MISSIONS */}
            {viewMode === 'missions' && (
                <motion.div 
                    key="missions"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 mb-2 px-2">
                        <span className="material-symbols-outlined text-indigo-500 text-[20px] animate-pulse">psychology</span>
                        <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Geradas para você hoje</h3>
                    </div>

                    {activeMissions.map((mission) => (
                        <MissionCard key={mission.id} mission={mission} onComplete={() => completeMission(mission.id)} />
                    ))}

                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 mt-6">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-sm mb-2">
                            <span className="material-symbols-outlined text-[18px]">trending_up</span>
                            Impacto Financeiro
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                            Ao completar essas missões, você não está apenas ganhando XP no jogo. 
                            Você está aplicando o método de <strong>Micro-Hábitos</strong> para construir um patrimônio real.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* VIEW: THE GUIDE */}
            {viewMode === 'guide' && (
                <motion.div 
                    key="guide"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <div className="px-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">O Caminho do Milhão</h3>
                        <p className="text-sm text-zinc-500">Baseado na metodologia de Faixas Financeiras.</p>
                    </div>

                    <div className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-8 ml-2">
                        {BELTS.map((belt, index) => {
                            const isUnlocked = userProfile.xp >= belt.minXp;
                            const isCurrent = currentBelt.id === belt.id;

                            return (
                                <div key={belt.id} className={`relative ${isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                    <div className={`absolute -left-[31px] top-0 size-4 rounded-full border-2 border-white dark:border-zinc-950 ${isCurrent ? 'bg-indigo-500 scale-125 ring-4 ring-indigo-500/20' : isUnlocked ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
                                    <div className={`p-4 rounded-2xl border ${belt.color} bg-opacity-10 dark:bg-opacity-5 relative overflow-hidden`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-base">{belt.name}</h4>
                                            {isUnlocked && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                                            {!isUnlocked && <span className="text-xs font-mono">{belt.minXp} XP</span>}
                                        </div>
                                        <div className="text-sm font-medium mb-2 flex items-start gap-2">
                                            <span className="material-symbols-outlined text-[16px] mt-0.5">flag</span>
                                            Objetivo Real: {belt.requirement}
                                        </div>
                                        <div className="text-xs italic opacity-80 border-t border-current pt-2 mt-2 border-opacity-20">
                                            "{belt.wisdom}"
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* VIEW: CALENDAR */}
            {viewMode === 'calendar' && (
                <motion.div 
                    key="calendar"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                >
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                            Histórico Recente (14 Dias)
                        </h4>
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((d, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div 
                                        className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                            ${d.hasTx 
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                                : d.isToday 
                                                    ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-500' 
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                            }
                                        `}
                                    >
                                        {d.day}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-center text-zinc-400 mt-4">
                            Estudos mostram que 66 dias de repetição criam um hábito automático. Mantenha o fogo aceso!
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showBeltModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBeltModal(false)} />
                <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="relative bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="size-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                            <span className="material-symbols-outlined text-4xl">military_tech</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sistema de Faixas</h3>
                        <p className="text-sm text-zinc-500">Metodologia FluxCash</p>
                    </div>
                    <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
                        <p>O XP no FluxCash não é apenas um número. Ele representa sua <strong>maturidade financeira</strong>.</p>
                        <p>Cada faixa exige comportamentos diferentes:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Branca:</strong> Hábito de registrar.</li>
                            <li><strong>Azul:</strong> Hábito de poupar.</li>
                            <li><strong>Preta:</strong> Hábito de multiplicar.</li>
                        </ul>
                    </div>
                    <button onClick={() => setShowBeltModal(false)} className="w-full mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold">Entendi</button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabButton: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${active ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>
        <span className={`material-symbols-outlined text-[20px] ${active ? 'filled' : ''}`}>{icon}</span>
        {label}
    </button>
);

const MissionCard: React.FC<{ mission: Mission; onComplete: () => void }> = ({ mission, onComplete }) => {
    return (
        <div 
            onClick={() => !mission.isCompleted && onComplete()}
            className={`
                relative p-4 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group
                ${mission.isCompleted 
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 opacity-50' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md'
                }
            `}
        >
            <div className="flex items-start gap-4">
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${mission.isCompleted ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                    <span className="material-symbols-outlined text-[20px]">{mission.isCompleted ? 'check' : mission.icon}</span>
                </div>
                
                <div className="flex-1">
                    <h4 className={`font-bold text-sm ${mission.isCompleted ? 'text-emerald-800 dark:text-emerald-200 line-through' : 'text-slate-900 dark:text-white'}`}>
                        {mission.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{mission.desc}</p>
                </div>

                <div className="flex flex-col items-end justify-center h-full">
                    <span className={`text-xs font-black ${mission.isCompleted ? 'text-emerald-600' : 'text-indigo-600 dark:text-indigo-400'}`}>+{mission.xp} XP</span>
                </div>
            </div>
        </div>
    );
};

export default Gamification;
