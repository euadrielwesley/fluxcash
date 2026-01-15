
import React, { useState } from 'react';
import { ViewType } from '../types';
import { useTransactions } from './TransactionsContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenModal?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onNavigate, onOpenModal }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userProfile } = useTransactions();

  // Toggle function for desktop
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile Overlay (Apenas Mobile) */}
      <div
        className={`fixed inset-0 bg-zinc-900/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* 
        ASIDE CONTAINER 
      */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 flex flex-col bg-white dark:bg-[#09090b] border-r border-zinc-100 dark:border-zinc-800 h-full z-[70] lg:z-50
        transition-[width,transform] duration-500 cubic-bezier(0.2, 0, 0, 1)
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px] w-[280px]'}
      `} id="sidebar-menu">

        {/* 1. Header & Brand */}
        <div className={`h-[88px] flex items-center shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>

          {/* Logo Group */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`
              bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20 shrink-0 transition-all duration-500
              ${isCollapsed ? 'size-10 rounded-xl' : 'size-10'}
            `}>
              <span className="material-symbols-outlined text-[24px]">bolt</span>
            </div>

            <h1 className={`text-slate-900 dark:text-zinc-100 text-xl font-bold tracking-tight font-sans whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 translate-x-[-10px]' : 'opacity-100 w-auto translate-x-0'}`}>
              FluxCash
            </h1>
          </div>

          {/* Toggle Button (Desktop Only) */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-2 rounded-lg text-zinc-400 hover:text-slate-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Recolher Menu"
            >
              <span className="material-symbols-outlined text-[20px]">dock_to_left</span>
            </button>
          )}
        </div>

        {/* 2. Hero CTA Button */}
        <div className={`mt-2 mb-6 transition-all duration-500 ${isCollapsed ? 'px-4' : 'px-6'}`}>
          <button
            id="quick-add-sidebar"
            onClick={onOpenModal}
            className={`
              relative group flex items-center justify-center overflow-hidden
              bg-slate-900 dark:bg-violet-600 hover:bg-slate-800 dark:hover:bg-violet-500
              text-white shadow-xl shadow-slate-900/10 dark:shadow-violet-600/20
              transition-all duration-500 cubic-bezier(0.2, 0, 0, 1) active:scale-95
              ${isCollapsed ? 'size-12 rounded-2xl mx-auto' : 'w-full h-12 rounded-xl gap-3'}
            `}
          >
            <span className="material-symbols-outlined text-[24px] group-hover:rotate-90 transition-transform duration-500">add</span>

            <span className={`font-bold whitespace-nowrap transition-all duration-500 ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100 static'}`}>
              Novo
            </span>
          </button>
        </div>

        {/* 3. Modern Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar py-2">

          <NavItem
            icon="grid_view"
            label="Visão Geral"
            active={currentView === 'dashboard'}
            collapsed={isCollapsed}
            onClick={() => onNavigate('dashboard')}
          />

          {/* NEW ITEM: MISSIONS */}
          <NavItem
            icon="target"
            label="Missões Diárias"
            active={currentView === 'gamification'}
            collapsed={isCollapsed}
            onClick={() => onNavigate('gamification')}
          />

          <NavItem
            icon="account_balance_wallet"
            label="Carteira"
            active={currentView === 'wallet'}
            collapsed={isCollapsed}
            onClick={() => onNavigate('wallet')}
          />
          <NavItem
            icon="receipt_long"
            label="Extrato"
            active={currentView === 'transactions'}
            collapsed={isCollapsed}
            onClick={() => onNavigate('transactions')}
          />

          <SectionDivider collapsed={isCollapsed} />

          <NavItem
            icon="trending_up"
            label="Entradas"
            active={currentView === 'income'}
            collapsed={isCollapsed}
            onClick={() => onNavigate('income')}
            colorTheme="emerald"
          />
          <NavItem
            icon="trending_down"
            label="Saídas"
            active={currentView === 'expenses'}
            collapsed={isCollapsed}
            onClick={() => onNavigate('expenses')}
            colorTheme="rose"
          />

          <SectionDivider collapsed={isCollapsed} />

          <NavItem
            icon="monitoring"
            label="Relatórios"
            active={currentView === 'analytics'}
            collapsed={isCollapsed}
            onClick={() => onNavigate('analytics')}
          />
        </nav>

        {/* 4. Footer & Profile */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#09090b] relative">

          {/* Expand Toggle (Visible only when collapsed) */}
          {isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex absolute -top-3 left-1/2 -translate-x-1/2 size-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full items-center justify-center text-zinc-400 hover:text-violet-600 shadow-sm transition-all hover:scale-110 z-10"
              title="Expandir Menu"
            >
              <span className="material-symbols-outlined text-[16px]">dock_to_right</span>
            </button>
          )}

          <div className={`
            flex items-center gap-3 p-2 rounded-xl transition-all duration-300 cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-900
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            {/* Avatar */}
            <div className="relative shrink-0">
              <img src={userProfile.avatarUrl || "https://ui-avatars.com/api/?background=random"} alt="Profile" className="size-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800 shadow-sm" />
              <span className="absolute bottom-0 right-0 size-2.5 bg-violet-500 border-2 border-white dark:border-zinc-950 rounded-full"></span>
            </div>

            {/* Info & Settings */}
            <div className={`flex items-center justify-between flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">{userProfile.name}</span>
                <span className="text-[11px] text-zinc-400 font-medium truncate">{userProfile.plan?.name || 'Free'}</span>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onNavigate('settings'); }}
                className="p-1.5 text-zinc-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// --- Sub Components ---

const SectionDivider: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div className={`h-px bg-zinc-100 dark:bg-zinc-800 my-4 transition-all duration-300 ${collapsed ? 'mx-2' : 'mx-4'}`} />
);

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  colorTheme?: 'emerald' | 'rose' | 'amber' | 'blue';
}

const NavItem: React.FC<NavItemProps & { view?: string }> = ({ icon, label, active, collapsed, onClick, colorTheme, view }) => {

  let activeClass = 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400';
  let iconClass = 'text-violet-600 dark:text-violet-400';

  if (active) {
    if (colorTheme === 'emerald') {
      activeClass = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      iconClass = 'text-emerald-600 dark:text-emerald-400';
    } else if (colorTheme === 'rose') {
      activeClass = 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400';
      iconClass = 'text-rose-600 dark:text-rose-400';
    }
  }

  const handleMouseEnter = () => {
    if (!view) return;
    const routes: Record<string, () => Promise<any>> = {
      'transactions': () => import('./TransactionsPage'),
      'wallet': () => import('./WalletPage'),
      'analytics': () => import('./AnalyticsPage'),
      'settings': () => import('./SettingsPage'),
      'income': () => import('./IncomePage'),
      'expenses': () => import('./ExpensesPage'),
      'gamification': () => import('./Gamification')
    };
    if (routes[view]) {
      routes[view]();
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group outline-none
        ${active
          ? `${activeClass} font-bold shadow-sm`
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-200 font-medium'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <span
        className={`material-symbols-outlined text-[24px] transition-all duration-300 shrink-0
          ${active ? 'filled' : ''}
          ${active ? iconClass : ''}
          ${collapsed ? 'group-hover:scale-110' : ''}
        `}
      >
        {icon}
      </span>

      <span className={`text-[14px] whitespace-nowrap transition-all duration-300 origin-left ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
        {label}
      </span>

      {collapsed && (
        <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-zinc-800 text-white dark:text-zinc-100 text-xs font-bold rounded-lg opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
          {label}
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-slate-900 dark:border-r-zinc-800"></div>
        </div>
      )}
    </button>
  );
}

export default Sidebar;
