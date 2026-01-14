import React, { useState } from 'react';

interface SecureInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const SecureInput: React.FC<SecureInputProps> = ({ value, onChange, placeholder, label, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className={`material-symbols-outlined text-[18px] transition-colors ${value ? 'text-emerald-500' : 'text-zinc-400'}`}>
            key
          </span>
        </div>
        
        <input 
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "sk-..."}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-sm font-mono text-slate-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
          autoComplete="off"
          spellCheck="false"
        />

        <button 
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
          title={isVisible ? "Ocultar" : "Mostrar"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isVisible ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SecureInput;