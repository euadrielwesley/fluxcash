import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = () => {
    if (theme === 'light') return 'light_mode';
    if (theme === 'dark') return 'dark_mode';
    return 'desktop_windows';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors flex items-center justify-center"
        title="Alterar tema"
      >
        <span className="material-symbols-outlined text-[20px]">{getIcon()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-lg shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden z-50 animate-fade-in">
          <div className="p-1 flex flex-col gap-0.5">
            <ThemeOption 
              active={theme === 'light'} 
              onClick={() => { setTheme('light'); setIsOpen(false); }}
              icon="light_mode"
              label="Claro"
            />
            <ThemeOption 
              active={theme === 'dark'} 
              onClick={() => { setTheme('dark'); setIsOpen(false); }}
              icon="dark_mode"
              label="Escuro"
            />
            <ThemeOption 
              active={theme === 'system'} 
              onClick={() => { setTheme('system'); setIsOpen(false); }}
              icon="desktop_windows"
              label="Sistema"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ThemeOption: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left
      ${active 
        ? 'bg-zinc-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-100' 
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-200'}
    `}
  >
    <span className="material-symbols-outlined text-[18px]">{icon}</span>
    <span>{label}</span>
    {active && <span className="ml-auto size-1.5 rounded-full bg-primary"></span>}
  </button>
);

export default ThemeToggle;