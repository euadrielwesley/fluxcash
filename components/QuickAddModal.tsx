import React, { useEffect, useState } from 'react';
import { useTransactions } from './TransactionsContext';
import { Transaction } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
}

type TransactionType = 'expense' | 'income' | 'transfer';
type InputMode = 'single' | 'bulk';

interface BulkItem {
  id: string;
  title: string;
  amount: number;
  category: string;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addTransaction, editTransaction, aiRules, customCategories } = useTransactions();
  
  // Modes
  const [mode, setMode] = useState<InputMode>('single');
  const [type, setType] = useState<TransactionType>('expense');
  
  // Single Input States
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Bulk Input States
  const [bulkText, setBulkText] = useState('');
  const [previewItems, setPreviewItems] = useState<BulkItem[]>([]);
  const [isReviewingBulk, setIsReviewingBulk] = useState(false);

  // Tool States
  const [isVisible, setIsVisible] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasTags, setHasTags] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (initialData) {
        setMode('single');
        setType(initialData.type === 'income' ? 'income' : 'expense');
        setValue(Math.abs(initialData.amount).toFixed(2).replace('.', ','));
        setDescription(initialData.title);
        setIsRecurring(!!initialData.isRecurring);
        setIsInstallment(!!initialData.installment);
      } else {
        resetForm();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, onClose, initialData]);

  const resetForm = () => {
    setMode('single');
    setType('expense');
    setValue('');
    setDescription('');
    setBulkText('');
    setPreviewItems([]);
    setIsReviewingBulk(false);
    setIsListening(false);
    setIsInstallment(false);
    setIsRecurring(false);
    setHasTags(false);
    setHasAttachment(false);
  };

  // --- SPEECH RECOGNITION ---
  const toggleListening = () => {
    // Check support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => setIsListening(false);
    
    recognition.onerror = (event: any) => {
      console.error("Speech Error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processVoiceInput(transcript);
    };

    recognition.start();
  };

  const processVoiceInput = (text: string) => {
    // 1. Extract Value (looks for digits with or without comma/dot)
    // Regex: tries to find currency patterns like 35, 35.00, 35,00
    const matchNumber = text.match(/(?:R\$)?\s*(\d+(?:[.,]\d{1,2})?)/);
    
    if (matchNumber) {
      let amountStr = matchNumber[1];
      // Normalize: if it has ',' it's decimal. If it has '.' it might be thousands or decimal.
      // Simple assumption for pt-BR voice: 35,50 comes as "35,50" or "35.50"
      amountStr = amountStr.replace('.', ','); 
      
      setValue(amountStr);
      
      // 2. Extract Description (everything else)
      // Remove the number and common words
      let cleanDesc = text.replace(matchNumber[0], '')
                          .replace(/reais|real|custou|gastei|foi/gi, '')
                          .trim();
      
      // Capitalize first letter
      cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
      
      if (cleanDesc) {
        setDescription(cleanDesc);
      }
    } else {
      // No number found, put everything in description
      setDescription(text.charAt(0).toUpperCase() + text.slice(1));
    }
  };

  // --- SAVE SINGLE ---
  const handleSaveSingle = () => {
    if (!description || !value) {
      alert("Por favor, preencha o valor e a descrição.");
      return;
    }

    const rawValue = value.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(rawValue);
    if (isNaN(numericValue)) return;

    const finalAmount = type === 'expense' ? -Math.abs(numericValue) : Math.abs(numericValue);
    
    // AI Rules + Inference
    let category = 'Geral';
    const lowerDesc = description.toLowerCase();
    
    const rule = aiRules.find(r => lowerDesc.includes(r.keyword.toLowerCase()));
    if (rule) {
      category = rule.category;
    } else {
      category = inferCategory(description, customCategories);
    }

    const icon = inferIcon(description, type);
    const colorClass = type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600';

    const transactionData: Omit<Transaction, 'id'> = {
      title: description,
      amount: finalAmount,
      type: type === 'transfer' ? 'expense' : type,
      category,
      account: 'Nubank',
      icon,
      colorClass,
      isRecurring,
      installment: isInstallment ? '1/12' : undefined,
    };

    if (initialData) editTransaction(initialData.id, transactionData);
    else addTransaction(transactionData);
    onClose();
  };

  // --- BULK LOGIC ---
  const handleProcessBulk = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    const items: BulkItem[] = [];

    lines.forEach(line => {
      const moneyMatch = line.match(/(?:R\$\s?)?(\d+[.,]?\d*)/);
      if (moneyMatch) {
        let amountStr = moneyMatch[1].replace('R$', '').trim();
        if (amountStr.includes(',') && amountStr.includes('.')) amountStr = amountStr.replace('.', '').replace(',', '.');
        else if (amountStr.includes(',')) amountStr = amountStr.replace(',', '.');
        
        const amount = parseFloat(amountStr);
        const title = line.replace(moneyMatch[0], '').replace('R$', '').trim() || 'Item sem nome';
        
        let category = 'Geral';
        const rule = aiRules.find(r => title.toLowerCase().includes(r.keyword.toLowerCase()));
        if(rule) category = rule.category;
        else category = inferCategory(title, customCategories);

        items.push({ id: crypto.randomUUID(), title: title.replace(/^[-–]\s*/, ''), amount, category });
      }
    });

    setPreviewItems(items);
    setIsReviewingBulk(true);
  };

  const handleConfirmBulk = () => {
    previewItems.forEach(item => {
      const finalAmount = type === 'expense' ? -Math.abs(item.amount) : Math.abs(item.amount);
      const icon = inferIcon(item.title, type);
      const colorClass = type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600';

      addTransaction({
        title: item.title,
        amount: finalAmount,
        type: type === 'transfer' ? 'expense' : type,
        category: item.category,
        account: 'Nubank',
        icon,
        colorClass,
      });
    });
    onClose();
  };

  const removeBulkItem = (id: string) => {
    setPreviewItems(prev => prev.filter(i => i.id !== id));
    if (previewItems.length <= 1) setIsReviewingBulk(false);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = (Number(val) / 100).toFixed(2).replace('.', ',');
    val = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setValue(val);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div 
        className={`relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl shadow-black/20 overflow-hidden transition-all duration-300 ease-out transform flex flex-col max-h-[90vh] ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <div className="p-6 md:p-8 flex flex-col items-center h-full overflow-y-auto no-scrollbar">
          
          {/* Top Bar: Mode Switcher */}
          <div className="w-full flex justify-center mb-6">
             <div className="bg-zinc-100 p-1 rounded-full flex">
                <button 
                  onClick={() => { setMode('single'); setIsReviewingBulk(false); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'single' ? 'bg-white shadow text-slate-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Unitário
                </button>
                <button 
                  onClick={() => setMode('bulk')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${mode === 'bulk' ? 'bg-white shadow text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Em Lote
                </button>
             </div>
             <button onClick={onClose} className="absolute right-6 top-6 text-zinc-400 hover:text-slate-900">
               <span className="material-symbols-outlined">close</span>
             </button>
          </div>

          {/* Transaction Type Segment */}
          <div className="w-full flex justify-between items-center mb-6">
            <div className="bg-zinc-100 p-1 rounded-lg flex relative w-full">
              <SegmentButton active={type === 'expense'} onClick={() => setType('expense')} label="Despesa" />
              <SegmentButton active={type === 'income'} onClick={() => setType('income')} label="Receita" />
              <SegmentButton active={type === 'transfer'} onClick={() => setType('transfer')} label="Transf." />
            </div>
          </div>

          {/* === MODE: SINGLE === */}
          {mode === 'single' && (
            <>
              <div className="flex flex-col items-center w-full mb-6 relative">
                 <div className="flex items-baseline justify-center w-full">
                  <span className="text-3xl font-bold text-zinc-300 mr-2 -translate-y-2">R$</span>
                  <input 
                    autoFocus
                    type="text"
                    value={value}
                    onChange={handleValueChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSingle()}
                    placeholder="0,00"
                    className="w-full text-center text-6xl font-bold text-slate-900 bg-transparent border-none outline-none placeholder:text-zinc-200 caret-primary tracking-tight"
                  />
                </div>
              </div>

              <div className="w-full flex items-center gap-3 mb-6 relative group">
                <input 
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSingle()}
                  placeholder={isListening ? "Ouvindo..." : "O que foi?"}
                  className="flex-1 text-xl font-medium text-center text-slate-700 bg-transparent border-none outline-none placeholder:text-zinc-300"
                />
                <button 
                  onClick={toggleListening}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40' : 'text-blue-500 bg-blue-50 hover:bg-blue-100'}`} 
                  title="Falar descrição"
                >
                  <span className="material-symbols-outlined text-[20px]">{isListening ? 'mic_off' : 'mic'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 mb-8 w-full border-t border-b border-zinc-50 py-3">
                <ToolIcon icon="photo_camera" tooltip="Anexar" active={hasAttachment} onClick={() => setHasAttachment(!hasAttachment)} />
                <ToolIcon icon="event_repeat" tooltip="Recorrência" active={isRecurring} onClick={() => setIsRecurring(!isRecurring)} />
                <ToolIcon icon="pie_chart" tooltip="Parcelamento" active={isInstallment} onClick={() => setIsInstallment(!isInstallment)} />
                <ToolIcon icon="sell" tooltip="Tags" active={hasTags} onClick={() => setHasTags(!hasTags)} />
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <SmartChip icon="calendar_today" label="Hoje" />
                {isRecurring && <SmartChip icon="loop" label="Mensal" active colorClass="bg-indigo-50 text-indigo-600 border-indigo-100" />}
                {type === 'expense' && <SmartChip icon="credit_card" label="Nubank" active />}
              </div>

              <div className="w-full space-y-3 mt-auto">
                <button 
                  onClick={handleSaveSingle}
                  className="w-full py-4 bg-primary hover:bg-primary-dark active:scale-[0.99] transition-all rounded-2xl text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <span className="text-lg font-bold">{initialData ? 'Salvar Alterações' : 'Confirmar'}</span>
                </button>
                <div className="flex justify-center items-center gap-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <span>'Enter' para salvar</span>
                </div>
              </div>
            </>
          )}

          {/* === MODE: BULK === */}
          {mode === 'bulk' && !isReviewingBulk && (
            <div className="w-full flex flex-col h-full animate-fade-in">
              <div className="flex-1 mb-4">
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Cole seus lançamentos</label>
                <textarea
                  autoFocus
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Exemplo:\nUber 15,90\nAlmoço Restaurante 45.00\nNetflix 55,90`}
                  className="w-full h-48 bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm font-mono text-slate-700 focus:outline-none focus:border-indigo-500 resize-none placeholder:text-zinc-300"
                />
                <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">info</span>
                  A IA vai identificar o valor e o nome automaticamente.
                </p>
              </div>
              <button 
                onClick={handleProcessBulk}
                disabled={!bulkText.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-2xl text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <span className="material-symbols-outlined">auto_awesome</span>
                <span className="text-lg font-bold">Processar com IA</span>
              </button>
            </div>
          )}

          {/* === MODE: BULK REVIEW === */}
          {mode === 'bulk' && isReviewingBulk && (
            <div className="w-full flex flex-col h-full animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900">Encontramos {previewItems.length} itens</h4>
                <button onClick={() => setIsReviewingBulk(false)} className="text-xs font-bold text-indigo-600 hover:underline">Editar Texto</button>
              </div>
              
              <div className="flex-1 overflow-y-auto border border-zinc-100 rounded-xl mb-4 bg-zinc-50 divide-y divide-zinc-100 max-h-[300px]">
                {previewItems.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between bg-white hover:bg-zinc-50 transition-colors group">
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-slate-800 text-sm truncate">{item.title}</span>
                      <span className="text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded w-fit">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">R$ {item.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      <button onClick={() => removeBulkItem(item.id)} className="text-zinc-300 hover:text-rose-500 p-1">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                 <button 
                  onClick={() => setIsReviewingBulk(false)}
                  className="flex-1 py-3 bg-white border border-zinc-200 text-slate-700 font-bold rounded-xl hover:bg-zinc-50"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleConfirmBulk}
                  className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">check</span>
                  Confirmar Tudo
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- Helpers ---

const inferCategory = (desc: string, customCats: string[]): string => {
  const d = desc.toLowerCase();
  
  // Custom categories check
  const match = customCats.find(c => d.includes(c.toLowerCase()));
  if (match) return match;

  // Defaults
  if (d.includes('uber') || d.includes('99') || d.includes('posto')) return 'Transporte';
  if (d.includes('ifood') || d.includes('restaurante') || d.includes('burger') || d.includes('mcdonald')) return 'Alimentação';
  if (d.includes('mercado') || d.includes('carrefour') || d.includes('pão')) return 'Mercado';
  if (d.includes('cinema') || d.includes('netflix') || d.includes('spotify')) return 'Lazer';
  if (d.includes('freela') || d.includes('salário') || d.includes('pix recebido')) return 'Receita';
  if (d.includes('farmácia') || d.includes('drogaria')) return 'Saúde';
  return 'Geral';
}

const inferIcon = (desc: string, type: TransactionType): string => {
  if (type === 'income') return 'payments';
  const d = desc.toLowerCase();
  if (d.includes('uber')) return 'local_taxi';
  if (d.includes('ifood')) return 'fastfood';
  if (d.includes('netflix')) return 'movie';
  if (d.includes('mercado')) return 'shopping_cart';
  if (d.includes('farmácia')) return 'medication';
  return 'receipt'; 
}

const SegmentButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`
      flex-1 px-4 py-2 text-xs font-bold rounded-md transition-all duration-200 relative
      ${active ? 'text-slate-900 shadow-sm bg-white' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}
    `}
  >
    {label}
  </button>
);

const ToolIcon: React.FC<{ icon: string; tooltip: string; active?: boolean; onClick: () => void }> = ({ icon, tooltip, active, onClick }) => (
  <div className="relative group flex flex-col items-center">
    <button 
      onClick={onClick}
      className={`
        p-2 rounded-xl transition-all duration-200
        ${active ? 'text-primary bg-primary/10 scale-110' : 'text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50'}
      `}
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </button>
    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {tooltip}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
    </div>
  </div>
);

const SmartChip: React.FC<{ icon: string; label: string; active?: boolean; colorClass?: string }> = ({ icon, label, active, colorClass }) => {
  const baseClasses = "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold cursor-pointer active:scale-95";
  const activeClasses = colorClass || "bg-zinc-100 border-zinc-200 text-slate-700";
  const inactiveClasses = "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600";

  return (
    <div className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
      <span className={`material-symbols-outlined text-[16px] ${active ? 'filled' : ''}`}>{icon}</span>
      <span>{label}</span>
      <span className="material-symbols-outlined text-[14px] opacity-50">expand_more</span>
    </div>
  );
};

export default QuickAddModal;