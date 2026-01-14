
import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTransactions } from './TransactionsContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entradas = payload.find((p: any) => p.dataKey === 'entradas')?.value || 0;
    const saidas = payload.find((p: any) => p.dataKey === 'saidas')?.value || 0;
    const saldo = entradas - saidas;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-800 min-w-[180px]">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{label}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-medium text-slate-300">Entradas</span>
            </div>
            <span className="text-sm font-bold">R$ {entradas.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-rose-400"></span>
              <span className="text-xs font-medium text-slate-300">Saídas</span>
            </div>
            <span className="text-sm font-bold text-rose-400">R$ {saidas.toLocaleString()}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-white">Saldo Líquido</span>
            <span className={`text-sm font-black ${saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              R$ {saldo.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CashFlowChart: React.FC = React.memo(() => {
  const { transactions, privacyMode } = useTransactions();

  // Aggregate data by month
  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = months.map(m => ({ month: m, entradas: 0, saidas: 0, saldo: 0 }));

    transactions.forEach(t => {
      const date = t.dateIso ? new Date(t.dateIso) : new Date();
      const monthIndex = date.getMonth();
      const amount = Math.abs(t.amount);

      if (t.type === 'income') {
        data[monthIndex].entradas += amount;
      } else {
        data[monthIndex].saidas += amount;
      }
    });

    // Compute balance
    return data.map(d => ({
      ...d,
      saldo: d.entradas - d.saidas
    }));

  }, [transactions]);

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-[2rem] p-8 shadow-soft dark:shadow-none border border-zinc-200 dark:border-zinc-800 flex flex-col group/chart transition-colors relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fluxo de Caixa</h3>
            <span className="bg-primary/10 text-primary dark:text-primary-light text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Live</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Análise de performance financeira anual</p>
        </div>

        <div className="flex items-center gap-6 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 px-2">
            <div className="size-3 rounded-full bg-gradient-to-t from-primary to-emerald-300"></div>
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Entradas</span>
          </div>
          <div className="flex items-center gap-2 px-2 border-l border-zinc-200 dark:border-zinc-700">
            <div className="size-3 rounded-full bg-gradient-to-t from-danger to-rose-300"></div>
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Saídas</span>
          </div>
          <div className="flex items-center gap-2 px-2 border-l border-zinc-200 dark:border-zinc-700">
            <div className="size-3 rounded-full bg-blue-500"></div>
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Tendência</span>
          </div>
        </div>
      </div>

      <div className={`h-80 w-full relative transition-all duration-500 ${privacyMode ? 'blur-lg opacity-50 scale-[0.98]' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={12}
          >
            <defs>
              <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={1} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={1} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.05} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="var(--grid-stroke)" strokeDasharray="8 8" className="stroke-zinc-100 dark:stroke-zinc-800" />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
              dy={15}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              tickFormatter={(value) => `R$ ${value / 1000}k`}
            />

            {!privacyMode && (
              <Tooltip
                cursor={{ fill: 'var(--tooltip-cursor)', radius: 12 }}
                content={<CustomTooltip />}
              />
            )}

            <Area
              type="monotone"
              dataKey="entradas"
              stroke="none"
              fill="url(#colorArea)"
              tooltipType="none"
            />

            <Bar
              dataKey="entradas"
              fill="url(#colorEntradas)"
              radius={[6, 6, 2, 2]}
              barSize={24}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-in-${index}`}
                  fillOpacity={index === new Date().getMonth() ? 1 : 0.4}
                  className="transition-all duration-300 hover:fill-opacity-100"
                />
              ))}
            </Bar>

            <Bar
              dataKey="saidas"
              fill="url(#colorSaidas)"
              radius={[6, 6, 2, 2]}
              barSize={24}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-out-${index}`}
                  fillOpacity={index === new Date().getMonth() ? 1 : 0.4}
                  className="transition-all duration-300 hover:fill-opacity-100"
                />
              ))}
            </Bar>

            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#3b82f6"
              strokeWidth={4}
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={2000}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* CSS Var Injection for Chart Colors Adaptation */}
        <style>{`
          .dark {
            --grid-stroke: #27272a; /* zinc-800 */
            --tooltip-cursor: rgba(255,255,255,0.05);
          }
          :root {
            --grid-stroke: #f1f5f9; /* slate-100 */
            --tooltip-cursor: #f8fafc;
          }
        `}</style>
      </div>

      {privacyMode && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="bg-slate-900/80 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur-sm border border-white/10">
            <span className="material-symbols-outlined align-middle mr-2 text-[16px]">visibility_off</span>
            Visão Protegida
          </span>
        </div>
      )}
    </div>
  );
});

export default CashFlowChart;
