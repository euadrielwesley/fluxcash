# 🚀 Guia de Deploy - FluxCash Dashboard

## Pré-requisitos

Antes de fazer o deploy, certifique-se de que:

- ✅ Node.js está instalado (v18+)
- ✅ Todas as dependências foram instaladas (`npm install`)
- ✅ O build local funciona (`npm run build`)
- ✅ Variáveis de ambiente estão configuradas

---

## 📋 Checklist Pré-Deploy

### 1. Instalar Dependências

```bash
npm install
```

### 2. Testar Localmente

```bash
# Modo desenvolvimento
npm run dev

# Build de produção
npm run build
npm run preview
```

### 3. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
GEMINI_API_KEY=sua_chave_aqui
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon
```

---

## 🌐 Deploy na Vercel (Recomendado)

### Método 1: Via GitHub (Automático)

1. **Faça push para o GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/fluxcash-dashboard.git
   git push -u origin main
   ```

2. **Conecte ao Vercel**:
   - Acesse [vercel.com](https://vercel.com/)
   - Clique em "New Project"
   - Importe o repositório do GitHub
   - Vercel detectará automaticamente Vite

3. **Configure Variáveis de Ambiente**:
   - Em "Environment Variables", adicione:
     - `GEMINI_API_KEY`
     - `REACT_APP_SUPABASE_URL`
     - `REACT_APP_SUPABASE_ANON_KEY`

4. **Deploy**:
   - Clique em "Deploy"
   - Aguarde o build (2-3 minutos)
   - Acesse a URL gerada!

### Método 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod
```

---

## 🔧 Deploy em Outras Plataformas

### Netlify

1. **Conecte o repositório**:
   - Acesse [netlify.com](https://netlify.com/)
   - "New site from Git"
   - Conecte o GitHub

2. **Configurações de Build**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Variáveis de Ambiente**:
   - Adicione as mesmas do Vercel

4. **Deploy**!

### GitHub Pages

```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Adicionar ao package.json:
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

**Nota**: Configure `base` no `vite.config.ts`:
```ts
export default defineConfig({
  base: '/fluxcash-dashboard/',
  // ...
})
```

---

## 🗄️ Configurar Supabase (Opcional)

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com/)
2. Crie um novo projeto
3. Copie a URL e Anon Key

### 2. Criar Tabelas

Execute no SQL Editor:

```sql
-- Tabela de perfis
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  profession TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  account TEXT,
  date_iso TIMESTAMP,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);
```

### 3. Configurar Autenticação

- Habilite "Email" em Authentication > Providers
- Configure redirect URLs (opcional)

---

## 🔐 Segurança

### Variáveis de Ambiente

**NUNCA** commite `.env` ou `.env.local`!

Sempre use variáveis de ambiente para:
- API Keys
- Credenciais de banco
- Tokens secretos

### Headers de Segurança

O `vercel.json` já inclui:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 📊 Monitoramento

### Vercel Analytics

Habilite em: Project Settings > Analytics

### Sentry (Opcional)

```bash
npm install @sentry/react

# Configure em src/index.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE
});
```

---

## 🐛 Troubleshooting

### Build Falha

```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build
```

### Service Worker Não Atualiza

- Force refresh: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
- Desregistre o SW: DevTools > Application > Service Workers > Unregister

### Variáveis de Ambiente Não Funcionam

- Certifique-se de que começam com `VITE_` ou `REACT_APP_`
- Reinicie o servidor de desenvolvimento
- No Vercel, redeploy após adicionar variáveis

---

## ✅ Pós-Deploy

1. **Teste a aplicação**:
   - Navegue por todas as páginas
   - Teste PWA (instalar)
   - Verifique offline mode

2. **Configure domínio customizado** (opcional):
   - Vercel: Project Settings > Domains
   - Adicione seu domínio
   - Configure DNS

3. **Monitore performance**:
   - Lighthouse audit
   - Vercel Analytics
   - Core Web Vitals

---

## 🎉 Pronto!

Sua aplicação está no ar! 🚀

**URL de Exemplo**: https://fluxcash-dashboard.vercel.app

Compartilhe com o mundo! 🌍
