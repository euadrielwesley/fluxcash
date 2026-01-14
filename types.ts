
export interface Transaction {
  id: string;
  title: string;
  category: string;
  account: string;
  amount: number;
  type: 'income' | 'expense';
  icon: string;
  colorClass: string;
  logoUrl?: string;
  isRecurring?: boolean;
  installment?: string;
  dateIso?: string;
  notes?: string;
  tags?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TransactionGroup {
  date: string;
  total: number;
  items: Transaction[];
}

export interface CategoryData {
  name: string;
  percentage: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  entradas: number;
  saidas: number;
}

export interface WeeklyData {
  day: string;
  value: number;
  isMain?: boolean;
}

export interface Story {
  id: string;
  label: string;
  img?: string;
  icon?: string;
  color?: string;
  ring: string;
  viewed: boolean;
  content: {
    title: string;
    value: string;
    desc: string;
    bgGradient: string;
  };
}

export interface CreditCard {
  id: string;
  name: string;
  brand: 'mastercard' | 'visa' | 'elo';
  color: string;
  limit: number;
  bill: number;
  dueDate: string;
  lastDigits: string;
}

export interface Debt {
  id: number | string;
  name: string;
  bank: string;
  total_installments: number;
  paid_installments: number;
  original_debt: number;
  current_balance: number;
  value_parcel: number;
  color: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
  color: string;
}

export interface UserPlan {
  name: 'Free' | 'Obsidian Pro';
  status: 'active' | 'canceled' | 'past_due';
  renewalDate: string;
  price: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl: string;
  xp: number;
  level: number;
  profession: string;
  plan: UserPlan;
  hasOnboarding: boolean;
}

export interface Mission {
  id: string;
  title: string;
  desc: string;
  category: string; // Ex: 'Hábito', 'Defesa', 'Ataque'
  xp: number;
  type: 'habit' | 'saving' | 'investing' | 'learning' | 'security';
  icon: string;
  color: string;     // Gradient classes
  bg: string;        // Background classes
  textColor: string; // Text color classes
  isCompleted: boolean;
  actionLabel?: string;
}

export interface AIRule {
  id: string;
  keyword: string;
  category: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'financial' | 'gamification' | 'system' | 'security';
  timestamp: number;
  read: boolean;
}

export type IntegrationCategory = 'intelligence' | 'analytics' | 'automation' | 'data' | 'sync';

export interface IntegrationConfig {
  id: string;
  enabled: boolean;
  credentials: Record<string, string>;
  settings?: Record<string, any>;
  lastSyncedAt?: number;
}

export type IntegrationMap = Record<string, IntegrationConfig>;

export type ViewType = 'dashboard' | 'gamification' | 'transactions' | 'wallet' | 'analytics' | 'settings' | 'expenses' | 'income' | 'integrations';

export type DiagnosticStatus = 'idle' | 'running' | 'success' | 'warning' | 'error';

export interface DiagnosticResult {
  id: string;
  label: string;
  status: DiagnosticStatus;
  latency?: number;
  message?: string;
  fixAction?: string;
}

// Budget System
export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'daily';
  alertThreshold: number; // Percentage (e.g., 80 for 80%)
  color: string;
}

// Recurrence System
export interface Recurrence {
  id: string;
  transactionId?: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number; // For monthly (1-31)
  dayOfWeek?: number; // For weekly (0-6)
  startDate: string;
  endDate?: string;
  lastCreated?: string;
  isActive: boolean;
  isSubscription?: boolean;
  icon: string;
  colorClass: string;
}

// Multi-Account System
export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash' | 'other';
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Currency {
  code: string; // USD, BRL, EUR
  symbol: string; // $, R$, €
  name: string;
  exchangeRate: number; // Relative to base currency (BRL)
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  notes?: string;
}

// Collaborative Mode
export interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  lastActive: string;
}

export interface Permission {
  canAddTransaction: boolean;
  canEditTransaction: boolean;
  canDeleteTransaction: boolean;
  canManageBudgets: boolean;
  canManageMembers: boolean;
  canExportData: boolean;
  canViewReports: boolean;
  requiresApprovalAbove?: number; // Amount threshold
}

export interface ApprovalRequest {
  id: string;
  transactionId: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

// Gamification System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'economic' | 'consistency' | 'goals' | 'progress' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export interface Streak {
  type: 'login' | 'transaction' | 'savings' | 'goal';
  currentDays: number;
  longestDays: number;
  multiplier: number;
  lastActivityDate: string;
  freezesAvailable: number;
}

export interface WeeklyChallenge {
  id: string;
  week: string; // ISO week (2026-W03)
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  xpReward: number;
  isCompleted: boolean;
  progress: {
    current: number;
    total: number;
  };
  expiresAt: string;
  icon: string;
  color: string;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  type: 'xp_boost' | 'shield' | 'refresh' | 'vision' | 'loot_box';
  duration?: number; // milliseconds
  cost: number; // XP
  rarity: 'common' | 'rare' | 'epic';
  icon: string;
  activatedAt?: string;
  expiresAt?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: 'cashback' | 'voucher' | 'content' | 'physical' | 'upgrade';
  xpCost: number;
  value: number; // R$
  imageUrl: string;
  stock?: number;
  expiresAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl: string;
  rank: number;
  score: number;
  metric: 'xp' | 'streak' | 'savings' | 'goals' | 'badges';
  period: 'weekly' | 'monthly' | 'all-time';
}
