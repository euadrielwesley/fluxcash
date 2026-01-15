import React, { useState } from 'react';
import { useIntegration } from './IntegrationContext';
import { useNotification } from './NotificationContext';
import SecureInput from './SecureInput';
import { IntegrationCategory, IntegrationConfig } from '../types';
import { AIService } from '../services/AIService';
import SystemHealthWidget from './SystemHealthWidget';

interface IntegrationsPageProps {
  onBack: () => void;
  onMenuClick: () => void;
}

// --- CONFIGURATION METADATA ---
interface ServiceField {
  key: string;
  label: string;
  type: 'text' | 'secure';
  placeholder?: string;
}

interface ServiceDefinition {
  id: string;
  name: string;
  category: IntegrationCategory;
  icon: string;
  color: string;
  desc: string;
  fields: ServiceField[];
  canTest?: boolean;
}

const SERVICES: ServiceDefinition[] = [

  {
    id: 'openai',
    name: 'OpenAI',
    category: 'intelligence',
    icon: 'neurology',
    color: 'text-emerald-500',
    desc: 'Conecte-se ao GPT-4 para categorização inteligente.',
    fields: [
      { key: 'apiKey', label: 'API Secret Key', type: 'secure', placeholder: 'sk-...' },
      { key: 'model', label: 'Nome do Modelo', type: 'text', placeholder: 'gpt-4o-mini' },
      { key: 'orgId', label: 'Organization ID (Opcional)', type: 'text', placeholder: 'org-...' }
    ],
    canTest: true
  },
  {
    id: 'ollama',
    name: 'Ollama / Local AI',
    category: 'intelligence',
    icon: 'terminal',
    color: 'text-slate-900 dark:text-white',
    desc: 'Use LLMs locais (Llama3, Mistral) sem custo de API.',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'http://localhost:11434/v1' },
      { key: 'model', label: 'Nome do Modelo', type: 'text', placeholder: 'llama3' },
      { key: 'apiKey', label: 'API Key (Se necessário)', type: 'secure', placeholder: 'ollama' }
    ],
    canTest: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'intelligence',
    icon: 'psychology',
    color: 'text-orange-500',
    desc: 'Análise avançada de contextos longos.',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'secure' }]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'intelligence',
    icon: 'spark',
    color: 'text-blue-500',
    desc: 'IA Multimodal de alta performance do Google.',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'secure', placeholder: 'AIza...' }],
    canTest: true
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    category: 'intelligence',
    icon: 'speed',
    color: 'text-orange-600',
    desc: 'Inferência ultra-rápida (LPU) para respostas instantâneas.',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'secure', placeholder: 'gsk_...' }],
    canTest: true
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    category: 'analytics',
    icon: 'code',
    color: 'text-blue-500',
    desc: 'Injeção de scripts de terceiros e pixel de rastreamento.',
    fields: [{ key: 'containerId', label: 'Container ID', type: 'text', placeholder: 'GTM-XXXXXX' }]
  },
  {
    id: 'webhook',
    name: 'Webhook Global',
    category: 'automation',
    icon: 'webhook',
    color: 'text-purple-500',
    desc: 'Notificar sistemas externos (n8n/Zapier) a cada transação.',
    fields: [{ key: 'url', label: 'Payload URL', type: 'text' }, { key: 'secret', label: 'Signing Secret', type: 'secure' }]
  },
];

const CATEGORIES: { id: IntegrationCategory; label: string; icon: string }[] = [
  { id: 'sync', label: 'Sync & Banco', icon: 'cloud_sync' },
  { id: 'intelligence', label: 'Inteligência (AI)', icon: 'psychology' },
  { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
  { id: 'automation', label: 'Automação', icon: 'bolt' },
  { id: 'data', label: 'Dados Externos', icon: 'database' },
];

const IntegrationsPage: React.FC<IntegrationsPageProps> = ({ onBack, onMenuClick }) => {
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>('sync');
  const filteredServices = SERVICES.filter(s => s.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 md:rounded-3xl shadow-soft md:border border-zinc-100 dark:border-zinc-800 overflow-hidden relative">

      {/* Header */}
      <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 px-6 py-6 flex flex-col md:flex-row md:items-center justify-between shrink-0 z-20 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <button onClick={onBack} className="hidden lg:flex p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">lock</span>
              Integrações (API)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Gerencie chaves de API e serviços conectados. Seus dados são criptografados localmente.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Categories */}
        <aside className="w-20 md:w-64 bg-zinc-50/50 dark:bg-zinc-900/30 border-r border-zinc-100 dark:border-zinc-800 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-2 space-y-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex flex-col md:flex-row items-center md:gap-3 px-2 md:px-4 py-3 rounded-xl transition-all duration-200 ${activeCategory === cat.id
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${activeCategory === cat.id ? 'filled' : ''}`}>{cat.icon}</span>
                <span className="text-[10px] md:text-sm font-bold md:font-medium mt-1 md:mt-0 text-center md:text-left">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto p-4">
            <SystemHealthWidget />
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar p-6 bg-white dark:bg-zinc-950">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {filteredServices.map(service => (
              <IntegrationCard key={service.id} service={service} />
            ))}

            {filteredServices.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">extension_off</span>
                <p className="text-sm">Nenhuma integração disponível nesta categoria.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const IntegrationCard: React.FC<{ service: ServiceDefinition }> = ({ service }) => {
  const { integrations, updateIntegration } = useIntegration();
  const { pushNotification } = useNotification();
  const config = integrations[service.id] || { id: service.id, enabled: false, credentials: {} };

  const [localCreds, setLocalCreds] = useState<Record<string, string>>(config.credentials || {});
  const [isTesting, setIsTesting] = useState(false);

  const handleToggle = () => {
    updateIntegration(service.id, { enabled: !config.enabled });
  };

  const handleCredentialChange = (key: string, value: string) => {
    const newCreds = { ...localCreds, [key]: value };
    setLocalCreds(newCreds);
    // Auto-save debounced (simulated direct update here for UX speed)
    updateIntegration(service.id, { credentials: newCreds });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);

    // Construct a temporary config for testing
    const testConfig: IntegrationConfig = {
      ...config,
      credentials: localCreds
    };

    const result = await AIService.testConnection(testConfig);

    setIsTesting(false);

    pushNotification({
      title: result.success ? 'Conectado' : 'Falha na Conexão',
      message: result.message,
      type: result.success ? 'success' : 'error',
      category: 'system'
    });
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${config.enabled ? 'border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-900/5' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`size-12 rounded-xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 ${service.color}`}>
              <span className="material-symbols-outlined text-[28px]">{service.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{service.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{service.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${config.enabled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
              {config.enabled ? 'Ativo' : 'Desativado'}
            </span>
            <Switch checked={config.enabled} onChange={handleToggle} />
          </div>
        </div>

        {config.enabled && (
          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 animate-fade-in space-y-4">
            {service.fields.map((field) => (
              field.type === 'secure' ? (
                <SecureInput
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={localCreds[field.key] || ''}
                  onChange={(val) => handleCredentialChange(field.key, val)}
                />
              ) : (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={localCreds[field.key] || ''}
                    onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                    spellCheck="false"
                  />
                </div>
              )
            ))}

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                Criptografado localmente (AES-256)
              </span>

              {service.canTest && (
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !localCreds['apiKey'] && !localCreds['baseUrl']}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isTesting ? (
                    <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                  )}
                  {isTesting ? 'Testando...' : 'Testar Conexão'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Switch: React.FC<{ checked?: boolean; onChange?: () => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
  </label>
);

export default IntegrationsPage;