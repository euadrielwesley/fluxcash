
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';
import { useTransactions } from './TransactionsContext';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import Gamification from './Gamification';
import { motion, AnimatePresence } from 'framer-motion';
import EmailPreviewModal from './EmailPreviewModal';
import { emailTemplates } from '../utils/emailTemplates';

interface SettingsPageProps {
  onBack: () => void;
  onMenuClick: () => void;
  initialTab?: string;
  onNavigateToIntegrations: () => void;
}

type SettingsTab = 'profile' | 'ai' | 'appearance' | 'notifications' | 'data' | 'gamification' | 'support' | 'growth';

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onMenuClick, initialTab, onNavigateToIntegrations }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { userProfile } = useTransactions();

  // Sync initialTab prop with state
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as SettingsTab);
      if (initialTab !== 'profile' && window.innerWidth < 768) {
        setMobileMenuOpen(false);
      }
    }
  }, [initialTab]);

  const handleTabClick = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  const handleMobileBack = () => {
    setMobileMenuOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 md:rounded-3xl shadow-soft md:border border-zinc-100 dark:border-zinc-800 overflow-hidden relative font-sans transition-colors">

      {/* 1. Header (Unified) */}
      <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 px-6 py-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            <span className="material-symbols-outlined">menu</span>
          </button>

          <button
            onClick={mobileMenuOpen ? onBack : handleMobileBack}
            className={`${mobileMenuOpen ? 'hidden lg:flex' : 'flex lg:hidden'} p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            {!mobileMenuOpen && window.innerWidth < 768 ? getTabTitle(activeTab) : 'Configurações'}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative bg-white dark:bg-zinc-950">

        {/* 2. Sidebar / Menu (Left) */}
        <aside className={`
          w-full md:w-72 bg-zinc-50/50 dark:bg-zinc-900/30 border-r border-zinc-100 dark:border-zinc-800 flex flex-col
          absolute md:static inset-0 z-20 bg-white dark:bg-zinc-950 md:bg-transparent transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 space-y-1 overflow-y-auto flex-1 no-scrollbar">

            {/* PM FEATURE: Functional Plan Card */}
            <div
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-zinc-800 dark:to-zinc-900 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><span className="material-symbols-outlined text-6xl">diamond</span></div>
              <div className="relative z-10">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-2 inline-block ${userProfile.plan.name === 'Obsidian Pro' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-500/20 text-zinc-300'}`}>
                  {userProfile.plan.name === 'Obsidian Pro' ? 'Plano Ativo' : 'Plano Gratuito'}
                </span>
                <h3 className="font-bold text-lg">{userProfile.plan.name}</h3>
                <p className="text-xs text-slate-300 mt-1 mb-3">
                  {userProfile.plan.name === 'Obsidian Pro' ? 'Acesso total a AI e Integrações.' : 'Faça upgrade para desbloquear tudo.'}
                </p>
                <button className="text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors w-full flex items-center justify-center gap-1">
                  Gerenciar Assinatura <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </button>
              </div>
            </div>

            <TabButton id="profile" icon="person" label="Perfil & Conta" active={activeTab === 'profile'} onClick={() => handleTabClick('profile')} />
            <TabButton id="growth" icon="diversity_3" label="Indique e Ganhe" active={activeTab === 'growth'} onClick={() => handleTabClick('growth')} highlight />
            <TabButton id="gamification" icon="trophy" label="Conquistas" active={activeTab === 'gamification'} onClick={() => handleTabClick('gamification')} />
            <TabButton id="ai" icon="psychology" label="Inteligência do App" active={activeTab === 'ai'} onClick={() => handleTabClick('ai')} />
            <TabButton id="appearance" icon="palette" label="Aparência" active={activeTab === 'appearance'} onClick={() => handleTabClick('appearance')} />
            <TabButton id="notifications" icon="notifications" label="Notificações" active={activeTab === 'notifications'} onClick={() => handleTabClick('notifications')} />
            <TabButton id="data" icon="shield" label="Dados & Segurança" active={activeTab === 'data'} onClick={() => handleTabClick('data')} />
            <TabButton id="support" icon="help" label="Ajuda & Suporte" active={activeTab === 'support'} onClick={() => handleTabClick('support')} />

            {/* Integration Link */}
            <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={onNavigateToIntegrations}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 group"
              >
                <span className="material-symbols-outlined text-[22px] group-hover:text-emerald-500">extension</span>
                <span>Integrações (API)</span>
                <span className="ml-auto material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
              </button>
            </div>
          </div>

          <CurrentUserFooter />
        </aside>

        {/* 3. Content Area (Right) */}
        <main className={`
          flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 bg-white dark:bg-zinc-950 transition-opacity duration-300 absolute md:static inset-0 z-10
          ${mobileMenuOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}
        `}>
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'growth' && <GrowthSection />}
            {activeTab === 'gamification' && <Gamification />}
            {activeTab === 'ai' && <AiSection />}
            {activeTab === 'appearance' && <AppearanceSection />}
            {activeTab === 'notifications' && <NotificationSection />}
            {activeTab === 'data' && <DataSection />}
            {activeTab === 'support' && <SupportSection />}
          </div>
        </main>
      </div>

      <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
    </div>
  );
};

// --- Helper Components ---

const CurrentUserFooter: React.FC = () => {
  const { userProfile } = useTransactions();
  // Ensure we use a valid fallback for the avatar
  const avatarSrc = userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=random`;

  return (
    <div className="mt-auto p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky bottom-0">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden border border-zinc-300 dark:border-zinc-600">
          <img src={avatarSrc} alt={userProfile.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{userProfile.name}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Nível {userProfile.level}</span>
        </div>
        <button className="ml-auto p-2 text-zinc-400 hover:text-rose-500 transition-colors" title="Sair">
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ id: string; icon: string; label: string; active: boolean; onClick: () => void; highlight?: boolean }> = ({ icon, label, active, onClick, highlight }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active
      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700'
      : `text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-200 ${highlight ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10' : ''}`
      }`}
  >
    <span className={`material-symbols-outlined text-[22px] ${active ? 'filled text-primary dark:text-primary-400' : ''}`}>{icon}</span>
    <span>{label}</span>
    {highlight && <span className="ml-auto text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">NOVO</span>}
    {active && !highlight && <span className="ml-auto material-symbols-outlined text-[16px] text-zinc-400 md:hidden">chevron_right</span>}
  </button>
);

const SectionTitle: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{title}</h3>
    <p className="text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
  </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const SettingRow: React.FC<{ icon?: string; label: string; desc?: string; children: React.ReactNode; border?: boolean }> = ({ icon, label, desc, children, border = true }) => (
  <div className={`p-4 flex items-center justify-between gap-4 ${border ? 'border-b border-zinc-100 dark:border-zinc-800 last:border-0' : ''}`}>
    <div className="flex items-center gap-4">
      {icon && (
        <div className="size-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      )}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{label}</h4>
        {desc && <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] sm:max-w-xs leading-relaxed">{desc}</p>}
      </div>
    </div>
    <div className="shrink-0">
      {children}
    </div>
  </div>
);

const Switch: React.FC<{ checked?: boolean; onChange?: () => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
  </label>
);

// --- Sections Content ---

const ProfileSection = () => {
  const { userProfile, updateProfile } = useTransactions();
  const { pushNotification } = useNotification();

  const [formData, setFormData] = useState(userProfile);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleChange('avatarUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    updateProfile(formData);
    setIsDirty(false);
    setIsSaving(false);
    pushNotification({
      title: 'Perfil Atualizado',
      message: 'Suas informações foram salvas com sucesso.',
      type: 'success',
      category: 'system'
    });
  };

  const avatarSrc = formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;

  return (
    <>
      <SectionTitle title="Perfil & Conta" desc="Gerencie suas informações pessoais e visibilidade." />

      <div className="flex flex-col items-center mb-8">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="size-24 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg relative bg-zinc-100 dark:bg-zinc-800">
            <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white">photo_camera</span>
          </div>
          <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm">
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-zinc-100">{formData.name}</h3>
        <span className="text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-0.5 rounded-full font-medium">Nível {formData.level}</span>
      </div>

      <Card>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Nome Completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Profissão</label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <p className="text-[10px] text-zinc-400">Usado pela IA para gerar benchmarks de salário e gastos.</p>
          </div>
        </div>

        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-zinc-100 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end"
            >
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-70"
              >
                {isSaving ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <h4 className="text-sm font-bold text-zinc-500 mt-6 mb-2 uppercase tracking-wider px-2">Gamificação</h4>
      <Card>
        <SettingRow
          icon="public"
          label="Perfil Público"
          desc="Permitir aparecer nos rankings anônimos da comunidade."
        >
          <Switch checked={true} />
        </SettingRow>
      </Card>
    </>
  );
}

// --- GROWTH FEATURE: Referral Section ---
const GrowthSection = () => {
  const { pushNotification } = useNotification();
  const inviteLink = "flux.app/convite/alex-293";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    pushNotification({
      title: 'Link Copiado!',
      message: 'Envie para seus amigos e ganhe XP.',
      type: 'success',
      category: 'gamification'
    });
  };

  return (
    <>
      <SectionTitle title="Indique e Ganhe" desc="Traga seus amigos para o controle financeiro e suba de nível." />

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white text-center mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl -ml-10 -mb-10"></div>

        <div className="relative z-10">
          <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-lg border border-white/20">
            <span className="material-symbols-outlined text-4xl">diversity_3</span>
          </div>
          <h3 className="text-2xl font-black mb-2">Convide 3 amigos</h3>
          <p className="text-indigo-100 max-w-sm mx-auto mb-8">
            Para cada amigo que cadastrar a primeira despesa, vocês dois ganham <strong>500 XP</strong> e <strong>1 Mês de Premium</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <div className="bg-black/20 backdrop-blur-md rounded-xl px-4 py-3 font-mono text-sm border border-white/10 flex items-center gap-3 cursor-text select-all" onClick={handleCopy}>
              <span>{inviteLink}</span>
              <span className="material-symbols-outlined text-[16px] opacity-70">content_copy</span>
            </div>
            <button
              onClick={handleCopy}
              className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors w-full sm:w-auto"
            >
              Copiar Link
            </button>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Seus Convites</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">J</div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">João Silva</p>
                  <p className="text-xs text-emerald-600">Cadastro completo</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">+500 XP</span>
            </div>
            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center font-bold">M</div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">Maria Oliveira</p>
                  <p className="text-xs text-zinc-500">Pendente</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">Aguardando</span>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

const AiSection = () => {
  const { aiRules, addAIRule, removeAIRule, customCategories } = useTransactions();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  const handleAddRule = () => {
    if (keyword && category) {
      addAIRule(keyword, category);
      setKeyword('');
      setCategory('');
    }
  };

  return (
    <>
      <SectionTitle title="Inteligência do App" desc="Calibre como a IA interage com seus dados." />

      <Card className="mb-6">
        <SettingRow
          icon="auto_fix"
          label="Detectar Recorrência"
          desc="Identificar automaticamente assinaturas e contas fixas."
        >
          <Switch checked={true} />
        </SettingRow>
      </Card>

      <h4 className="text-sm font-bold text-zinc-500 mt-6 mb-2 uppercase tracking-wider px-2">Regras de Categorização</h4>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-4">
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Se contiver o texto... (Ex: Uber)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          >
            <option value="">Categorizar como...</option>
            {customCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button
          onClick={handleAddRule}
          disabled={!keyword || !category}
          className="w-full py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          + Adicionar Regra Inteligente
        </button>
      </div>

      <div className="space-y-2">
        {aiRules.map(rule => (
          <div key={rule.id} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg flex items-center gap-3 text-sm animate-fade-in group">
            <span className="material-symbols-outlined text-zinc-400">rule</span>
            <span className="text-slate-700 dark:text-zinc-300">Se contiver <strong className="text-slate-900 dark:text-zinc-100">"{rule.keyword}"</strong> → <strong className="text-emerald-600">{rule.category}</strong></span>
            <button onClick={() => removeAIRule(rule.id)} className="ml-auto text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[18px]">delete</span></button>
          </div>
        ))}
        {aiRules.length === 0 && <p className="text-xs text-center text-zinc-400 py-4">Nenhuma regra definida.</p>}
      </div>
    </>
  );
}

const AppearanceSection = () => {
  const { theme, setTheme } = useTheme();
  const { customCategories, addCustomCategory } = useTransactions();

  const handleAddCategory = () => {
    const name = prompt("Nome da nova categoria:");
    if (name) addCustomCategory(name);
  };

  return (
    <>
      <SectionTitle title="Aparência" desc="Personalize a interface visual do FluxCash." />

      <Card className="mb-6">
        <div className="p-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-4">Tema</h4>
          <div className="grid grid-cols-3 gap-4">
            {/* Light Option */}
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
            >
              <div className="w-full aspect-video bg-zinc-100 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-zinc-400">light_mode</span>
              </div>
              <span className={`text-xs font-bold ${theme === 'light' ? 'text-emerald-600' : 'text-zinc-500'}`}>Claro</span>
            </button>

            {/* Dark Option */}
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
            >
              <div className="w-full aspect-video bg-zinc-900 rounded-lg border border-zinc-700 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-zinc-500">dark_mode</span>
              </div>
              <span className={`text-xs font-bold ${theme === 'dark' ? 'text-emerald-600' : 'text-zinc-500'}`}>Escuro</span>
            </button>

            {/* System Option */}
            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
            >
              <div className="w-full aspect-video bg-gradient-to-r from-zinc-100 to-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-zinc-500 mix-blend-difference">desktop_windows</span>
              </div>
              <span className={`text-xs font-bold ${theme === 'system' ? 'text-emerald-600' : 'text-zinc-500'}`}>Sistema</span>
            </button>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-end mb-3 px-2">
        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Categorias</h4>
        <button onClick={handleAddCategory} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">add</span>
          Nova
        </button>
      </div>

      {/* Improved Category List */}
      <div className="flex flex-wrap gap-2">
        {customCategories.map((cat, idx) => (
          <div key={idx} className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm">
            <div className="size-2 rounded-full bg-slate-400"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-200">{cat}</span>
            <button className="text-zinc-300 hover:text-rose-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

const NotificationSection = () => {
  const { userProfile, balance, income, expenses } = useTransactions();
  const [emailPreview, setEmailPreview] = useState<{ isOpen: boolean; content: string; subject: string }>({ isOpen: false, content: '', subject: '' });

  const handlePreviewWeekly = () => {
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
    const content = emailTemplates.weeklyReport(userProfile.name, balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), savingsRate.toString());
    setEmailPreview({
      isOpen: true,
      content,
      subject: '📚 Seu Relatório Semanal chegou!'
    });
  };

  return (
    <>
      <SectionTitle title="Notificações" desc="Escolha como e quando você quer ser alertado." />
      <Card>
        <SettingRow label="Resumo Diário" desc="Push notification com o saldo do dia às 08:00.">
          <Switch checked={true} />
        </SettingRow>
        <div className="p-4 flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
              <span className="material-symbols-outlined text-[20px]">email</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Relatório Semanal</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] sm:max-w-xs leading-relaxed">Email com análise detalhada toda segunda-feira.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePreviewWeekly} className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-colors">
              Ver Modelo
            </button>
            <Switch checked={false} />
          </div>
        </div>
        <SettingRow label="Estouro de Orçamento" desc="Alerta imediato quando uma categoria excede 90%.">
          <Switch checked={true} />
        </SettingRow>
        <SettingRow label="Contas a Vencer" desc="Lembretes 3 dias antes do vencimento.">
          <Switch checked={true} />
        </SettingRow>
      </Card>

      <EmailPreviewModal
        isOpen={emailPreview.isOpen}
        onClose={() => setEmailPreview({ ...emailPreview, isOpen: false })}
        htmlContent={emailPreview.content}
        subject={emailPreview.subject}
      />
    </>
  );
};

const SupportSection = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { pushNotification } = useNotification();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChatOpen(false);
    pushNotification({
      title: 'Mensagem Enviada',
      message: 'Nosso time responderá em até 2 horas no seu email.',
      type: 'success',
      category: 'system'
    });
  };

  return (
    <>
      <SectionTitle title="Ajuda & Suporte" desc="Tire dúvidas ou fale com nosso time." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-left hover:border-indigo-500 transition-colors group">
          <div className="size-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-3">
            <span className="material-symbols-outlined">quiz</span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">FAQ & Tutoriais</h4>
          <p className="text-xs text-zinc-500 mt-1">Aprenda a usar regras de AI e integrações.</p>
        </button>
        <button
          onClick={() => setIsChatOpen(true)}
          className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-left hover:border-emerald-500 transition-colors group"
        >
          <div className="size-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-3">
            <span className="material-symbols-outlined">forum</span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Chat com Suporte</h4>
          <p className="text-xs text-zinc-500 mt-1">Fale com um especialista humano (Horário Comercial).</p>
        </button>
      </div>

      <Card>
        <div className="p-4">
          <h4 className="font-bold text-sm mb-2 text-slate-900 dark:text-white">Dúvidas Frequentes</h4>
          <div className="space-y-3">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer text-sm text-zinc-600 dark:text-zinc-300 font-medium list-none">
                Como funciona a IA?
                <span className="material-symbols-outlined text-zinc-400 transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <p className="text-xs text-zinc-500 mt-2 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700">
                Nossa IA analisa o título das suas transações e aplica regras automáticas baseadas em palavras-chave que você define na aba "Inteligência".
              </p>
            </details>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer text-sm text-zinc-600 dark:text-zinc-300 font-medium list-none">
                Meus dados são seguros?
                <span className="material-symbols-outlined text-zinc-400 transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <p className="text-xs text-zinc-500 mt-2 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700">
                Sim! Todas as chaves de API e dados sensíveis são criptografados localmente no seu dispositivo usando AES-256. Nós não temos acesso ao seu banco de dados.
              </p>
            </details>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsChatOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Como podemos ajudar?</h3>
                <button onClick={() => setIsChatOpen(false)}><span className="material-symbols-outlined text-zinc-400">close</span></button>
              </div>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <textarea placeholder="Descreva seu problema..." className="w-full h-32 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
                <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
                  Enviar Mensagem
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const DataSection = () => {
  const { exportData, resetData } = useTransactions();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    // Security Fix: Use user-scoped PIN or default to 1234
    const correctPin = user ? (localStorage.getItem(`flux_pin_${user.id}`) || '1234') : '1234';

    if (pin === correctPin) {
      setIsLocked(false);
      setError('');
    } else {
      setError('PIN Incorreto');
      setPin('');
    }
  };

  const handleDelete = () => {
    if (deleteInput === 'DELETAR') {
      resetData();
      setShowDeleteConfirm(false);
    }
  };

  if (isLocked) {
    return (
      <>
        <SectionTitle title="Dados & Segurança" desc="Área protegida. Confirme sua identidade." />
        <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="size-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-500">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Digite seu PIN</h3>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className={`size-3 rounded-full ${i < pin.length ? 'bg-slate-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
            ))}
          </div>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            maxLength={4}
            className="opacity-0 absolute h-0 w-0"
            autoFocus
          />

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button key={n} onClick={() => setPin(p => (p + n).slice(0, 4))} className="size-12 rounded-full bg-white dark:bg-zinc-800 font-bold text-lg shadow-sm hover:bg-zinc-50 transition-colors">
                {n}
              </button>
            ))}
            <div className="size-12"></div>
            <button onClick={() => setPin(p => (p + '0').slice(0, 4))} className="size-12 rounded-full bg-white dark:bg-zinc-800 font-bold text-lg shadow-sm hover:bg-zinc-50 transition-colors">0</button>
            <button onClick={() => setPin(p => p.slice(0, -1))} className="size-12 rounded-full flex items-center justify-center text-zinc-500 hover:text-rose-500"><span className="material-symbols-outlined">backspace</span></button>
          </div>

          <button onClick={handleUnlock} className="w-full max-w-xs bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20">
            Desbloquear
          </button>
          {error && <p className="text-rose-500 text-sm font-bold mt-4 animate-bounce">{error}</p>}
          <p className="text-[10px] text-zinc-400 mt-4">(Padrão: 1234)</p>
        </div>
      </>
    )
  }

  return (
    <>
      <SectionTitle title="Dados & Segurança" desc="Você tem total controle sobre suas informações." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <button onClick={() => exportData('json')} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-colors group">
          <span className="material-symbols-outlined text-zinc-400 group-hover:text-emerald-500">data_object</span>
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 group-hover:text-emerald-600">Exportar JSON</span>
        </button>
        <button onClick={() => exportData('csv')} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-colors group">
          <span className="material-symbols-outlined text-zinc-400 group-hover:text-emerald-500">table_view</span>
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 group-hover:text-emerald-600">Exportar Excel/CSV</span>
        </button>
      </div>

      <Card className="mb-8">
        <SettingRow
          icon="face"
          label="Biometria / FaceID"
          desc="Exigir autenticação ao abrir o aplicativo."
        >
          <Switch checked={true} />
        </SettingRow>
        <SettingRow
          icon="devices"
          label="Sessões Ativas"
          desc="Gerenciar dispositivos conectados."
        >
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-emerald-500">Este dispositivo</span>
            <span className="text-[10px] text-zinc-400">Chrome • São Paulo, BR</span>
          </div>
        </SettingRow>
      </Card>

      <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 overflow-hidden">
        <div className="p-4 border-b border-rose-100 dark:border-rose-900/50">
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">dangerous</span>
            Zona de Perigo
          </h4>
        </div>
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-rose-600/70 dark:text-rose-400/70">Ações irreversíveis. Tenha certeza antes de prosseguir.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 bg-white dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Resetar Conta
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="size-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4 mx-auto text-rose-600 dark:text-rose-500">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Tem certeza absoluta?</h3>
              <p className="text-sm text-center text-zinc-500 mb-6">
                Isso apagará todas as suas transações, metas e configurações. Esta ação <strong>não pode</strong> ser desfeita.
              </p>

              <div className="mb-4">
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Digite "DELETAR" para confirmar</label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-rose-500 focus:outline-none uppercase font-mono"
                  placeholder="DELETAR"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteInput !== 'DELETAR'}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Apagar Tudo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const SubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { userProfile } = useTransactions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
        <div className="w-full md:w-1/3 bg-slate-900 text-white p-6 flex flex-col justify-between">
          <div>
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">diamond</span>
            </div>
            <h3 className="text-xl font-bold mb-1">Seu Plano</h3>
            <p className="text-slate-400 text-sm">Você está no nível mais alto.</p>
          </div>

          <div>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Atual</p>
              <p className="text-2xl font-bold">{userProfile.plan.name}</p>
              <p className="text-emerald-400 text-sm font-medium">R$ {userProfile.plan.price}/mês</p>
            </div>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Renovação</p>
              <p className="font-mono">{new Date(userProfile.plan.renewalDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Benefícios Ativos</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"><span className="material-symbols-outlined">close</span></button>
          </div>

          <div className="space-y-4 mb-8">
            <BenefitItem icon="psychology" text="IA Ilimitada & Regras Inteligentes" />
            <BenefitItem icon="sync" text="Sincronização em Nuvem em Tempo Real" />
            <BenefitItem icon="extension" text="Acesso a API & Integrações (Webhooks)" />
            <BenefitItem icon="support_agent" text="Suporte Prioritário 24/7" />
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Histórico de Faturas</h4>
            <div className="space-y-2">
              <InvoiceItem date="24 Out 2023" amount="29.90" status="Pago" />
              <InvoiceItem date="24 Set 2023" amount="29.90" status="Pago" />
              <InvoiceItem date="24 Ago 2023" amount="29.90" status="Pago" />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button className="flex-1 py-3 border border-rose-200 text-rose-600 font-bold rounded-xl text-xs hover:bg-rose-50 transition-colors">
              Cancelar Assinatura
            </button>
            <button className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90 transition-opacity">
              Alterar Cartão
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const BenefitItem: React.FC<{ icon: string, text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="size-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-[14px]">check</span>
    </div>
    <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{text}</span>
  </div>
);

const InvoiceItem: React.FC<{ date: string, amount: string, status: string }> = ({ date, amount, status }) => (
  <div className="flex justify-between items-center text-sm py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded px-2 -mx-2 transition-colors">
    <span className="text-zinc-500">{date}</span>
    <div className="flex items-center gap-3">
      <span className="font-mono text-slate-900 dark:text-white">R$ {amount}</span>
      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{status}</span>
      <span className="material-symbols-outlined text-[16px] text-zinc-400 cursor-pointer hover:text-indigo-500">download</span>
    </div>
  </div>
);

const getTabTitle = (tab: SettingsTab) => {
  switch (tab) {
    case 'profile': return 'Perfil & Conta';
    case 'gamification': return 'Conquistas & Nível';
    case 'ai': return 'Inteligência';
    case 'appearance': return 'Aparência';
    case 'notifications': return 'Notificações';
    case 'data': return 'Dados & Segurança';
    case 'support': return 'Ajuda & Suporte';
    case 'growth': return 'Indique e Ganhe';
    default: return 'Configurações';
  }
}

export default SettingsPage;
