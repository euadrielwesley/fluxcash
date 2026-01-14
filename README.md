# 💰 FluxCash Dashboard

<div align="center">
  <img src="./public/icons/icon-512x512.png" alt="FluxCash Logo" width="120" />
  
  <p><strong>Gestão financeira inteligente com gamificação e IA</strong></p>
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/fluxcash-dashboard)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
</div>

---

## ✨ Funcionalidades

### 📊 Dashboard Inteligente
- Visualização de saldo em tempo real
- Gráficos interativos de fluxo de caixa
- Alertas financeiros inteligentes
- Stories estilo Instagram com resumos

### 💳 Gestão Completa
- **Transações**: Adicione, edite e categorize receitas e despesas
- **Cartões**: Gerencie múltiplos cartões de crédito
- **Metas**: Defina e acompanhe objetivos financeiros
- **Dívidas**: Controle parcelas e simule quitações

### 📈 Analytics Avançado
- Gráficos de tendência e comparação
- Exportação de relatórios em PDF
- Métricas calculadas automaticamente
- Projeções de fim de mês

### 🎮 Gamificação
- Sistema de XP e níveis (Faixas de Kung Fu Financeiro)
- Missões diárias e semanais
- Conquistas e badges
- Ranking de progresso

### 🤖 Inteligência Artificial
- Categorização automática de transações
- Suporte a OpenAI, Ollama e LocalAI
- Regras customizáveis de IA
- Insights financeiros inteligentes

### 🔄 Sincronização e Backup
- Backup automático a cada 5 minutos
- Versionamento (últimas 5 versões)
- Export/Import de dados (JSON)
- Sincronização com Supabase (opcional)

### 📱 PWA (Progressive Web App)
- Instalável em mobile e desktop
- Funcionamento offline
- Notificações push
- Atualização automática

### 🔐 Segurança
- Criptografia AES para dados sensíveis
- Modo privacidade (oculta valores)
- Autenticação via Supabase
- Diagnóstico de integridade do sistema

---

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Conta Supabase** (opcional, para sincronização) ([Criar conta](https://supabase.com/))
- **API Key** OpenAI ou Ollama (opcional, para IA)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/fluxcash-dashboard.git
cd fluxcash-dashboard

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves
```

### Configuração

Edite `.env.local`:

```env
# Gemini API (opcional)
GEMINI_API_KEY=sua_chave_gemini

# Supabase (opcional, para sincronização em nuvem)
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon
```

### Executar Localmente

```bash
# Modo desenvolvimento
npm run dev

# Acesse: http://localhost:5173
```

### Build de Produção

```bash
# Gerar build otimizado
npm run build

# Preview do build
npm run preview
```

---

## 📦 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Acesse [Vercel](https://vercel.com/)
3. Importe o repositório
4. Configure as variáveis de ambiente
5. Deploy! 🎉

### Outras Plataformas

- **Netlify**: Funciona out-of-the-box
- **GitHub Pages**: Requer configuração de SPA routing
- **Docker**: Dockerfile incluído (em breve)

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations

### Visualização
- **Recharts** - Gráficos interativos
- **Apache ECharts** - Gráficos avançados (em breve)

### Backend & Integrações
- **Supabase** - Database + Auth + Storage
- **OpenAI/Ollama** - IA (opcional)
- **Crypto-JS** - Criptografia

### PWA
- **Service Worker** - Cache e offline
- **Web App Manifest** - Instalação

---

## 📖 Documentação

### Estrutura do Projeto

```
fluxcash-dashboard/
├── public/              # Assets estáticos
│   ├── icons/          # Ícones PWA
│   ├── manifest.json   # PWA Manifest
│   └── sw.js           # Service Worker
├── src/
│   ├── components/     # 34+ componentes React
│   ├── services/       # Serviços (API, Backup, etc)
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilitários
│   ├── types.ts        # TypeScript types
│   ├── App.tsx         # Componente raiz
│   └── index.tsx       # Entry point
├── package.json
├── vite.config.ts
├── vercel.json         # Configuração Vercel
└── README.md
```

### Principais Componentes

- **App.tsx**: Roteamento e providers
- **TransactionsContext.tsx**: Estado global de transações
- **AuthContext.tsx**: Autenticação
- **BackupService.ts**: Sistema de backup
- **CSVParser.ts**: Importação de extratos

### Contextos (State Management)

```
IntegrationProvider
  └─ NotificationProvider
     └─ AuthProvider
        └─ TransactionsProvider
           └─ ThemeProvider
```

---

## 🎯 Roadmap

### ✅ Implementado
- [x] Dashboard com visualizações
- [x] Gestão de transações
- [x] Gamificação completa
- [x] PWA com offline
- [x] Backup automático
- [x] Integrações de IA
- [x] Tema dark/light

### 🚧 Em Desenvolvimento
- [ ] Importação de extratos bancários
- [ ] Sistema de orçamento por categoria
- [ ] Recorrências inteligentes
- [ ] Gráficos avançados (ECharts)
- [ ] Multi-conta e multi-moeda
- [ ] Testes automatizados
- [ ] Modo colaborativo (família/casal)

### 🔮 Futuro
- [ ] Integração com Open Banking
- [ ] App mobile nativo (React Native)
- [ ] Previsões com Machine Learning
- [ ] Marketplace de integrações

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 💬 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/fluxcash-dashboard/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/fluxcash-dashboard/discussions)
- **Email**: suporte@fluxcash.app

---

## 🙏 Agradecimentos

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)

---

<div align="center">
  <p>Feito com ❤️ por <a href="https://github.com/seu-usuario">Seu Nome</a></p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>
