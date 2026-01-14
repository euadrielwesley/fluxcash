// Supabase Connection Test Service

import { supabase } from './supabase';

export interface SupabaseTestResult {
    isConnected: boolean;
    latency: number;
    error?: string;
    details: {
        canRead: boolean;
        canWrite: boolean;
        authWorking: boolean;
    };
}

export const SupabaseTestService = {
    /**
     * Test complete Supabase connection
     */
    async testConnection(): Promise<SupabaseTestResult> {
        const startTime = Date.now();

        try {
            // Test 1: Basic connection
            const { data, error } = await supabase
                .from('profiles')
                .select('count')
                .limit(1);

            const latency = Date.now() - startTime;

            if (error) {
                // Table might not exist, but connection works
                if (error.message.includes('relation') || error.message.includes('does not exist')) {
                    return {
                        isConnected: true,
                        latency,
                        error: 'Tabelas não criadas ainda. Execute o SQL de setup.',
                        details: {
                            canRead: false,
                            canWrite: false,
                            authWorking: false
                        }
                    };
                }

                throw error;
            }

            // Test 2: Auth
            const { data: session } = await supabase.auth.getSession();
            const authWorking = session !== null;

            return {
                isConnected: true,
                latency,
                details: {
                    canRead: true,
                    canWrite: false, // Would need to test insert
                    authWorking
                }
            };

        } catch (error: any) {
            return {
                isConnected: false,
                latency: Date.now() - startTime,
                error: error.message || 'Erro desconhecido',
                details: {
                    canRead: false,
                    canWrite: false,
                    authWorking: false
                }
            };
        }
    },

    /**
     * Test if tables exist
     */
    async checkTables(): Promise<{ [key: string]: boolean }> {
        const tables = ['profiles', 'transactions', 'achievements', 'streaks', 'weekly_challenges'];
        const results: { [key: string]: boolean } = {};

        for (const table of tables) {
            try {
                const { error } = await supabase
                    .from(table)
                    .select('count')
                    .limit(1);

                results[table] = !error;
            } catch {
                results[table] = false;
            }
        }

        return results;
    },

    /**
     * Get setup SQL for creating tables
     */
    getSetupSQL(): string {
        return `
-- FluxCash Database Setup
-- Execute este SQL no Supabase SQL Editor

-- 1. Tabela de Perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  profession TEXT,
  income_range TEXT,
  experience_level TEXT,
  main_goal TEXT,
  current_situation TEXT,
  lifestyle TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  account TEXT DEFAULT 'principal',
  date_iso TIMESTAMP,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de Conquistas
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress JSONB
);

-- 4. Tabela de Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  current_days INTEGER DEFAULT 0,
  longest_days INTEGER DEFAULT 0,
  multiplier NUMERIC DEFAULT 1,
  last_activity_date DATE,
  freezes_available INTEGER DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabela de Desafios Semanais
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  progress JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de Segurança (RLS Policies)
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streaks
CREATE POLICY "Users can view own streaks" ON streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON streaks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weekly Challenges
CREATE POLICY "Users can view own challenges" ON weekly_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON weekly_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON weekly_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. Índices para Performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date_iso);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON weekly_challenges(user_id);

-- Pronto! Tabelas criadas com sucesso.
`;
    }
};
