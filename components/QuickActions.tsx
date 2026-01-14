
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from './TransactionsContext';

interface QuickActionsProps {
  onOpenModal?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onOpenModal }) => {
  const [showScanModal, setShowScanModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  return (
    <>
      <div className="lg:col-span-1 bg-white dark:bg-[#18181b] rounded-[2rem] p-6 shadow-soft dark:shadow-none border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-6 transition-colors h-full">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Ações Rápidas</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Registre movimentações em segundos.</p>
        </div>
        
        <button 
          onClick={onOpenModal}
          className="w-full h-16 bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all rounded-2xl text-white flex items-center justify-center gap-3 shadow-lg shadow-primary/20 group"
        >
          <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform duration-300">
            <span className="material-symbols-outlined">add</span>
          </div>
          <span className="text-lg font-bold">Novo Lançamento</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {/* Changed from Pix to Receipt Scanner */}
          <ActionButton icon="receipt_long" label="Scan Nota" onClick={() => setShowScanModal(true)} />
          <ActionButton icon="swap_horiz" label="Transferir" onClick={() => setShowTransferModal(true)} />
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showScanModal && <ReceiptScanModal onClose={() => setShowScanModal(false)} />}
        {showTransferModal && <TransferModal onClose={() => setShowTransferModal(false)} />}
      </AnimatePresence>
    </>
  );
};

const ActionButton: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-white dark:hover:bg-zinc-800 transition-all group active:scale-95"
  >
    <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary transition-colors">{icon}</span>
    <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{label}</span>
  </button>
);

// --- RECEIPT SCAN MODAL (OCR Simulation) ---
const ReceiptScanModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addTransaction } = useTransactions();
  const [scanning, setScanning] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simula scan e processamento OCR
  useEffect(() => {
    const timer = setTimeout(() => {
      setScanning(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    addTransaction({
       title: 'Compra Mercado (OCR)',
       amount: -245.80,
       category: 'Alimentação',
       account: 'Cartão Master',
       type: 'expense',
       icon: 'receipt_long',
       colorClass: 'bg-orange-100 text-orange-600',
    });
    // Feedback mais adequado para gestão
    alert('Nota fiscal processada! Gasto de R$ 245,80 registrado.');
    onClose();
  };

  // UX Fix: Trigger file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setScanning(true);
        // Simulate processing new image
        setTimeout(() => {
            setScanning(false);
        }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800"
      >
         {/* Fake Camera View */}
         <div className="h-[400px] bg-zinc-900 relative flex items-center justify-center overflow-hidden">
            {/* Camera Feed Simulator - Changed image to a receipt */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
            
            {/* Scan Area */}
            <div className="relative w-64 h-80 border-2 border-white/30 rounded-2xl overflow-hidden">
               <div className="absolute top-0 left-0 border-t-4 border-l-4 border-emerald-500 w-8 h-8 rounded-tl-xl"></div>
               <div className="absolute top-0 right-0 border-t-4 border-r-4 border-emerald-500 w-8 h-8 rounded-tr-xl"></div>
               <div className="absolute bottom-0 left-0 border-b-4 border-l-4 border-emerald-500 w-8 h-8 rounded-bl-xl"></div>
               <div className="absolute bottom-0 right-0 border-b-4 border-r-4 border-emerald-500 w-8 h-8 rounded-br-xl"></div>
               
               {/* Scanning Line */}
               {scanning && (
                 <motion.div 
                   className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)]"
                   animate={{ top: ['0%', '100%', '0%'] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 />
               )}
               
               {!scanning && (
                 <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4 text-center backdrop-blur-sm animate-fade-in">
                    <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2">text_snippet</span>
                    <p className="font-bold">Dados Extraídos</p>
                    <div className="text-xs text-zinc-300 my-4 bg-zinc-800/50 p-3 rounded-lg text-left w-full space-y-1">
                        <div className="flex justify-between"><span>Estab:</span> <span className="font-bold">Mercado Extra</span></div>
                        <div className="flex justify-between"><span>Data:</span> <span>Hoje, 14:30</span></div>
                        <div className="flex justify-between text-emerald-400"><span>Total:</span> <span className="font-bold">R$ 245,80</span></div>
                    </div>
                    <button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-full font-bold text-sm w-full shadow-lg shadow-emerald-600/20">
                        Importar Gasto
                    </button>
                 </div>
               )}
            </div>

            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><span className="material-symbols-outlined">close</span></button>
         </div>

         <div className="bg-zinc-900 p-6 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center text-center">
                <p className="text-white font-bold text-sm">Scanner de Recibos IA</p>
                <p className="text-zinc-500 text-xs mt-1">Aponte para a Nota Fiscal (NFC-e) para preencher os dados automaticamente.</p>
            </div>
            {/* Functional Upload Button */}
            <button 
                onClick={handleUploadClick}
                className="text-zinc-400 text-xs font-bold border border-zinc-700 px-4 py-2 rounded-full hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
               <span className="material-symbols-outlined text-[14px]">upload_file</span>
               Carregar Foto da Galeria
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
         </div>
      </motion.div>
    </div>
  );
};

// --- TRANSFER MODAL ---
const TransferModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addTransaction } = useTransactions();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [contact, setContact] = useState('');

  const handleTransfer = () => {
    if (!amount || !contact) return;
    
    // Updated logic: Records the transfer as an expense/movement, doesn't execute payment
    addTransaction({
       title: `Transf. para ${contact}`,
       amount: -parseFloat(amount),
       category: 'Transferência',
       account: 'Nubank',
       type: 'expense',
       icon: 'swap_horiz',
       colorClass: 'bg-blue-100 text-blue-600',
    });
    
    alert('Movimentação registrada com sucesso!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800"
      >
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
           <h3 className="font-bold text-slate-900 dark:text-zinc-100">Registrar Transferência</h3>
           <button onClick={onClose} className="text-zinc-400 hover:text-slate-900 dark:hover:text-white"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="p-6">
           {step === 1 ? (
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-zinc-500 uppercase">Beneficiário</label>
                 <input 
                   autoFocus
                   type="text" 
                   value={contact}
                   onChange={(e) => setContact(e.target.value)}
                   placeholder="Nome da pessoa ou conta" 
                   className="w-full mt-1 border-b-2 border-zinc-200 dark:border-zinc-700 bg-transparent py-2 text-lg text-slate-900 dark:text-white outline-none focus:border-primary placeholder:text-zinc-300 dark:placeholder:text-zinc-600 transition-colors"
                 />
               </div>
               
               <div className="flex gap-2 mt-4">
                  {['Reserva', 'Investimento', 'Conjunta'].map(c => (
                     <button key={c} onClick={() => setContact(c)} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                        {c}
                     </button>
                  ))}
               </div>

               <button 
                  disabled={!contact}
                  onClick={() => setStep(2)}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold mt-4 disabled:opacity-50"
                >
                  Continuar
                </button>
             </div>
           ) : (
             <div className="space-y-6 text-center">
               <div>
                  <p className="text-sm text-zinc-500">Valor enviado para <strong className="text-slate-900 dark:text-zinc-200">{contact}</strong></p>
                  <div className="flex items-center justify-center text-4xl font-bold text-slate-900 dark:text-white mt-2">
                     <span className="text-zinc-300 dark:text-zinc-600 mr-1">R$</span>
                     <input 
                       autoFocus
                       type="number"
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                       className="w-32 bg-transparent outline-none text-center text-slate-900 dark:text-white"
                       placeholder="0.00"
                     />
                  </div>
               </div>
               
               <div className="flex gap-2 justify-center">
                   <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">Voltar</button>
                   <button onClick={handleTransfer} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30">
                     Salvar Registro
                   </button>
               </div>
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuickActions;
