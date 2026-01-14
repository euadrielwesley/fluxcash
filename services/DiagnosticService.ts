
import { DiagnosticResult, IntegrationMap } from '../types';
import { createClient } from '@supabase/supabase-js';

export const DiagnosticService = {
  
  async runTests(
    integrations: IntegrationMap, 
    verifyVault: () => boolean
  ): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // 1. Internet / Connectivity
    const internetResult = await this.checkInternet();
    results.push(internetResult);

    // 2. Storage Health
    const storageResult = this.checkStorage();
    results.push(storageResult);

    // 3. Vault Integrity
    const vaultResult = this.checkVault(verifyVault);
    results.push(vaultResult);

    // 4. Supabase (Database)
    const supabaseConfig = integrations['supabase'];
    if (supabaseConfig && supabaseConfig.enabled) {
      const sbResult = await this.checkSupabase(
        supabaseConfig.credentials['url'], 
        supabaseConfig.credentials['anonKey']
      );
      results.push(sbResult);
    } else {
      results.push({ id: 'supabase', label: 'Supabase DB', status: 'idle', message: 'Não configurado' });
    }

    // 5. OpenAI Check (If configured)
    const openaiConfig = integrations['openai'];
    if (openaiConfig && openaiConfig.enabled) {
      const llmResult = await this.checkOpenAI(openaiConfig.credentials['apiKey']);
      results.push(llmResult);
    } else {
        results.push({ id: 'openai', label: 'OpenAI API', status: 'idle', message: 'Habilite para testar.' });
    }

    // 6. Ollama Check (If configured)
    const ollamaConfig = integrations['ollama'];
    if (ollamaConfig && ollamaConfig.enabled) {
        const url = ollamaConfig.credentials['baseUrl'] || 'http://localhost:11434';
        const ollamaResult = await this.checkOllama(url);
        results.push(ollamaResult);
    } else {
        results.push({ id: 'ollama', label: 'Local AI', status: 'idle', message: 'Habilite para testar.' });
    }

    return results;
  },

  async checkInternet(): Promise<DiagnosticResult> {
    const start = performance.now();
    try {
      // Fetching a reliable CDN resource with no-cors to avoid CORS errors just to check network reachability
      // We use a small image or known public API endpoint
      const response = await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-cache' });
      const end = performance.now();
      
      // Note: with no-cors we can't check response.ok, but if it didn't throw, we have internet.
      return {
        id: 'internet',
        label: 'Internet',
        status: 'success',
        latency: Math.round(end - start),
        message: 'Online'
      };
    } catch (error) {
      return {
        id: 'internet',
        label: 'Internet',
        status: 'error',
        message: 'Offline',
        fixAction: 'Verifique sua conexão Wi-Fi.'
      };
    }
  },

  checkStorage(): DiagnosticResult {
    try {
      let total = 0;
      for (let x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
          total += (localStorage[x].length * 2); 
        }
      }
      
      const totalMB = (total / 1024 / 1024).toFixed(2);
      const isWarning = total > 4.5 * 1024 * 1024; // > 4.5MB

      return {
        id: 'storage',
        label: 'Local Storage',
        status: isWarning ? 'warning' : 'success',
        message: `${totalMB} MB usados`,
        fixAction: isWarning ? 'Storage quase cheio. Exporte e limpe dados.' : undefined
      };
    } catch (e) {
      return { id: 'storage', label: 'Local Storage', status: 'error', message: 'Inacessível' };
    }
  },

  checkVault(verifier: () => boolean): DiagnosticResult {
    const isValid = verifier();
    return {
      id: 'vault',
      label: 'Cofre AES',
      status: isValid ? 'success' : 'error',
      message: isValid ? 'Integridade OK' : 'Corrompido',
      fixAction: isValid ? undefined : 'Tente redefinir suas chaves.'
    };
  },

  async checkSupabase(url?: string, key?: string): Promise<DiagnosticResult> {
    if (!url || !key) {
      return { id: 'supabase', label: 'Supabase DB', status: 'error', message: 'Configuração Incompleta' };
    }

    const start = performance.now();
    try {
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      // Lightweight HEAD request to check connectivity and auth
      // We try to access 'profiles' table. 
      const { count, error, status } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const end = performance.now();
      const latency = Math.round(end - start);

      if (error) {
        // Handle specific Supabase/Postgres errors
        if (error.code === '42P01') {
           // Undefined Table - means we connected, but table is missing. Techincally SUCCESS connectivity.
           return {
             id: 'supabase',
             label: 'Supabase DB',
             status: 'warning',
             latency,
             message: 'Conectado (Sem tabela)',
             fixAction: 'Crie a tabela "profiles" no banco.'
           };
        }
        if (status === 401 || error.message.includes('JWT')) {
           return {
             id: 'supabase',
             label: 'Supabase DB',
             status: 'error',
             message: 'Erro 401: Chave Inválida',
             fixAction: 'Verifique se a Anon Key está correta.'
           };
        }
        throw error; // Other errors
      }

      return {
        id: 'supabase',
        label: 'Supabase DB',
        status: 'success',
        latency,
        message: 'Operacional'
      };

    } catch (error: any) {
      console.error(error);
      const isNetwork = error.message && (error.message.includes('fetch') || error.message.includes('network'));
      
      return {
        id: 'supabase',
        label: 'Supabase DB',
        status: 'error',
        message: isNetwork ? 'Falha de Rede' : 'Erro Desconhecido',
        fixAction: isNetwork ? 'Verifique a URL do projeto Supabase.' : 'Verifique o console para detalhes.'
      };
    }
  },

  async checkOpenAI(apiKey?: string): Promise<DiagnosticResult> {
    if (!apiKey || apiKey.length < 10) {
        return { id: 'openai', label: 'OpenAI API', status: 'error', message: 'Chave Inválida' };
    }

    const start = performance.now();
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const end = performance.now();

      if (response.status === 401) {
        return { 
            id: 'openai', 
            label: 'OpenAI API', 
            status: 'error', 
            message: 'Erro 401', 
            fixAction: 'Chave expirada ou incorreta.' 
        };
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return {
        id: 'openai',
        label: 'OpenAI API',
        status: 'success',
        latency: Math.round(end - start),
        message: 'Autenticado'
      };
    } catch (error) {
      return {
        id: 'openai',
        label: 'OpenAI API',
        status: 'error',
        message: 'Erro Conexão',
        fixAction: 'Verifique status.openai.com'
      };
    }
  },

  async checkOllama(baseUrl: string): Promise<DiagnosticResult> {
    const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const target = `${cleanUrl}/api/tags`;
    
    const start = performance.now();
    try {
      const response = await fetch(target, { method: 'GET' });
      const end = performance.now();

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return {
        id: 'ollama',
        label: 'Local AI',
        status: 'success',
        latency: Math.round(end - start),
        message: 'Online'
      };
    } catch (error: any) {
      const isCorsOrRefused = error.message.includes('Failed to fetch') || error.name === 'TypeError';
      
      return {
        id: 'ollama',
        label: 'Local AI',
        status: 'error',
        message: 'Falha Conexão',
        fixAction: isCorsOrRefused 
            ? 'Rode: OLLAMA_ORIGINS="*" ollama serve' 
            : 'O servidor local está rodando?'
      };
    }
  }
};
