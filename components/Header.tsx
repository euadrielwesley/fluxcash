
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useTheme } from './ThemeContext';
import { useTransactions } from './TransactionsContext';
import { useNotification } from './NotificationContext';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  onMenuClick: () => void;
  onOpenReview?: () => void;
  onGamificationClick?: () => void;
  onNavigateSettings?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onOpenReview, onGamificationClick, onNavigateSettings }) => {
  const { userProfile, privacyMode, togglePrivacy } = useTransactions();
  const { unreadCount } = useNotification();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const xpPercentage = (userProfile.xp % 500) / 500 * 100;

  return (
    <header className="w-full px-6 py-4 md:px-12 md:py-6 flex items-center justify-between sticky top-0 z-30 bg-background-light/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 shrink-0 transition-colors duration-300">
      {/* Mobile Brand */}
      <div className="flex lg:hidden items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-slate-900 dark:text-zinc-100"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="size-8 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
          <span className="material-symbols-outlined text-[20px]">bolt</span>
        </div>
        <h1 className="text-text-main dark:text-zinc-100 text-xl font-bold tracking-tight leading-none hidden sm:block">FluxCash</h1>
      </div>

      {/* Desktop Breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 text-sm">
        <span className="text-text-muted dark:text-zinc-500">Financeiro</span>
        <span className="material-symbols-outlined text-text-muted dark:text-zinc-500 text-[14px]">chevron_right</span>
        <span className="font-semibold text-text-main dark:text-zinc-200">Visão Geral</span>
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* PRIVACY TOGGLE - SECURITY FEATURE */}
        <button
          onClick={togglePrivacy}
          className={`p-2 rounded-xl transition-colors ${privacyMode ? 'text-primary bg-primary/10' : 'text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'}`}
          title={privacyMode ? "Mostrar valores" : "Ocultar valores"}
        >
          <span className="material-symbols-outlined text-[20px]">{privacyMode ? 'visibility_off' : 'visibility'}</span>
        </button>

        <button 
          onClick={onOpenReview}
          className="hidden md:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all animate-fade-in"
        >
          <span className="material-symbols-outlined text-[16px] animate-pulse">play_circle</span>
          <span className="text-xs font-bold uppercase tracking-wide">Review</span>
        </button>

        <div className="hidden md:flex flex-col items-end mr-4">
          <span className="text-sm font-semibold text-text-main dark:text-zinc-100">Olá, {userProfile.name}</span>
          <span className="text-xs text-text-muted dark:text-zinc-400">Lvl {userProfile.level} • {userProfile.xp} XP</span>
        </div>

        {/* Level Tracker */}
        <button 
          onClick={onGamificationClick}
          className="hidden sm:flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-full px-3 py-1.5 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer active:scale-95"
        >
          <div className="size-6 bg-violet-500/10 dark:bg-violet-500/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-violet-600 dark:text-violet-400 text-[14px] filled">trophy</span>
          </div>
          <div className="flex flex-col w-20 sm:w-24 gap-1">
            <div className="flex justify-between text-[10px] font-bold text-text-main dark:text-zinc-200 leading-none">
              <span>Nível {userProfile.level}</span>
              <span>{Math.round(xpPercentage)}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-violet-600 w-full rounded-full transition-all duration-500" style={{ width: `${xpPercentage}%` }}></div>
            </div>
          </div>
        </button>

        <ThemeToggle />

        {/* NOTIFICATIONS DROPDOWN */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-text-muted dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className={`material-symbols-outlined ${showNotifications || unreadCount > 0 ? 'filled text-violet-600' : ''}`}>notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-2 bg-danger rounded-full border-2 border-background-light dark:border-zinc-900 animate-pulse"></span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <NotificationPanel 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />
            )}
          </AnimatePresence>
        </div>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="size-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden border-2 border-white dark:border-zinc-700 shadow-sm cursor-pointer hover:scale-105 transition-transform"
          >
            <img alt="User Avatar" className="w-full h-full object-cover" src={userProfile.avatarUrl} />
          </button>
          <AnimatePresence>
            {showProfileMenu && (
              <ProfileMenuContent 
                onClose={() => setShowProfileMenu(false)} 
                user={userProfile} 
                onNavigate={(tab) => {
                  setShowProfileMenu(false);
                  if(onNavigateSettings) onNavigateSettings(tab);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const ProfileMenuContent: React.FC<{ onClose: () => void; user: any; onNavigate: (tab: string) => void }> = ({ onClose, user, onNavigate }) => {
  const { theme, setTheme } = useTheme();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden p-1.5"
    >
       <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
          <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{user.name}</p>
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
       </div>
       <MenuButton icon="person" label="Meu Perfil" onClick={() => onNavigate('profile')} />
       <MenuButton icon="settings" label="Configurações" onClick={() => onNavigate('appearance')} />
       <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800"></div>
       <button 
         onClick={(e) => { e.stopPropagation(); setTheme(theme === 'dark' ? 'light' : 'dark'); }}
         className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
       >
         <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">dark_mode</span><span>Modo Escuro</span></div>
         <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-violet-500' : 'bg-zinc-300'}`}>
            <div className={`absolute top-0.5 size-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} style={{ left: theme === 'dark' ? '18px' : '2px' }}></div>
         </div>
       </button>
       <div className="my-1 h-px bg-zinc-100 dark:border-zinc-800"></div>
       <MenuButton icon="logout" label="Sair" danger onClick={() => { window.location.reload(); }} />
    </motion.div>
  )
}

const MenuButton: React.FC<{ icon: string; label: string; onClick: () => void; danger?: boolean }> = ({ icon, label, onClick, danger }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${danger ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'text-slate-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
    <span className="material-symbols-outlined text-[18px]">{icon}</span>{label}
  </button>
)

export default Header;
