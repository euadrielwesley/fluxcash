
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewType } from '../types';
import { useTransactions } from './TransactionsContext';

interface FluxOmniProps {
  currentView: ViewType;
  onOpenAddModal: () => void;
  onNavigateWallet?: () => void;
}

interface ActionItem {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
}

const FluxOmni: React.FC<FluxOmniProps> = ({ currentView, onOpenAddModal, onNavigateWallet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [magicInput, setMagicInput] = useState('');
  const { addTransaction } = useTransactions();
  
  // Context Intelligence: Logic to decide what to show
  const getContextActions = (): ActionItem[] => {
    switch (currentView) {
      case 'dashboard':
        return [
          { id: 'quick_expense', label: 'Lançar Gasto', icon: 'flash_on', onClick: onOpenAddModal },
          // Voice uses the same modal, just passing different intent ideally, but for now generic modal is fine
          { id: 'voice', label: 'Input de Voz', icon: 'mic', onClick: onOpenAddModal }, 
        ];
      case 'wallet':
        return [
          // Simplified to generic add, as Add Card is inside Wallet Page state
          { id: 'generic_add', label: 'Nova Transação', icon: 'add', onClick: onOpenAddModal },
        ];
      case 'income':
        return [
          { id: 'new_invoice', label: 'Novo Recebível', icon: 'attach_money', onClick: onOpenAddModal },
        ];
      default:
        return [
          { id: 'generic_add', label: 'Adicionar', icon: 'add', onClick: onOpenAddModal },
          { id: 'wallet_nav', label: 'Ir para Carteira', icon: 'account_balance_wallet', onClick: onNavigateWallet || (() => {}) },
        ];
    }
  };

  const handleMagicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicInput.trim()) return;

    const lower = magicInput.toLowerCase();
    let type: 'expense' | 'income' = 'expense';
    let amount = 0;
    
    // Simple regex to find amounts like 50, 50.00, 50,00
    const numbers = magicInput.match(/\d+([.,]\d+)?/);
    if (numbers) {
      amount = parseFloat(numbers[0].replace(',', '.'));
    }

    if (lower.includes('recebi') || lower.includes('ganhei') || lower.includes('entrada') || lower.includes('deposito')) {
      type = 'income';
    }

    addTransaction({
      title: magicInput.replace(numbers ? numbers[0] : '', '').trim() || 'Nova Transação',
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      type,
      category: 'Geral',
      account: 'Carteira',
      icon: type === 'income' ? 'savings' : 'receipt',
      colorClass: type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
    });

    setMagicInput('');
    setIsOpen(false);
  };

  const contextActions = getContextActions();

  return (
    <>
      {/* Dimmed Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-white/80 dark:bg-black/80 z-[90]"
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed z-[100] flex flex-col gap-4 pointer-events-none
        bottom-6 left-1/2 -translate-x-1/2 items-center 
        md:bottom-8 md:right-8 md:left-auto md:translate-x-0 md:items-end
      `}>
        
        {/* Expanded Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="pointer-events-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 w-[300px] flex flex-col gap-4 shadow-none ring-1 ring-black/5"
            >
              {/* 1. Magic Input */}
              <div>
                <form onSubmit={handleMagicSubmit} className="relative">
                  <input
                    autoFocus
                    type="text"
                    value={magicInput}
                    onChange={(e) => setMagicInput(e.target.value)}
                    placeholder="Ex: Almoço 45,00"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl py-3 pl-3 pr-10 text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-600 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 dark:bg-white rounded-lg text-white dark:text-slate-900 disabled:opacity-50"
                    disabled={!magicInput}
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  </button>
                </form>
                <p className="text-[10px] text-zinc-400 mt-2 px-1">
                  Digite "Recebi 100" para entrada ou "Pizza 50" para gasto.
                </p>
              </div>

              {/* 2. Context Actions */}
              <div className="grid grid-cols-2 gap-2">
                {contextActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => { action.onClick(); setIsOpen(false); }}
                    className="flex flex-col items-center justify-center gap-2 py-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors group"
                  >
                    <div className="size-8 rounded-full bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px] text-slate-700 dark:text-zinc-200">{action.icon}</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            pointer-events-auto size-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-colors relative z-50
            ${isOpen ? 'bg-zinc-800 dark:bg-zinc-700 rotate-45' : 'bg-slate-900 dark:bg-emerald-600'}
          `}
        >
          <span className="material-symbols-outlined text-[28px] transition-transform duration-300">add</span>
        </motion.button>
      </div>
    </>
  );
};

export default FluxOmni;
