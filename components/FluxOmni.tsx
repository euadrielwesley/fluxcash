
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewType } from '../types';
import { useTransactions } from './TransactionsContext';
import { useIntegration } from './IntegrationContext';
import { AIService } from '../services/AIService';

interface FluxOmniProps {
  currentView: ViewType;
  onOpenAddModal: () => void;
  onNavigateWallet?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const FluxOmni: React.FC<FluxOmniProps> = ({ currentView, onOpenAddModal, onNavigateWallet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'action' | 'chat'>('action'); // 'action' = Magic Input, 'chat' = AI Chat
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Olá! Sou sua IA Financeira. Posso analisar seus gastos, sugerir cortes ou explicar conceitos. Como ajudo?', timestamp: Date.now() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { transactions, balance, expenses, income } = useTransactions();
  const { integrations } = useIntegration();
  const { addTransaction } = useTransactions();

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Magic Input Logic (Legacy but useful)
  const handleMagicAction = () => {
    if (!input.trim()) return;
    const lower = input.toLowerCase();
    const numbers = input.match(/\d+([.,]\d+)?/);

    if (numbers) {
      // It's a quick add
      let type: 'expense' | 'income' = 'expense';
      let amount = parseFloat(numbers[0].replace(',', '.'));
      if (lower.includes('recebi') || lower.includes('ganhei')) type = 'income';

      addTransaction({
        title: input.replace(numbers ? numbers[0] : '', '').trim() || 'Nova Transação',
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        type,
        category: 'Geral',
        account: 'Carteira',
        icon: type === 'income' ? 'savings' : 'receipt',
        colorClass: type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
      });
      setInput('');
      setIsOpen(false);
      setMode('action');
    } else {
      // It's a question -> Switch to Chat
      setMode('chat');
      handleChatSubmit();
    }
  };

  const handleChatSubmit = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setMode('chat');

    try {
      // 1. Select Active AI Provider
      const activeProvider = Object.values(integrations).find(i => (i.id === 'gemini' || i.id === 'groq' || i.id === 'openai') && i.enabled);

      if (!activeProvider) {
        throw new Error('Nenhuma IA ativa. Vá em Ajustes > Integrações e ative Gemini ou Groq.');
      }

      // 2. Build Context (RAG Lite)
      const context = `
        CONTEXTO FINANCEIRO DO USUÁRIO:
        - Saldo Atual: R$ ${balance}
        - Receitas Mês: R$ ${income}
        - Despesas Mês: R$ ${expenses}
        - Últimas 5 Transações: ${JSON.stringify(transactions.slice(0, 5).map(t => ({ t: t.title, v: t.amount, c: t.category })))}
        
        Você é um consultor financeiro "Cool" e direto. Responda à pergunta do usuário com base nesses dados. Seja breve.
      `;

      // 3. Call AI
      const response = await AIService.generateCompletion(activeProvider, {
        messages: [
          { role: 'system', content: context },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMsg.content }
        ]
      });

      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: Date.now() }]);

    } catch (error: any) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: `Erro: ${error.message}`, timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-white/80 dark:bg-black/80 z-[90] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div className="fixed z-[100] bottom-6 right-6 flex flex-col items-end gap-4 pointer-events-none">

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto w-[90vw] md:w-[380px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[600px]"
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-sm text-slate-800 dark:text-zinc-100">FluxCash AI</span>
                </div>
                <button onClick={() => setMode(mode === 'action' ? 'chat' : 'action')} className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-emerald-500 transition-colors">
                  {mode === 'action' ? 'Ir para Chat' : 'Modo Rápido'}
                </button>
              </div>

              {/* Chat Area */}
              {mode === 'chat' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] bg-zinc-50 dark:bg-black/20">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                          ? 'bg-emerald-500 text-white rounded-tr-sm'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-tl-sm'
                        }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-sm border border-zinc-200 dark:border-zinc-700 flex gap-1">
                        <div className="size-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="size-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="size-2 bg-zinc-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Action/Input Area */}
              <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                {mode === 'action' && (
                  <div className="mb-4 text-center">
                    <p className="text-xs text-zinc-500 mb-2">Dica: Digite "Uber 25" para gastar ou uma pergunta para a IA.</p>
                  </div>
                )}
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (mode === 'chat' ? handleChatSubmit() : handleMagicAction())}
                    placeholder={mode === 'chat' ? "Pergunte sobre suas finanças..." : "Ex: Café 15,00"}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl py-3 pl-4 pr-12 text-sm font-medium text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <button
                    onClick={mode === 'chat' ? handleChatSubmit : handleMagicAction}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 dark:bg-white rounded-lg text-white dark:text-slate-900 hover:scale-105 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {mode === 'chat' ? 'send' : 'check'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            pointer-events-auto size-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-colors relative z-50
            ${isOpen ? 'bg-zinc-800 dark:bg-zinc-700 rotate-45' : 'bg-gradient-to-tr from-emerald-600 to-teal-500'}
          `}
        >
          <span className="material-symbols-outlined text-[28px]">smart_toy</span>
        </motion.button>
      </div>
    </>
  );
};

export default FluxOmni;
