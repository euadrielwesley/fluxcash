
import React, { useEffect, useState, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useTransactions } from './TransactionsContext';

interface AnalyticsPageProps {
  onBack: () => void;
  onMenuClick: () => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onBack, onMenuClick }) => {
  const { transactions } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState('6M');

  // --- REAL DATA AGGREGATION ---
  const chartData = useMemo(() => {
    const today = new Date();
    const data: Record<string, { month: string, receita: number, despesa: number, saldo: number, date: Date }> = {};

    // 1. Initialize last 6 months buckets
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      data[key] = {
        month: capitalizedMonth,
        receita: 0,
        despesa: 0,
        saldo: 0,
        date: d
      };
    }

    // 2. Aggregate Transactions
    transactions.forEach(t => {
      if (!t.dateIso) return;
      const tDate = new Date(t.dateIso);
      const key = `${tDate.getFullYear()}-${tDate.getMonth()}`;

      if (data[key]) {
        if (t.type === 'income') {
          data[key].receita += t.amount;
        } else {
          data[key].despesa += Math.abs(t.amount);
        }
        data[key].saldo = data[key].receita - data[key].despesa;
      }
    });

    // 3. Convert to Array and Filter by Period
    let result = Object.values(data).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (selectedPeriod === '3M') {
      result = result.slice(-3);
    }

    return result;
  }, [transactions, selectedPeriod]);

  // --- CATEGORY DATA AGGREGATION ---
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    const colors = ['#f43f5e', '#3b82f6', '#6366f1', '#a855f7', '#eab308', '#10b981'];

    transactions
      .filter(t => t.type === 'expense') // Only expenses for the pie chart
      .forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
      });

    return Object.entries(catMap)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  }, [transactions]);

  const handleExportPDF = async () => {
    const html2canvas = (window as any).html2canvas;
    const { jsPDF } = (window as any).jspdf || {};

    if (!html2canvas || !jsPDF) {
      alert('Bibliotecas de PDF ainda carregando... Tente em 2 segundos.');
      return;
    }

    const element = document.getElementById('analytics-report');
    if (!element) return;
    
    const btn = document.getElementById('btn-export-pdf');
    if(btn) btn.innerText = "Gerando...";

    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        backgroundColor: "#f8fafc",
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FluxCash_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF');
    } finally {
      if(btn) btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">download</span><span class="hidden sm:inline">Exportar PDF</span>';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light md:rounded-3xl shadow-soft md:border border-zinc-100 overflow-hidden relative">
      <div className="bg-white border-b border-zinc-100 px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={onBack} className="hidden lg:flex p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Análise Financeira</h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="bg-zinc-50 border border-zinc-200 text-sm font-semibold text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-primary"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="6M">Últimos 6 Meses</option>
            <option value="3M">Últimos 3 Meses</option>
          </select>
          <button 
            id="btn-export-pdf"
            onClick={handleExportPDF} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-slate-600 font-semibold text-sm hover:bg-zinc-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
        </div>
      </div>

      <div id="analytics-report" className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 bg-zinc-50/50">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Evolução Financeira</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f4f4f5' }} formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                <Bar dataKey="receita" name="Receita" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="despesa" name="Despesa" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#1e293b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col md:flex-row items-center">
             {categoryData.length > 0 ? (
               <>
                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full ml-0 md:ml-4 space-y-3 mt-4 md:mt-0">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">Top Categorias</h4>
                    {categoryData.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="size-3 rounded-full" style={{background: c.color}}></div> 
                          {c.name}
                        </div>
                        <span>R$ {c.value.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
               </>
             ) : (
                <div className="w-full h-[200px] flex items-center justify-center text-zinc-400 text-sm">
                  Sem dados de despesas para exibir.
                </div>
             )}
           </div>
           
           {/* KPI Table */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-slate-900 mb-4">KPIs do Período ({selectedPeriod})</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
                    <span className="text-xs text-zinc-500">Receita Total</span>
                    <span className="font-bold text-emerald-600">R$ {chartData.reduce((a,b) => a+b.receita, 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
                    <span className="text-xs text-zinc-500">Despesa Total</span>
                    <span className="font-bold text-rose-600">R$ {chartData.reduce((a,b) => a+b.despesa, 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Saldo Líquido</span>
                    <span className={`font-bold ${chartData.reduce((a,b) => a+b.saldo, 0) >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                      R$ {chartData.reduce((a,b) => a+b.saldo, 0).toLocaleString()}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
