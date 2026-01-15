
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from './TransactionsContext';

interface Step {
  targetId?: string;
  title: string;
  content: string;
  position: 'center' | 'bottom' | 'top' | 'right-start';
}

const STEPS: Step[] = [
  {
    title: 'Bem-vindo ao FluxCash! 🚀',
    content: 'Seu painel financeiro inteligente está pronto. Vamos fazer um tour rápido para você dominar suas finanças.',
    position: 'center'
  },
  {
    targetId: 'balance-card',
    title: 'Seu Radar Financeiro',
    content: 'Aqui você vê seu saldo real. O "Diário Seguro" te diz quanto você pode gastar hoje sem comprometer suas contas fixas.',
    position: 'bottom'
  },
  {
    targetId: 'quick-add-btn',
    title: 'Registre Tudo Rápido',
    content: 'Clique aqui para adicionar gastos, rendas ou escanear notas fiscais. Use nossa IA para categorizar tudo automaticamente.',
    position: 'right-start'
  },
  {
    targetId: 'sidebar-menu',
    title: 'Navegação Completa',
    content: 'Acesse seus relatórios, carteira de investimentos e a central de gamificação por aqui.',
    position: 'right-start'
  },
  {
    title: 'Tudo Pronto!',
    content: 'Você já ganhou 50 XP só por começar. Continue registrando para subir de nível!',
    position: 'center'
  }
];

const OnboardingTour: React.FC = () => {
  const { userProfile, completeOnboarding, grantXP } = useTransactions();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // REDUNDANT CHECK: If persistent flag exists in localStorage, do NOT show
    const localSeen = localStorage.getItem('flux_onboarding_seen');
    if (localSeen === 'true') {
      setIsVisible(false);
      return;
    }

    // Check if user is loaded and hasn't seen onboarding yet based on DB profile
    if (userProfile && userProfile.email) {
      // Se o DB diz que não viu (hasOnboarding === false), mostramos.
      if (userProfile.hasOnboarding === false) {
        setIsVisible(true);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (!isVisible) return;

    if (isMobile) {
      setSpotlightStyle({ opacity: 0 });
      return;
    }

    const step = STEPS[currentStep];
    if (step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlightStyle({
          top: rect.top - 10,
          left: rect.left - 10,
          width: rect.width + 20,
          height: rect.height + 20,
          opacity: 1
        });
        return;
      }
    }
    setSpotlightStyle({ opacity: 0 });

  }, [currentStep, isVisible, isMobile]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Persistência Redundante (Local)
    localStorage.setItem('flux_onboarding_seen', 'true');
    // Atualiza no banco de dados para nunca mais mostrar
    completeOnboarding();
    // Garante o XP de boas-vindas
    grantXP(50, 'Boas-vindas');
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const isCenter = step.position === 'center' || !step.targetId;

  const modalStyle: React.CSSProperties = isMobile
    ? { bottom: '20px', left: '16px', right: '16px', position: 'fixed' }
    : (!isCenter && step.targetId && spotlightStyle.opacity !== 0)
      ? {
        position: 'absolute',
        top: (spotlightStyle.top as number) + (spotlightStyle.height as number) + 20,
        left: (spotlightStyle.left as number),
      }
      : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-slate-900/80 transition-colors duration-500 pointer-events-auto">
        {!isMobile && step.targetId && (
          <div
            className="absolute bg-transparent shadow-[0_0_0_9999px_rgba(15,23,42,0.8)] rounded-2xl transition-all duration-500 ease-in-out border-2 border-white/50 animate-pulse"
            style={spotlightStyle}
          />
        )}
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`pointer-events-auto bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm mx-auto`}
          style={modalStyle}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Passo {currentStep + 1} de {STEPS.length}
            </span>
            <button onClick={handleSkip} className="text-xs font-bold text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Pular
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-300 leading-relaxed">
              {step.content}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-1.5">
              {STEPS.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-zinc-200 dark:bg-zinc-700'}`} />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              {currentStep === STEPS.length - 1 ? (
                <>Começar <span className="material-symbols-outlined text-[16px]">rocket_launch</span></>
              ) : (
                <>Próximo <span className="material-symbols-outlined text-[16px]">arrow_forward</span></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTour;
