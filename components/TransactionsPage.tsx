
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction } from '../types';
import { useTransactions } from './TransactionsContext';
import { useNotification } from './NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionsPageProps {
  onBack: () => void;
  onMenuClick: () => void;
  onEdit: (transaction: Transaction) => void;
}

// --- SPREADSHEET CELL COMPONENT ---
interface EditableCellProps {
  value: string | number;
  type?: 'text' | 'number';
  onSave: (val: string | number) => void;
  align?: 'left' | 'right';
}

const EditableCell: React.FC<EditableCellProps> = ({ value, type = 'text', onSave, align = 'left' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue !== value) {
      if (type === 'number') {
        const num = parseFloat(tempValue.toString().replace(',', '.'));
        if (!isNaN(num)) {
          onSave(num);
        } else {
          setTempValue(value);
        }
      } else {
        if (tempValue.toString().trim() !== '') {
          onSave(tempValue);
        } else {
          setTempValue(value);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        type={type === 'number' ? 'number' : 'text'}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full bg-white dark:bg-zinc-800 border-2 border-primary/50 px-2 py-1 rounded text-sm outline-none text-slate-900 dark:text-white shadow-lg z-50 relative ${align === 'right' ? 'text-right' : 'text-left'}`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`w-full h-full px-2 py-1.5 cursor-text border border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800 rounded transition-all truncate ${align === 'right' ? 'text-right' : 'text-left'}`}
      title="Clique para editar"
    >
      {type === 'number'
        ? parseFloat(value.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        : value}
    </div>
  );
};

// --- TRANSACTION DETAIL MODAL (RECEIPT STYLE) ---
const TransactionDetailModal: React.FC<{ transaction: Transaction; onClose: () => void; onEdit: () => void; onDelete: () => void }> = ({ transaction, onClose, onEdit, onDelete }) => {

  const handleShare = async () => {
    // Simulated Share
    const text = `Comprovante FluxCash\n${transaction.title}\nR$ ${Math.abs(transaction.amount).toFixed(2)}\nData: ${new Date(transaction.dateIso || new Date()).toLocaleDateString()}`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiado para a área de transferência!');
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        className="relative bg-zinc-100 dark:bg-zinc-900 w-full max-w-sm rounded-t-2xl rounded-b-xl shadow-2xl overflow-hidden"
      >
        {/* Receipt Header Effect */}
        <div className="bg-white dark:bg-zinc-800 p-6 flex flex-col items-center relative border-b-2 border-dashed border-zinc-300 dark:border-zinc-700">
          <div className={`size-16 rounded-full flex items-center justify-center mb-4 ${transaction.colorClass}`}>
            <span className="material-symbols-outlined text-3xl">{transaction.icon}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">{transaction.title}</h3>
          <p className="text-sm text-zinc-500 mb-4">{new Date(transaction.dateIso || new Date()).toLocaleString('pt-BR')}</p>

          <div className={`text-4xl font-black tracking-tight ${transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
            R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>

          {/* Receipt ZigZag Bottom (CSS Trick) */}
          <div className="absolute bottom-[-10px] left-0 right-0 h-[10px] bg-transparent"
            style={{
              background: 'linear-gradient(45deg, transparent 33.333%, #fff 33.333%, #fff 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #fff 33.333%, #fff 66.667%, transparent 66.667%)',
              backgroundSize: '20px 40px',
              opacity: 0 // Hidden for now as it needs complex coloring for dark mode, keeping simple dashed border
            }}
          ></div>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-4 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-500 text-sm">Categoria</span>
            <span className="font-bold text-slate-900 dark:text-zinc-200 text-sm">{transaction.category}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-500 text-sm">Conta / Cartão</span>
            <span className="font-bold text-slate-900 dark:text-zinc-200 text-sm">{transaction.account}</span>
          </div>
          {transaction.installment && (
            <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 text-sm">Parcela</span>
              <span className="font-bold text-blue-600 text-sm">{transaction.installment}</span>
            </div>
          )}
          {transaction.tags && (
            <div className="flex gap-2 mt-2">
              {transaction.tags.map(t => (
                <span key={t} className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400">#{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
          <button onClick={onDelete} className="flex-1 py-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-500 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            Apagar
          </button>
          <button onClick={() => { onClose(); onEdit(); }} className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            Editar
          </button>
          <button onClick={handleShare} className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">share</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- SPREADSHEET VIEW COMPONENT (VIRTUALIZED) ---
import { FixedSizeList as List } from 'react-window';

const SpreadsheetView: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const { transactions, editTransaction, removeTransaction, customCategories, addCustomCategory } = useTransactions();
  const { pushNotification } = useNotification();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkCategory, setShowBulkCategory] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const visibleTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(t =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const autoSumValue = transactions
    .filter(t => selectedIds.includes(t.id))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(visibleTransactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkCategory = (category: string) => {
    if (category === '+ Nova') {
      const newCat = prompt('Nome da nova categoria:');
      if (newCat) {
        addCustomCategory(newCat);
        handleBulkCategory(newCat);
      }
      return;
    }

    selectedIds.forEach(id => {
      editTransaction(id, { category });
    });

    pushNotification({
      title: 'Categorias Atualizadas',
      message: `${selectedIds.length} itens movidos para "${category}".`,
      type: 'success',
      category: 'system'
    });

    setShowBulkCategory(false);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} itens?`)) {
      selectedIds.forEach(id => removeTransaction(id));
      pushNotification({
        title: 'Itens Excluídos',
        message: `${selectedIds.length} transações foram removidas.`,
        type: 'warning',
        category: 'system'
      });
      setSelectedIds([]);
    }
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const tx = visibleTransactions[index];
    const isSelected = selectedIds.includes(tx.id);

    return (
      <div style={style} className={`flex items-center border-b border-zinc-100 dark:border-zinc-800 transition-colors ${isSelected ? 'bg-violet-50/50 dark:bg-violet-900/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
        <div className="w-10 px-4 shrink-0 flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelection(tx.id)}
            className="rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary bg-white dark:bg-zinc-800 cursor-pointer"
          />
        </div>
        <div className="w-32 px-2 text-sm text-zinc-500 dark:text-zinc-400 shrink-0 border-r border-zinc-50 dark:border-zinc-800 truncate">
          {new Date(tx.dateIso || new Date()).toLocaleDateString('pt-BR')}
        </div>
        <div className="flex-1 px-2 text-sm font-medium text-slate-700 dark:text-zinc-200 border-r border-zinc-50 dark:border-zinc-800 min-w-[200px]">
          <EditableCell
            value={tx.title}
            onSave={(val) => editTransaction(tx.id, { title: val.toString() })}
          />
        </div>
        <div className="w-40 px-2 text-sm text-zinc-600 dark:text-zinc-400 shrink-0 border-r border-zinc-50 dark:border-zinc-800">
          <EditableCell
            value={tx.category}
            onSave={(val) => editTransaction(tx.id, { category: val.toString() })}
          />
        </div>
        <div className="w-40 px-2 text-right text-sm font-bold shrink-0 border-r border-zinc-50 dark:border-zinc-800">
          <div className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-zinc-100'}>
            <EditableCell
              type="number"
              align="right"
              value={tx.amount}
              onSave={(val) => editTransaction(tx.id, { amount: Number(val), type: Number(val) > 0 ? 'income' : 'expense' })}
            />
          </div>
        </div>
        <div className="w-20 px-2 flex justify-center shrink-0">
          <button
            onClick={() => removeTransaction(tx.id)}
            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-zinc-300 hover:text-rose-500 rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-full flex flex-col bg-white dark:bg-[#18181b]">
      {/* Header (Flexbox mimicking table header) */}
      <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
        <div className="w-10 px-4 py-3 shrink-0 flex items-center justify-center">
          <input
            type="checkbox"
            onChange={handleSelectAll}
            checked={selectedIds.length === visibleTransactions.length && visibleTransactions.length > 0}
            className="rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary bg-white dark:bg-zinc-800 cursor-pointer"
          />
        </div>
        <div className="w-32 px-2 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase shrink-0">Data</div>
        <div className="flex-1 px-2 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase min-w-[200px]">Descrição</div>
        <div className="w-40 px-2 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase shrink-0">Categoria</div>
        <div className="w-40 px-2 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase text-right shrink-0">Valor</div>
        <div className="w-20 px-2 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase text-center shrink-0">Ações</div>
      </div>

      {/* Virtualized Body */}
      <div className="flex-1" ref={containerRef}>
        {dimensions.height > 0 && (
          <List
            height={dimensions.height}
            width={dimensions.width}
            itemCount={visibleTransactions.length}
            itemSize={50} // Fixed row height
            className="no-scrollbar"
          >
            {Row}
          </List>
        )}
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-auto bg-slate-900 dark:bg-zinc-800 text-white p-2 pl-6 rounded-2xl shadow-2xl flex items-center justify-between gap-6 z-30 border border-white/10"
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{selectedIds.length} SELECIONADOS</span>
              <span className="font-mono font-bold text-lg text-emerald-400">R$ {autoSumValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowBulkCategory(!showBulkCategory)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">category</span>
                  <span className="hidden sm:inline">Categorizar</span>
                </button>

                <AnimatePresence>
                  {showBulkCategory && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-60 overflow-y-auto"
                    >
                      {customCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleBulkCategory(cat)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-50 dark:border-zinc-800 last:border-0"
                        >
                          {cat}
                        </button>
                      ))}
                      <button
                        onClick={() => handleBulkCategory('+ Nova')}
                        className="w-full text-left px-4 py-2 text-sm text-primary font-bold hover:bg-primary/5"
                      >
                        + Nova Categoria
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleBulkDelete}
                className="p-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-colors"
                title="Excluir Selecionados"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
              <div className="h-8 w-px bg-white/20 mx-2"></div>
              <button
                onClick={() => setSelectedIds([])}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN PAGE ---
const TransactionsPage: React.FC<TransactionsPageProps> = ({ onBack, onMenuClick, onEdit }) => {
  const { transactions, removeTransaction, income, expenses, balance, currentDate, nextMonth, prevMonth } = useTransactions();
  const { pushNotification } = useNotification();

  const [viewMode, setViewMode] = useState<'list' | 'spreadsheet'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'future'>('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(50);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredItemsRaw = useMemo(() => {
    return transactions.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.amount.toString().includes(debouncedSearchTerm);

      const matchesType = filterType === 'all'
        ? true
        : filterType === 'future'
          ? false
          : item.type === filterType;

      const tDate = item.dateIso ? new Date(item.dateIso) : new Date();
      const matchesDate = tDate.getMonth() === currentDate.getMonth() &&
        tDate.getFullYear() === currentDate.getFullYear();

      return matchesSearch && matchesType && matchesDate;
    });
  }, [transactions, debouncedSearchTerm, filterType, currentDate]);

  const filteredGroups = useMemo(() => {
    // Pagination Slice
    const paginatedItems = filteredItemsRaw.slice(0, visibleCount);

    const groups: { date: string; items: Transaction[] }[] = [];
    paginatedItems.forEach(transaction => {
      let dateLabel = "Data Desconhecida";
      if (transaction.dateIso) {
        const date = new Date(transaction.dateIso);
        const today = new Date();
        const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
        const isYesterday = date.getDate() === today.getDate() - 1;

        if (isToday) dateLabel = "Hoje";
        else if (isYesterday) dateLabel = "Ontem";
        else dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      }

      const existingGroup = groups.find(g => g.date === dateLabel);
      if (existingGroup) existingGroup.items.push(transaction);
      else groups.push({ date: dateLabel, items: [transaction] });
    });
    return groups;
  }, [filteredItemsRaw, visibleCount]);

  const hasMore = filteredItemsRaw.length > visibleCount;

  const loadMore = () => {
    setVisibleCount(prev => prev + 50);
  };

  const handleScroll = () => {
    if (scrollRef.current) setIsScrolled(scrollRef.current.scrollTop > 50);
  };

  const handleDelete = (id: string, title: string) => {
    removeTransaction(id);
    setSelectedTransaction(null);
    pushNotification({
      title: 'Transação Removida',
      message: `"${title}" foi movido para a lixeira.`,
      type: 'success',
      category: 'system'
    });
  };

  const handleShare = () => {
    const text = `📊 *Resumo FluxCash* - ${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
    
✅ Entradas: R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
🔻 Saídas: R$ ${expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
💰 Saldo: R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

_Gerado via FluxCash App_`;

    navigator.clipboard.writeText(text);
    pushNotification({
      title: 'Copiado!',
      message: 'Resumo financeiro copiado para a área de transferência.',
      type: 'success',
      category: 'system'
    });
  };

  const monthLabel = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#18181b] md:rounded-3xl shadow-soft md:border border-zinc-100 dark:border-zinc-800 overflow-hidden relative transition-colors">

      {/* HEADER */}
      <div className="bg-white dark:bg-[#18181b] border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex flex-col gap-4 z-30 shrink-0 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <button onClick={onBack} className="hidden lg:flex p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Extrato</h2>
          </div>

          <div className="hidden md:flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
            >
              <span className="material-symbols-outlined text-[16px]">list</span> Lista
            </button>
            <button
              onClick={() => setViewMode('spreadsheet')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'spreadsheet' ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-700 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
            >
              <span className="material-symbols-outlined text-[16px]">table_view</span> Planilha
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
            <div className="relative group hidden sm:block w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">search</span>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-950 border border-transparent focus:border-primary/30 rounded-full pl-10 pr-4 py-2.5 outline-none transition-all text-sm font-medium text-slate-700 dark:text-zinc-200 placeholder:text-zinc-400"
              />
            </div>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title="Copiar Resumo"
            >
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'spreadsheet' ? (
        <SpreadsheetView searchTerm={searchTerm} />
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative bg-white dark:bg-[#18181b]"
        >
          <div className={`px-6 py-6 transition-all duration-500 ease-out origin-top ${isScrolled ? 'opacity-50 scale-95 pointer-events-none -mb-20' : 'opacity-100 scale-100'}`}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="flex flex-col items-center w-40">
                <span className="text-lg font-bold text-slate-900 dark:text-zinc-100">{capitalizedMonthLabel}</span>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Selecionado</span>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
              <SummaryCard label="Entradas (Mês)" value={income} type="income" icon="arrow_upward" />
              <SummaryCard label="Saídas (Mês)" value={expenses} type="expense" icon="arrow_downward" />
              <SummaryCard label="Saldo Total" value={balance} type="balance" icon="account_balance_wallet" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#18181b] min-h-screen relative">
            <div className="sticky top-0 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md z-20 px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
                <FilterChip label="Todos" active={filterType === 'all'} onClick={() => setFilterType('all')} />
                <FilterChip label="Receitas" active={filterType === 'income'} onClick={() => setFilterType('income')} icon="trending_up" />
                <FilterChip label="Despesas" active={filterType === 'expense'} onClick={() => setFilterType('expense')} icon="trending_down" />
              </div>
            </div>

            <div className="px-0 pb-20">
              {filteredGroups.length > 0 ? (
                <>
                  {filteredGroups.map((group, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className="sticky top-[61px] z-10 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur border-y border-zinc-100 dark:border-zinc-800 px-6 py-2 flex justify-between items-center text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider shadow-[0_2px_5px_rgba(0,0,0,0.02)]">
                        <span>{group.date}</span>
                      </div>
                      <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {group.items.map(item => (
                          <FullTransactionRow
                            key={item.id}
                            transaction={item}
                            onClick={() => setSelectedTransaction(item)}
                            onDelete={() => handleDelete(item.id, item.title)}
                            onEdit={() => onEdit(item)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {hasMore && (
                    <div className="p-6 flex justify-center">
                      <button
                        onClick={loadMore}
                        className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined">add_circle</span>
                        Carregar Mais Transações
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState searchTerm={searchTerm} />
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            onEdit={() => onEdit(selectedTransaction)}
            onDelete={() => handleDelete(selectedTransaction.id, selectedTransaction.title)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: number; type: 'income' | 'expense' | 'balance'; icon: string }> = React.memo(({ label, value, type, icon }) => {
  const styles = {
    income: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30',
    expense: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30',
    balance: value >= 0 ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30',
  };
  const currentStyle = styles[type];

  return (
    <div className={`rounded-2xl p-4 border flex flex-col gap-3 relative overflow-hidden group hover:shadow-md transition-shadow cursor-default bg-white dark:bg-zinc-900 ${type === 'balance' ? 'border-zinc-200 dark:border-zinc-800' : 'border-zinc-200 dark:border-zinc-800'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-lg ${currentStyle} bg-opacity-20`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>
      <span className={`text-xl font-black tracking-tight ${type === 'balance' ? (value >= 0 ? 'text-slate-900 dark:text-zinc-100' : 'text-rose-600 dark:text-rose-400') : (type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}`}>
        {type === 'expense' ? '-' : (value > 0 ? '+' : '')} R$ {Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
});

const FilterChip: React.FC<{ label: string; active?: boolean; icon?: string; onClick: () => void }> = React.memo(({ label, active, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 border ${active ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 border-slate-900 dark:border-zinc-100 shadow-lg' : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200'}`}
  >
    {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
    {label}
  </button>
));

const FullTransactionRow: React.FC<{ transaction: Transaction; onClick: () => void; onDelete: () => void; onEdit: () => void }> = React.memo(({ transaction, onClick, onDelete, onEdit }) => {
  return (
    <div onClick={onClick} className="group flex items-center justify-between py-4 px-6 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-primary">
      <div className="flex items-center gap-4 flex-1">
        <div className="shrink-0 relative">
          {transaction.logoUrl ? (
            <img src={transaction.logoUrl} alt={transaction.title} className="size-12 rounded-full object-cover shadow-sm border border-zinc-100 dark:border-zinc-700" />
          ) : (
            <div className={`size-12 rounded-full flex items-center justify-center ${transaction.colorClass}`}>
              <span className="material-symbols-outlined text-[24px]">{transaction.icon}</span>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-base">{transaction.title}</h4>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>{transaction.category}</span>
            <span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
            <span>{transaction.account}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <span className={`font-bold text-base ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-zinc-100'}`}>
            {transaction.type === 'income' ? '+' : '-'} R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="hidden group-hover:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
      </div>
    </div>
  );
});

const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="size-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
      <span className="material-symbols-outlined text-4xl text-zinc-300 dark:text-zinc-700">search_off</span>
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">Nenhuma transação encontrada</h3>
    <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">Não encontramos resultados para "{searchTerm}" neste mês.</p>
  </div>
);

export default TransactionsPage;
