
// FluxCash Dashboard - Redeploy Trigger
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import Alerts from './components/Alerts';
import RecentTransactions from './components/RecentTransactions';
import QuickAddModal from './components/QuickAddModal';
import Gamification from './components/Gamification';
import MonthlyReview from './components/MonthlyReview';
import MissionsWidget from './components/MissionsWidget';
import MonthlyReview from './components/MonthlyReview';
import MissionsWidget from './components/MissionsWidget';
import { ThemeProvider } from './components/ThemeContext';
import { TransactionsProvider, useTransactions } from './components/TransactionsContext';
import { NotificationProvider, useNotification } from './components/NotificationContext';
import { IntegrationProvider } from './components/IntegrationContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import AnalyticsManager from './components/AnalyticsManager';
import ToastContainer from './components/ToastContainer';
import NotificationPanel from './components/NotificationPanel';
import ThemeToggle from './components/ThemeToggle';
import LoginPage from './components/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';
import { Transaction, ViewType, Story } from './types';
import InstallPromptBanner from './components/InstallPromptBanner';
import PageLoader from './components/PageLoader';

// Lazy load heavy page components for better performance
const TransactionsPage = lazy(() => import('./components/TransactionsPage'));
const WalletPage = lazy(() => import('./components/WalletPage'));
const AnalyticsPage = lazy(() => import('./components/AnalyticsPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const ExpensesPage = lazy(() => import('./components/ExpensesPage'));
const IncomePage = lazy(() => import('./components/IncomePage'));
const IntegrationsPage = lazy(() => import('./components/IntegrationsPage'));
const FluxOmni = lazy(() => import('./components/FluxOmni'));
const OnboardingTour = lazy(() => import('./components/OnboardingTour'));

// Lazy load Dashboard Widgets (Heavy Charts)
const CashFlowChart = lazy(() => import('./components/CashFlowChart'));
const WeeklyBurnChart = lazy(() => import('./components/WeeklyBurnChart'));
const TopCategories = lazy(() => import('./components/TopCategories'));


// --- STORY VIEWER ---
const StoryViewer: React.FC<{ story: Story; onClose: () => void; onNavigate: (view: ViewType) => void }> = ({ story, onClose, onNavigate }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onClose]);

  const handleClick = () => {
    if (story.id === 'balance') onNavigate('analytics');
    else if (story.id === 'top_expense') onNavigate('expenses');
    else if (story.id === 'last_tx') onNavigate('transactions');
    else onNavigate('dashboard');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed inset-0 z-[200] bg-gradient-to-br ${story.content.bgGradient} flex flex-col p-6 text-white`}
    >
      <div className="flex gap-1 w-full h-1 bg-white/30 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-white transition-all ease-linear" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          {story.img ? (
            <img src={story.img} className="size-10 rounded-full border-2 border-white" />
          ) : (
            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
              <span className="material-symbols-outlined">{story.icon}</span>
            </div>
          )}
          <span className="font-bold">{story.label}</span>
          <span className="text-white/60 text-xs">Agora</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-6">
        <div className="size-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-2xl animate-pulse">
          <span className="material-symbols-outlined text-6xl">{story.icon || 'bolt'}</span>
        </div>
        <h2 className="text-xl font-medium opacity-90 uppercase tracking-widest">{story.content.title}</h2>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">{story.content.value}</h1>
        <p className="text-lg opacity-80 max-w-xs leading-relaxed">{story.content.desc}</p>
      </div>
      <div className="mt-auto pt-8 flex justify-center">
        <button onClick={handleClick} className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
          Ver Detalhes <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
};

// --- AUTH GUARDED CONTENT ---
const AuthenticatedApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [initialSettingsTab, setInitialSettingsTab] = useState('profile');
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const { transactions, balance, isDataLoading, userProfile, currentDate, nextMonth, prevMonth, privacyMode, togglePrivacy } = useTransactions();
  const { unreadCount } = useNotification();
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  // Dynamic Stories (Only show if there is data)
  const dynamicStories = useMemo(() => {
    const stories: Story[] = [];

    // Only show stories if user has transactions
    if (transactions.length > 0) {
      stories.push({
        id: 'balance',
        label: 'Resumo',
        img: userProfile.avatarUrl,
        ring: 'from-emerald-400 to-emerald-600',
        viewed: false,
        content: {
          title: 'Saldo Atual',
          value: `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          desc: balance > 0 ? 'Você está no verde! Continue assim.' : 'Cuidado, você entrou no vermelho.',
          bgGradient: balance > 0 ? 'from-emerald-600 to-teal-800' : 'from-rose-600 to-red-800'
        }
      });
    }
    return stories;
  }, [transactions, balance, userProfile]);

  const handleGamificationClick = useCallback(() => {
    setInitialSettingsTab('gamification');
    setCurrentView('settings');
  }, []);

  const handleNavigateToSettings = useCallback((tab: string) => {
    setInitialSettingsTab(tab);
    setCurrentView('settings');
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  }, []);

  // Skeleton Loading handled by individual components or context transparency
  // if (isDataLoading) { ... } -> Removed blocking return to allow UI to mount


  // --- MOBILE COMPONENTS ---

  const MobileTopBar = () => {
    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const fullYear = currentDate.getFullYear();

    return (
      <div className="fixed top-0 left-0 right-0 h-14 bg-background-light/90 dark:bg-[#09090b]/90 backdrop-blur-md z-40 border-b border-zinc-200/50 dark:border-zinc-800 px-4 flex items-center justify-between md:hidden animate-fade-in transition-colors">

        {/* Left: Menu & Privacy */}
        <div className="flex items-center gap-1">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-full text-slate-800 dark:text-zinc-300 active:bg-zinc-200 dark:active:bg-zinc-800 transition-colors">
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <button onClick={togglePrivacy} className="p-2 rounded-full text-slate-800 dark:text-zinc-300 active:bg-zinc-200 dark:active:bg-zinc-800 transition-colors">
            <span className="material-symbols-outlined text-[22px]">{privacyMode ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>

        {/* Center: Date Navigation */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-full px-1 py-0.5 border border-zinc-200 dark:border-zinc-800">
          <button onClick={prevMonth} className="size-7 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide w-16 text-center">
            {monthName} <span className="text-zinc-400">{fullYear}</span>
          </span>
          <button onClick={nextMonth} className="size-7 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Right: Notifications */}
        <div className="flex items-center gap-1">
          <button onClick={() => setShowMobileNotifications(true)} className="relative p-2 rounded-full text-slate-800 dark:text-zinc-300 active:bg-zinc-200 dark:active:bg-zinc-800 transition-colors">
            <span className={`material-symbols-outlined text-[24px] ${unreadCount > 0 ? 'filled text-primary' : ''}`}>notifications</span>
            {unreadCount > 0 && <span className="absolute top-2 right-2 size-2 bg-danger rounded-full border-2 border-white dark:border-zinc-950 animate-pulse"></span>}
          </button>
        </div>
      </div>
    );
  };

  const MobileStories = () => (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-4 md:hidden border-b border-zinc-200/50 dark:border-zinc-800 bg-background-light dark:bg-[#09090b] transition-colors shrink-0">
      <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer" onClick={handleOpenAddModal}>
        <div className="size-[68px] rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center text-primary bg-primary/5">
          <span className="material-symbols-outlined text-[28px]">add</span>
        </div>
        <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-400">Novo</span>
      </div>
      {dynamicStories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group" onClick={() => setActiveStory(story)}>
          <div className={`p-[2px] rounded-full bg-gradient-to-tr ${story.ring}`}>
            <div className="p-[2px] bg-white dark:bg-zinc-900 rounded-full">
              {story.img ? (
                <img src={story.img} alt={story.label} className="size-[60px] rounded-full object-cover" />
              ) : (
                <div className={`size-[60px] rounded-full flex items-center justify-center ${story.color}`}>
                  <span className="material-symbols-outlined text-[28px]">{story.icon}</span>
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-400 truncate max-w-[70px]">{story.label}</span>
        </div>
      ))}
    </div>
  );

  const MobileBottomBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-lg border-t border-zinc-200/50 dark:border-zinc-800 pb-safe md:hidden z-50 h-[60px] flex items-center justify-around px-2 transition-colors">
      <NavIcon icon="home" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
      <NavIcon icon="account_balance_wallet" active={currentView === 'wallet'} onClick={() => setCurrentView('wallet')} />

      {/* Spacer for FAB */}
      <div className="mb-6 size-14 opacity-0 pointer-events-none"></div>

      <NavIcon icon="bar_chart" active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
      <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center justify-center w-12 h-full active:scale-95 transition-transform`}>
        <div className={`size-7 rounded-full overflow-hidden border-2 ${currentView === 'settings' ? 'border-slate-900 dark:border-emerald-500' : 'border-transparent'}`}>
          <img src={userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=random`} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </button>
    </div>
  );

  const NavIcon = ({ icon, active, onClick }: { icon: string; active?: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-12 h-full active:scale-90 transition-transform ${active ? 'text-slate-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}
    >
      <span className={`material-symbols-outlined text-[26px] ${active ? 'filled' : ''}`}>{icon}</span>
    </button>
  );

  const showMobileTopBar = currentView === 'dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-[#09090b] transition-colors duration-300">
      <OnboardingTour />
      <AnimatePresence>
        {activeStory && <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} onNavigate={setCurrentView} />}
      </AnimatePresence>
      <AnimatePresence>
        {showMobileNotifications && <NotificationPanel isOpen={showMobileNotifications} onClose={() => setShowMobileNotifications(false)} isMobile />}
      </AnimatePresence>

      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        {/* DESKTOP LAYOUT (Unchanged) */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setSidebarOpen(false);
            if (view !== 'settings') setInitialSettingsTab('profile');
          }}
          onOpenModal={handleOpenAddModal}
        />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {!['transactions', 'wallet', 'analytics', 'settings', 'expenses', 'income', 'integrations'].includes(currentView) && (
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              onOpenReview={() => setIsReviewOpen(true)}
              onGamificationClick={handleGamificationClick}
              onNavigateSettings={handleNavigateToSettings}
            />
          )}
          <main className={`flex-1 w-full max-w-[1600px] mx-auto flex flex-col overflow-hidden ${!['transactions', 'wallet', 'analytics', 'settings', 'expenses', 'income', 'integrations'].includes(currentView) ? 'px-6 py-8 md:px-12 gap-8 overflow-y-auto no-scrollbar' : ''}`}>
            {currentView === 'dashboard' && (
              <>
                <section id="balance-card" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <BalanceCard onOpenModal={handleOpenAddModal} />
                  <div className="flex flex-col gap-6 h-full">
                    <div className="h-full"> <MissionsWidget /> </div>
                  </div>
                </section>
                <section className="grid grid-cols-1 gap-6">
                  <Suspense fallback={<div className="h-[300px] w-full bg-slate-900/50 animate-pulse rounded-[2rem]"></div>}>
                    <CashFlowChart />
                  </Suspense>
                </section>
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Suspense fallback={<div className="h-[200px] w-full bg-slate-900/50 animate-pulse rounded-[2rem]"></div>}>
                    <WeeklyBurnChart />
                  </Suspense>
                  <Alerts />
                  <Suspense fallback={<div className="h-[200px] w-full bg-slate-900/50 animate-pulse rounded-[2rem]"></div>}>
                    <TopCategories />
                  </Suspense>
                </section>
                <section className="mb-8">
                  <RecentTransactions onEdit={handleOpenEditModal} />
                </section>
              </>
            )}
            {/* ... other desktop views ... */}
            {currentView === 'gamification' && <div className="overflow-y-auto no-scrollbar h-full"><Gamification /></div>}

            <Suspense fallback={<PageLoader />}>
              {currentView === 'transactions' && <TransactionsPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} onEdit={handleOpenEditModal} />}
              {currentView === 'wallet' && <WalletPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} />}
              {currentView === 'analytics' && <AnalyticsPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} />}
              {currentView === 'settings' && <SettingsPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} initialTab={initialSettingsTab} onNavigateToIntegrations={() => setCurrentView('integrations')} />}
              {currentView === 'expenses' && <ExpensesPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} />}
              {currentView === 'income' && <IncomePage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} onAddClick={handleOpenAddModal} />}
              {currentView === 'integrations' && <IntegrationsPage onBack={() => setCurrentView('settings')} onMenuClick={() => setSidebarOpen(true)} />}
            </Suspense>
          </main>
        </div>
      </div>

      {/* MOBILE LAYOUT (Refactored) */}
      <div className="md:hidden flex flex-col w-full h-full bg-background-light dark:bg-[#09090b] transition-colors relative">

        {showMobileTopBar && <MobileTopBar />}

        {/* Sidebar Drawer on Mobile */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setSidebarOpen(false);
            if (view !== 'settings') setInitialSettingsTab('profile');
          }}
          onOpenModal={() => {
            setSidebarOpen(false);
            handleOpenAddModal();
          }}
        />

        <div className={`flex-1 overflow-y-auto no-scrollbar ${showMobileTopBar ? 'pt-14' : ''} pb-20`}>
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <MobileStories />

                <div id="balance-card-mobile" className="px-4">
                  <BalanceCard onOpenModal={handleOpenAddModal} />
                </div>

                <div className="px-4">
                  <MissionsWidget />
                </div>

                <div className="px-4">
                  <Suspense fallback={<div className="h-[200px] w-full bg-slate-900/50 animate-pulse rounded-[2rem]"></div>}>
                    <CashFlowChart />
                  </Suspense>
                </div>

                <div className="px-4">
                  <Alerts />
                </div>

                <div className="px-4 grid grid-cols-1 gap-4">
                  <Suspense fallback={<div className="h-[150px] w-full bg-slate-900/50 animate-pulse rounded-[2rem]"></div>}>
                    <WeeklyBurnChart />
                  </Suspense>
                  <Suspense fallback={<div className="h-[150px] w-full bg-slate-900/50 animate-pulse rounded-[2rem]"></div>}>
                    <TopCategories />
                  </Suspense>
                </div>

                <div className="pb-4">
                  <div className="px-4 py-2 flex items-center justify-between sticky top-0 bg-background-light/95 dark:bg-[#09090b]/95 backdrop-blur z-10">
                    <h3 className="font-bold text-slate-900 dark:text-zinc-100">Atividades</h3>
                    <button className="text-xs font-semibold text-primary" onClick={() => setCurrentView('transactions')}>Ver tudo</button>
                  </div>
                  <RecentTransactions onEdit={handleOpenEditModal} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="other-views"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {currentView === 'gamification' && <div className="p-4"><Gamification /></div>}
                <Suspense fallback={<PageLoader />}>
                  {currentView === 'transactions' && <TransactionsPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} onEdit={handleOpenEditModal} />}
                  {currentView === 'wallet' && <WalletPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} />}
                  {currentView === 'analytics' && <AnalyticsPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} />}
                  {currentView === 'settings' && <SettingsPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} initialTab={initialSettingsTab} />}
                  {currentView === 'expenses' && <ExpensesPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} />}
                  {currentView === 'income' && <IncomePage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} />}
                  {currentView === 'integrations' && <IntegrationsPage onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} />}
                  {currentView === 'flux-omni' && <FluxOmni onBack={() => setCurrentView('dashboard')} onMenuClick={() => setSidebarOpen(true)} />}
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <MobileBottomBar />
      </div>

      <div id="quick-add-btn">
        <FluxOmni currentView={currentView} onOpenAddModal={handleOpenAddModal} onNavigateWallet={() => setCurrentView('wallet')} />
      </div>
      <QuickAddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={transactionToEdit} />
      <MonthlyReview isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background-light dark:bg-[#09090b] gap-4">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">bolt</span>
        <p className="text-sm font-bold text-zinc-500 animate-pulse">Iniciando sistema...</p>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <LoginPage />;
};



const App: React.FC = () => {
  return (
    <IntegrationProvider>
      <AnalyticsManager />
      <NotificationProvider>
        <ErrorBoundary>
          {/* ToastContainer moved here to work globally */}
          <ToastContainer />
          <InstallPromptBanner />
          <AuthProvider>
            <TransactionsProvider>
              <ThemeProvider>
                <AuthGate />
              </ThemeProvider>
            </TransactionsProvider>
          </AuthProvider>
        </ErrorBoundary>
      </NotificationProvider>
    </IntegrationProvider>
  );
};

export default App;
