
import React, { useState } from 'react';
import { DiagnosticService } from '../services/DiagnosticService';
import { useIntegration } from './IntegrationContext';
import { DiagnosticResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const SystemHealthWidget: React.FC = () => {
  const { integrations, checkVaultIntegrity } = useIntegration();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]); // Clear previous
    
    // Create placeholders based on enabled services + core tests
    const placeholders: DiagnosticResult[] = [
        { id: 'internet', label: 'Internet', status: 'running' },
        { id: 'storage', label: 'Local Storage', status: 'running' },
        { id: 'vault', label: 'Cofre AES', status: 'running' },
    ];
    if (integrations['supabase']?.enabled) placeholders.push({ id: 'supabase', label: 'Supabase DB', status: 'running' });
    if (integrations['openai']?.enabled) placeholders.push({ id: 'openai', label: 'OpenAI API', status: 'running' });
    if (integrations['ollama']?.enabled) placeholders.push({ id: 'ollama', label: 'Local AI', status: 'running' });
    
    setResults(placeholders);

    // Run tests immediately, but update state smoothly
    setTimeout(async () => {
        const actualResults = await DiagnosticService.runTests(integrations, checkVaultIntegrity);
        setResults(actualResults);
        setIsRunning(false);
    }, 600);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
        case 'running': return <span className="material-symbols-outlined text-zinc-400 animate-spin text-sm">progress_activity</span>;
        case 'success': return <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>;
        case 'warning': return <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>;
        case 'error': return <span className="material-symbols-outlined text-rose-500 text-sm">error</span>;
        default: return <span className="material-symbols-outlined text-zinc-300 text-sm">remove</span>;
    }
  };

  const hasIssues = results.some(r => r.status === 'error' || r.status === 'warning');

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden mt-6 shadow-sm">
        {/* Header Trigger */}
        <div 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between p-4 cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={`size-8 rounded-lg flex items-center justify-center ${hasIssues ? 'bg-rose-100 text-rose-600' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                    <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Status do Sistema</h4>
                    <p className="text-[10px] text-zinc-500">Integridade & Conexões</p>
                </div>
            </div>
            <button className="text-zinc-400">
                <span className={`material-symbols-outlined transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
        </div>

        {/* Content */}
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: 'auto' }} 
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                        {results.length === 0 && !isRunning && (
                            <div className="text-center py-6">
                                <p className="text-xs text-zinc-400 mb-4">Verifique a integridade da sua infraestrutura.</p>
                                <button 
                                    onClick={runDiagnostics}
                                    className="bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
                                >
                                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                    Rodar Diagnóstico
                                </button>
                            </div>
                        )}

                        {(results.length > 0) && (
                            <div className="space-y-3">
                                {results.map((res, idx) => (
                                    <div key={idx} className="flex flex-col gap-1 border-b border-zinc-50 dark:border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(res.status)}
                                                <span className={`text-xs font-medium ${res.status === 'error' ? 'text-rose-600' : 'text-slate-700 dark:text-zinc-300'}`}>
                                                    {res.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {res.latency !== undefined && (
                                                    <span className={`text-[10px] font-mono px-1 rounded ${res.latency > 1000 ? 'text-rose-500 bg-rose-50' : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800'}`}>
                                                        {res.latency}ms
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">{res.message}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Error Fix Tip */}
                                        {res.fixAction && (
                                            <div className="ml-6 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-md border border-amber-100 dark:border-amber-900/20">
                                                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono flex gap-2">
                                                    <span className="material-symbols-outlined text-[12px] mt-0.5">lightbulb</span>
                                                    {res.fixAction}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {!isRunning && (
                                    <button 
                                        onClick={runDiagnostics}
                                        className="w-full mt-4 text-xs font-bold text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                                        Rodar Novamente
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default SystemHealthWidget;
