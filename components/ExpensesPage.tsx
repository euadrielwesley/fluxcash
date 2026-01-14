
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from './TransactionsContext';
import { useNotification } from './NotificationContext';
import { Debt } from '../types';

interface ExpensesPageProps {
  onBack: () => void;
  onMenuClick: () => void;
}

type Tab = 'monthly' | 'debt';

const ExpensesPage: React.FC<ExpensesPageProps> = ({ onBack, onMenuClick }) => {
  const { transactions, addTransaction, debts, addDebt, updateDebt } = useTransactions();
  const { pushNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<Tab>('monthly');
  const [showAddDebt, setShowAddDebt] = useState(false);
  
  // Simulation States
  const [simulatingDebtId, setSimulatingDebtId] = useState<number | string | null>(null);
  const [simulatedDiscount, setSimulatedDiscount] = useState<{ newVal: number, saving: number, installmentsToPay: number } | null>(null);
  const [installmentsToAnticipate, setInstallmentsToAnticipate] = useState(1);

  // Filter recurring expenses from real data
  const recurringExpenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense' && (t.isRecurring || t.installment));
  }, [transactions]);

  const handleSimulate = (id: number | string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    
    // Logic: Simple compound interest discount simulation (0.8% a.m.)
    const interestRate = 0.008; 
    
    // We simulate paying X installments from the *end* (backwards)
    const discountFactor = 1 - (1 / Math.pow(1 + interestRate, debt.total_installments - debt.paid_installments)); // Simplified
    
    // Value of 1 installment with discount
    const rawDiscount = debt.value_parcel * discountFactor * 0.5; // Conservative estimate
    
    const saving = rawDiscount * installmentsToAnticipate;
    const cost = (debt.value_parcel * installmentsToAnticipate) - saving;

    setSimulatedDiscount({
      newVal: cost,
      saving: saving,
      installmentsToPay: installmentsToAnticipate
    });
    setSimulatingDebtId(id);
  };

  const handlePayDebt = () => {
    if (!simulatedDiscount || simulatingDebtId === null) return;
    
    const debt = debts.find(d => d.id === simulatingDebtId);
    if (!debt) return;

    const paymentAmount = simulatedDiscount.newVal;

    // 1. Record Transaction
    addTransaction({
        title: `Amortização: ${debt.name}`,
        amount: -paymentAmount,
        category: 'Dívidas',
        account: 'Conta Principal',
        type: 'expense',
        icon: 'price_check',
        colorClass: 'bg-emerald-100 text-emerald-600'
    });

    // 2. Update Debt State (Via Context -> Supabase)
    const newPaid = Math.min(debt.total_installments, debt.paid_installments + simulatedDiscount.installmentsToPay);
    const newBalance = Math.max(0, debt.current_balance - paymentAmount);
    
    updateDebt(debt.id, {
        paid_installments: newPaid,
        current_balance: newBalance
    });
    
    pushNotification({
        title: 'Amortização Realizada!',
        message: `Você economizou R$ ${simulatedDiscount.saving.toLocaleString()} nesta operação.`,
        type: 'success',
        category: 'financial'
    });

    handleCloseSimulate();
  };

  const handleAddDebt = (newDebt: Omit<Debt, 'id'>) => {
    addDebt(newDebt); // Context handle UUID generation via DB response
    setShowAddDebt(false);
    pushNotification({
      title: 'Dívida Adicionada',
      message: 'Novo passivo registrado para monitoramento.',
      type: 'success',
      category: 'financial'
    });
  };

  const handleCloseSimulate = () => {
    setSimulatingDebtId(null);
    setSimulatedDiscount(null);
    setInstallmentsToAnticipate(1);
  };

  const handleNegotiate = (serviceName: string) => {
    const text = `Olá, sou cliente do ${serviceName} e gostaria de renegociar meu plano atual ou cancelá-lo, pois recebi uma oferta melhor da concorrência.`;
    navigator.clipboard.writeText(text);
    pushNotification({
        title: 'Script Copiado!',
        message: 'Cole no chat de suporte do serviço para tentar um desconto.',
        type: 'info',
        category: 'gamification'
    });
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-zinc-950 md:rounded-3xl shadow-soft md:border border-zinc-100 dark:border-zinc-800 overflow-hidden relative transition-colors">
       <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex flex-col gap-4 shrink-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <button onClick={onBack} className="hidden lg:flex p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Saídas & Passivos</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Gerencie seus custos fixos e quite dívidas.</p>
            </div>
          </div>
        </div>
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-full max-w-md border border-zinc-200 dark:border-zinc-800">
          <button onClick={() => setActiveTab('monthly')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'monthly' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600'}`}>
            <span className="material-symbols-outlined text-[16px]">calendar_month</span> Despesas Fixas
          </button>
          <button onClick={() => setActiveTab('debt')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'debt' ? 'bg-white dark:bg-zinc-800 shadow-sm text-rose-600 dark:text-rose-400' : 'text-zinc-400 hover:text-zinc-600'}`}>
            <span className="material-symbols-outlined text-[16px]">trending_down</span> Dívidas Ativas
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
        {activeTab === 'monthly' ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {recurringExpenses.length > 0 ? (
              recurringExpenses.map(expense => (
                <div key={expense.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-xl flex items-center justify-center ${expense.colorClass} bg-opacity-20`}>
                      <span className="material-symbols-outlined text-[24px]">{expense.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{expense.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{expense.category}</span>
                        {expense.installment && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">{expense.installment}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      <span className="font-bold text-rose-600 dark:text-rose-400">R$ {Math.abs(expense.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      
                      <button 
                        onClick={() => handleNegotiate(expense.title)}
                        className="hidden md:flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors"
                        title="Copiar script de negociação"
                      >
                        <span className="material-symbols-outlined text-[14px]">support_agent</span>
                        Negociar
                      </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400 dark:text-zinc-500">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-3">
                    <span className="material-symbols-outlined text-4xl opacity-50">event_busy</span>
                </div>
                <p className="text-sm font-medium">Nenhuma despesa recorrente.</p>
                <p className="text-xs mt-1">Marque "Recorrência" ao adicionar um gasto.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {debts.map((debt) => {
              const progress = (debt.paid_installments / debt.total_installments) * 100;
              const isPaidOff = debt.paid_installments >= debt.total_installments;

              return (
              <div key={debt.id} className={`bg-white dark:bg-zinc-900 rounded-3xl border p-6 flex flex-col justify-between relative group overflow-hidden transition-all hover:shadow-lg ${isPaidOff ? 'border-emerald-200 dark:border-emerald-800' : 'border-zinc-200 dark:border-zinc-800'}`}>
                
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-100 dark:bg-zinc-800">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out ${isPaidOff ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-orange-500'}`} 
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm ${isPaidOff ? 'bg-emerald-500' : debt.color}`}>
                        {isPaidOff ? 'QUITADO' : debt.bank}
                    </span>
                    <button className="text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </div>
                  
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-lg leading-tight mb-1">{debt.name}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                    {debt.paid_installments}/{debt.total_installments} parcelas pagas
                  </p>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-6 flex flex-col gap-2 border border-zinc-100 dark:border-zinc-800">
                     <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Saldo Devedor</span>
                        <span className="font-bold text-slate-900 dark:text-white">R$ {debt.current_balance.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Parcela</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300">R$ {debt.value_parcel.toLocaleString()}</span>
                     </div>
                  </div>
                </div>

                {!isPaidOff && (
                    <button 
                    onClick={() => handleSimulate(debt.id)}
                    className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                    >
                    <span className="material-symbols-outlined text-[16px]">savings</span>
                    Simular Antecipação
                    </button>
                )}

                {isPaidOff && (
                    <div className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-800">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Parabéns! Livre desta dívida.
                    </div>
                )}

                <AnimatePresence>
                  {simulatingDebtId === debt.id && simulatedDiscount && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl z-20 p-6 flex flex-col justify-between"
                    >
                      <div>
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="font-bold text-slate-900 dark:text-white text-lg">Amortizar</h5>
                            <button onClick={handleCloseSimulate} className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full text-zinc-500"><span className="material-symbols-outlined text-sm">close</span></button>
                          </div>
                          
                          <div className="mb-4">
                             <label className="text-xs font-bold text-zinc-500 uppercase">Qtd. Parcelas (do fim)</label>
                             <div className="flex items-center gap-3 mt-2">
                                <button onClick={() => setInstallmentsToAnticipate(Math.max(1, installmentsToAnticipate - 1))} className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-lg">-</button>
                                <span className="font-mono text-xl font-bold w-8 text-center">{installmentsToAnticipate}</span>
                                <button onClick={() => setInstallmentsToAnticipate(Math.min(debt.total_installments - debt.paid_installments, installmentsToAnticipate + 1))} className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-lg">+</button>
                                <button onClick={() => handleSimulate(debt.id)} className="ml-auto text-xs text-blue-500 font-bold">Recalcular</button>
                             </div>
                          </div>

                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase">Valor a Pagar</span>
                                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">R$ {simulatedDiscount.newVal.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-emerald-600/80 dark:text-emerald-400/70">
                                <span>Economia Real</span>
                                <span className="font-bold">R$ {simulatedDiscount.saving.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                      </div>

                      <button 
                        onClick={handlePayDebt} 
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined">payments</span>
                        Registrar Pagamento
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )})}
            
            {debts.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">thumb_up</span>
                    <p className="text-sm font-bold">Nenhuma dívida ativa.</p>
                    <p className="text-xs">Você está livre de pendências financeiras!</p>
                </div>
            )}

            <button 
              onClick={() => setShowAddDebt(true)}
              className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 text-zinc-400 dark:text-zinc-600 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group min-h-[300px]"
            >
                <div className="size-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <span className="font-bold text-sm">Adicionar Dívida</span>
                <p className="text-xs text-center mt-2 max-w-[150px] opacity-70">Acompanhe financiamentos e empréstimos</p>
            </button>
          </div>
        )}
      </div>
      
      {/* ADD DEBT MODAL */}
      <AnimatePresence>
        {showAddDebt && (
          <AddDebtModal onClose={() => setShowAddDebt(false)} onSave={handleAddDebt} />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddDebtModal: React.FC<{ onClose: () => void; onSave: (debt: Omit<Debt, 'id'>) => void }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [total, setTotal] = useState('');
  const [paid, setPaid] = useState('');
  const [amount, setAmount] = useState('');
  const [parcel, setParcel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !parcel) return;

    onSave({
      name,
      bank: bank || 'Outro',
      total_installments: Number(total),
      paid_installments: Number(paid),
      original_debt: Number(amount),
      current_balance: Number(amount) - (Number(parcel) * Number(paid)), // Roughly logic
      value_parcel: Number(parcel),
      color: 'bg-slate-700'
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Novo Passivo / Dívida</h3>
         <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white" placeholder="Nome (Ex: Financiamento Carro)" value={name} onChange={e => setName(e.target.value)} required />
            <input className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white" placeholder="Instituição / Banco" value={bank} onChange={e => setBank(e.target.value)} />
            
            <div className="grid grid-cols-2 gap-3">
              <input type="number" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white" placeholder="Valor Total Original" value={amount} onChange={e => setAmount(e.target.value)} required />
              <input type="number" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white" placeholder="Valor da Parcela" value={parcel} onChange={e => setParcel(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="number" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white" placeholder="Total Parcelas" value={total} onChange={e => setTotal(e.target.value)} required />
              <input type="number" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white" placeholder="Já Pagas" value={paid} onChange={e => setPaid(e.target.value)} />
            </div>

            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-2">Salvar Dívida</button>
         </form>
      </motion.div>
    </div>
  )
}

export default ExpensesPage;
