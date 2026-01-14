// Educational Missions Service - Progressive learning system

import { Mission, UserProfile, Transaction } from '../types';

export interface EducationalLevel {
    id: number;
    name: string;
    description: string;
    minXp: number;
    concepts: string[];
    unlocks: string[];
}

export const EDUCATIONAL_LEVELS: EducationalLevel[] = [
    {
        id: 0,
        name: 'Primeiro Dia',
        description: 'Aprenda o básico em 3 minutos',
        minXp: 0,
        concepts: ['Como registrar transações', 'Por que categorizar', 'Navegação básica'],
        unlocks: ['Dashboard', 'Transações']
    },
    {
        id: 1,
        name: 'Consciência',
        description: 'Entenda para onde vai seu dinheiro',
        minXp: 200,
        concepts: ['Hábito de registro', 'Padrões de gastos', 'Criação de metas'],
        unlocks: ['Metas', 'Gráficos', 'Categorias customizadas']
    },
    {
        id: 2,
        name: 'Controle',
        description: 'Aprenda a controlar seus gastos',
        minXp: 1000,
        concepts: ['Orçamento 50/30/20', 'Necessidade vs Desejo', 'Corte de gastos'],
        unlocks: ['Orçamentos', 'Alertas', 'Análises']
    },
    {
        id: 3,
        name: 'Reserva',
        description: 'Construa sua segurança financeira',
        minXp: 3000,
        concepts: ['Reserva de emergência', 'Regra dos 6 meses', 'Onde guardar'],
        unlocks: ['Investimentos', 'Simuladores', 'Projeções']
    },
    {
        id: 4,
        name: 'Investidor',
        description: 'Faça seu dinheiro trabalhar',
        minXp: 6000,
        concepts: ['Renda fixa vs variável', 'Juros compostos', 'Diversificação'],
        unlocks: ['Carteira', 'Análise avançada', 'Rebalanceamento']
    },
    {
        id: 5,
        name: 'Liberdade',
        description: 'Alcance independência financeira',
        minXp: 15000,
        concepts: ['Regra dos 4%', 'Renda passiva', 'Planejamento sucessório'],
        unlocks: ['Comunidade Premium', 'Consultoria', 'Ferramentas Pro']
    }
];

export const EducationalMissionsService = {
    /**
     * Get missions for specific level
     */
    getMissionsForLevel(level: number): Omit<Mission, 'isCompleted'>[] {
        switch (level) {
            case 0:
                return this.getLevel0Missions();
            case 1:
                return this.getLevel1Missions();
            case 2:
                return this.getLevel2Missions();
            case 3:
                return this.getLevel3Missions();
            case 4:
                return this.getLevel4Missions();
            case 5:
                return this.getLevel5Missions();
            default:
                return [];
        }
    },

    /**
     * Level 0: First Day (Tutorial)
     */
    getLevel0Missions(): Omit<Mission, 'isCompleted'>[] {
        return [
            {
                id: 'welcome',
                title: 'Bem-vindo ao FluxCash!',
                desc: 'Assista ao vídeo de boas-vindas (30s)',
                category: 'Tutorial',
                xp: 50,
                type: 'learning',
                icon: 'play_circle',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/10',
                textColor: 'text-blue-600 dark:text-blue-400',
                actionLabel: 'Assistir'
            },
            {
                id: 'first_transaction',
                title: 'Sua Primeira Transação',
                desc: 'Registre qualquer gasto. Pode ser o café da manhã!',
                category: 'Ação',
                xp: 100,
                type: 'habit',
                icon: 'add_circle',
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                textColor: 'text-emerald-600 dark:text-emerald-400',
                actionLabel: 'Adicionar'
            },
            {
                id: 'categorize',
                title: 'Categorize!',
                desc: 'Escolha a categoria correta. Isso ajuda você a ver padrões.',
                category: 'Tutorial',
                xp: 50,
                type: 'learning',
                icon: 'label',
                color: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50 dark:bg-purple-900/10',
                textColor: 'text-purple-600 dark:text-purple-400',
                actionLabel: 'Categorizar'
            }
        ];
    },

    /**
     * Level 1: Awareness (Week 1)
     */
    getLevel1Missions(): Omit<Mission, 'isCompleted'>[] {
        return [
            {
                id: 'streak_7',
                title: '7 Dias de Consciência',
                desc: 'Registre pelo menos 1 transação por dia durante 7 dias. Isso cria o hábito!',
                category: 'Hábito',
                xp: 500,
                type: 'habit',
                icon: 'local_fire_department',
                color: 'from-orange-500 to-orange-600',
                bg: 'bg-orange-50 dark:bg-orange-900/10',
                textColor: 'text-orange-600 dark:text-orange-400'
            },
            {
                id: 'view_chart',
                title: 'Onde Vai Meu Dinheiro?',
                desc: 'Veja o gráfico de distribuição de gastos. Surpreso com alguma categoria?',
                category: 'Aprendizado',
                xp: 100,
                type: 'learning',
                icon: 'pie_chart',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/10',
                textColor: 'text-blue-600 dark:text-blue-400',
                actionLabel: 'Ver Gráfico'
            },
            {
                id: 'first_goal',
                title: 'Primeira Meta',
                desc: 'Crie uma meta financeira. Pode ser pequena: R$ 100 para emergências.',
                category: 'Planejamento',
                xp: 200,
                type: 'saving',
                icon: 'flag',
                color: 'from-indigo-500 to-indigo-600',
                bg: 'bg-indigo-50 dark:bg-indigo-900/10',
                textColor: 'text-indigo-600 dark:text-indigo-400',
                actionLabel: 'Criar Meta'
            }
        ];
    },

    /**
     * Level 2: Control (Weeks 2-4)
     */
    getLevel2Missions(): Omit<Mission, 'isCompleted'>[] {
        return [
            {
                id: 'create_budget',
                title: 'Orçamento Básico',
                desc: 'Defina limite de gastos para 3 categorias principais. Regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança.',
                category: 'Controle',
                xp: 300,
                type: 'saving',
                icon: 'account_balance_wallet',
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                textColor: 'text-emerald-600 dark:text-emerald-400',
                actionLabel: 'Criar Orçamento'
            },
            {
                id: 'budget_alert',
                title: 'Alerta Vermelho',
                desc: 'Receba e reaja a um alerta de orçamento. Isso te protege de gastos excessivos!',
                category: 'Controle',
                xp: 200,
                type: 'security',
                icon: 'warning',
                color: 'from-amber-500 to-amber-600',
                bg: 'bg-amber-50 dark:bg-amber-900/10',
                textColor: 'text-amber-600 dark:text-amber-400'
            },
            {
                id: 'positive_balance',
                title: 'Saldo Positivo',
                desc: 'Termine o mês com saldo positivo. Essa é a lei fundamental da riqueza!',
                category: 'Conquista',
                xp: 1000,
                type: 'saving',
                icon: 'trending_up',
                color: 'from-green-500 to-green-600',
                bg: 'bg-green-50 dark:bg-green-900/10',
                textColor: 'text-green-600 dark:text-green-400'
            },
            {
                id: 'smart_cut',
                title: 'Corte Inteligente',
                desc: 'Reduza gastos em 1 categoria em 20%. Teste de 24h: espere antes de comprar!',
                category: 'Economia',
                xp: 500,
                type: 'saving',
                icon: 'content_cut',
                color: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50 dark:bg-purple-900/10',
                textColor: 'text-purple-600 dark:text-purple-400'
            }
        ];
    },

    /**
     * Level 3: Reserve (Months 2-3)
     */
    getLevel3Missions(): Omit<Mission, 'isCompleted'>[] {
        return [
            {
                id: 'save_100',
                title: 'Primeiro R$ 100',
                desc: 'Economize R$ 100. Esse é o começo da sua segurança financeira!',
                category: 'Poupança',
                xp: 500,
                type: 'saving',
                icon: 'savings',
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                textColor: 'text-emerald-600 dark:text-emerald-400'
            },
            {
                id: 'save_500',
                title: 'Primeiro R$ 500',
                desc: 'Economize R$ 500. Você já pode lidar com pequenas emergências!',
                category: 'Poupança',
                xp: 1000,
                type: 'saving',
                icon: 'account_balance',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/10',
                textColor: 'text-blue-600 dark:text-blue-400'
            },
            {
                id: 'emergency_fund',
                title: 'Reserva de 1 Mês',
                desc: 'Economize o equivalente a 1 mês de despesas. Meta: 6 meses!',
                category: 'Segurança',
                xp: 2000,
                type: 'security',
                icon: 'shield',
                color: 'from-indigo-500 to-indigo-600',
                bg: 'bg-indigo-50 dark:bg-indigo-900/10',
                textColor: 'text-indigo-600 dark:text-indigo-400'
            },
            {
                id: 'dont_touch',
                title: 'Não Toque!',
                desc: 'Mantenha sua reserva intacta por 30 dias. Ela é só para emergências!',
                category: 'Disciplina',
                xp: 1500,
                type: 'security',
                icon: 'lock',
                color: 'from-red-500 to-red-600',
                bg: 'bg-red-50 dark:bg-red-900/10',
                textColor: 'text-red-600 dark:text-red-400'
            }
        ];
    },

    /**
     * Level 4: Investor (Months 4-6)
     */
    getLevel4Missions(): Omit<Mission, 'isCompleted'>[] {
        return [
            {
                id: 'first_investment',
                title: 'Primeiro Investimento',
                desc: 'Faça sua primeira aplicação. Pode ser Tesouro Direto, CDB ou fundo!',
                category: 'Investimento',
                xp: 1000,
                type: 'investing',
                icon: 'trending_up',
                color: 'from-green-500 to-green-600',
                bg: 'bg-green-50 dark:bg-green-900/10',
                textColor: 'text-green-600 dark:text-green-400',
                actionLabel: 'Investir'
            },
            {
                id: 'diversify',
                title: 'Diversificação',
                desc: 'Tenha 2 tipos diferentes de investimentos. Não coloque todos os ovos na mesma cesta!',
                category: 'Estratégia',
                xp: 1500,
                type: 'investing',
                icon: 'donut_small',
                color: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50 dark:bg-purple-900/10',
                textColor: 'text-purple-600 dark:text-purple-400'
            },
            {
                id: 'invest_20',
                title: '20% da Renda',
                desc: 'Invista 20% da sua renda mensal. Pague-se primeiro!',
                category: 'Hábito',
                xp: 2000,
                type: 'investing',
                icon: 'percent',
                color: 'from-indigo-500 to-indigo-600',
                bg: 'bg-indigo-50 dark:bg-indigo-900/10',
                textColor: 'text-indigo-600 dark:text-indigo-400'
            },
            {
                id: 'compound_interest',
                title: 'Juros Compostos',
                desc: 'Mantenha investimento por 6 meses sem resgatar. Veja a mágica dos juros compostos!',
                category: 'Paciência',
                xp: 3000,
                type: 'investing',
                icon: 'auto_graph',
                color: 'from-amber-500 to-amber-600',
                bg: 'bg-amber-50 dark:bg-amber-900/10',
                textColor: 'text-amber-600 dark:text-amber-400'
            }
        ];
    },

    /**
     * Level 5: Freedom (Month 7+)
     */
    getLevel5Missions(): Omit<Mission, 'isCompleted'>[] {
        return [
            {
                id: 'passive_income',
                title: 'Renda Passiva',
                desc: 'Receba sua primeira renda de investimentos. Seu dinheiro está trabalhando!',
                category: 'Liberdade',
                xp: 5000,
                type: 'investing',
                icon: 'attach_money',
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/10',
                textColor: 'text-emerald-600 dark:text-emerald-400'
            },
            {
                id: 'positive_net_worth',
                title: 'Patrimônio Líquido Positivo',
                desc: 'Tenha mais ativos que dívidas. Você está no caminho certo!',
                category: 'Conquista',
                xp: 3000,
                type: 'security',
                icon: 'account_balance',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/10',
                textColor: 'text-blue-600 dark:text-blue-400'
            },
            {
                id: 'retirement_plan',
                title: 'Aposentadoria Planejada',
                desc: 'Calcule e planeje sua aposentadoria. Regra dos 4%: quanto você precisa?',
                category: 'Planejamento',
                xp: 2000,
                type: 'learning',
                icon: 'beach_access',
                color: 'from-orange-500 to-orange-600',
                bg: 'bg-orange-50 dark:bg-orange-900/10',
                textColor: 'text-orange-600 dark:text-orange-400',
                actionLabel: 'Calcular'
            },
            {
                id: 'millionaire',
                title: 'Milhão',
                desc: 'Alcance R$ 1 milhão em patrimônio. Liberdade financeira conquistada!',
                category: 'Lenda',
                xp: 10000,
                type: 'investing',
                icon: 'emoji_events',
                color: 'from-amber-500 to-amber-600',
                bg: 'bg-amber-50 dark:bg-amber-900/10',
                textColor: 'text-amber-600 dark:text-amber-400'
            }
        ];
    },

    /**
     * Get current level based on XP
     */
    getCurrentLevel(xp: number): EducationalLevel {
        for (let i = EDUCATIONAL_LEVELS.length - 1; i >= 0; i--) {
            if (xp >= EDUCATIONAL_LEVELS[i].minXp) {
                return EDUCATIONAL_LEVELS[i];
            }
        }
        return EDUCATIONAL_LEVELS[0];
    },

    /**
     * Get next level
     */
    getNextLevel(currentLevel: EducationalLevel): EducationalLevel | null {
        const currentIndex = EDUCATIONAL_LEVELS.findIndex(l => l.id === currentLevel.id);
        return EDUCATIONAL_LEVELS[currentIndex + 1] || null;
    },

    /**
     * Check if mission is completed
     */
    checkMissionCompletion(
        missionId: string,
        userProfile: UserProfile,
        transactions: Transaction[]
    ): boolean {
        // This will be implemented based on specific mission logic
        // For now, return false
        return false;
    },

    /**
     * Get educational content for level
     */
    getEducationalContent(level: number): { title: string; articles: string[]; videos: string[] } {
        const contents = {
            0: {
                title: 'Primeiros Passos',
                articles: [
                    'Por que registrar gastos funciona?',
                    'Como categorias ajudam você',
                    'Navegando no FluxCash'
                ],
                videos: [
                    'Tutorial: Sua primeira transação (30s)',
                    'Dica: Categorização automática (45s)'
                ]
            },
            1: {
                title: 'Consciência Financeira',
                articles: [
                    'O mito do café de R$ 5',
                    'Como criar uma meta realista',
                    'Psicologia dos pequenos gastos'
                ],
                videos: [
                    'Por que 7 dias importam? (60s)',
                    'Lendo seu gráfico de gastos (90s)'
                ]
            },
            2: {
                title: 'Controle de Gastos',
                articles: [
                    'Orçamento 50/30/20 explicado',
                    'Necessidade vs. Desejo: o teste de 24h',
                    'Como negociar dívidas',
                    '10 formas de cortar gastos sem sofrer'
                ],
                videos: [
                    'Criando seu primeiro orçamento (120s)',
                    'Alertas: seu escudo financeiro (60s)'
                ]
            },
            3: {
                title: 'Reserva de Emergência',
                articles: [
                    'Reserva de emergência: quanto e onde?',
                    'Regra dos 6 meses explicada',
                    'Erros comuns ao poupar',
                    'Onde NÃO guardar sua reserva'
                ],
                videos: [
                    'Por que reserva vem antes de investir? (90s)',
                    'Calculando sua reserva ideal (120s)'
                ]
            },
            4: {
                title: 'Investimentos',
                articles: [
                    'Investimentos para iniciantes',
                    'Renda fixa vs. variável',
                    'Como escolher corretora',
                    'Juros compostos: a 8ª maravilha',
                    'Diversificação: por que e como?'
                ],
                videos: [
                    'Seu primeiro investimento passo a passo (180s)',
                    'Simulador: quanto você terá em 10 anos? (90s)'
                ]
            },
            5: {
                title: 'Independência Financeira',
                articles: [
                    'Independência financeira (FIRE) explicada',
                    'Regra dos 4%: quanto você precisa?',
                    'Diversificação de portfólio avançada',
                    'Planejamento sucessório básico',
                    'Renda passiva: fontes e estratégias'
                ],
                videos: [
                    'Calculando seu número da liberdade (120s)',
                    'Histórias reais de FIRE no Brasil (300s)'
                ]
            }
        };

        return contents[level as keyof typeof contents] || contents[0];
    }
};
