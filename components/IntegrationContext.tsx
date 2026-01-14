
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IntegrationMap, IntegrationConfig } from '../types';
import { api } from '../services/api';

interface IntegrationContextType {
  integrations: IntegrationMap;
  updateIntegration: (serviceId: string, data: Partial<IntegrationConfig>) => Promise<void>;
  getIntegrationKey: (serviceId: string, keyName: string) => string | null;
  isVaultLocked: boolean;
  checkVaultIntegrity: () => boolean;
  isLoading: boolean;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

// Em produção, isso viria da API
const DEFAULT_INTEGRATIONS: IntegrationMap = {};

export const IntegrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [integrations, setIntegrations] = useState<IntegrationMap>(DEFAULT_INTEGRATIONS);
  const [isVaultLocked, setIsVaultLocked] = useState(false); // Backend controla isso agora
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load Integrations from "Backend" (Mocked via API Service layer)
  useEffect(() => {
    const loadIntegrations = async () => {
      setIsLoading(true);
      try {
        // Simulation: In real app, perform api.get('/integrations')
        // We load from localStorage just to maintain state in this demo without backend
        const stored = localStorage.getItem('flux_integrations_config');
        if (stored) {
          setIntegrations(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load integrations", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadIntegrations();
  }, []);

  // 2. Secure Update (Simulation)
  // No mundo real, enviamos as credenciais para o backend criptografar e salvar.
  // O backend nunca retorna a chave completa (ex: sk-....), apenas mascarada (sk-***).
  const updateIntegration = async (serviceId: string, data: Partial<IntegrationConfig>) => {
    // Optimistic Update
    setIntegrations(prev => {
      const current = prev[serviceId] || { id: serviceId, enabled: false, credentials: {} };
      
      const newCredentials = data.credentials 
        ? { ...current.credentials, ...data.credentials } 
        : current.credentials;

      const updatedConfig: IntegrationConfig = {
        ...current,
        ...data,
        credentials: newCredentials,
        lastSyncedAt: Date.now()
      };

      const newState = { ...prev, [serviceId]: updatedConfig };
      
      // Persist (Mock Backend)
      localStorage.setItem('flux_integrations_config', JSON.stringify(newState));
      return newState;
    });

    // Em um app real: await api.put(`/integrations/${serviceId}`, data);
  };

  // 3. Key Retrieval
  // Nota de Auditoria: Em um app seguro, o frontend NUNCA deve precisar ler a chave privada (API Key)
  // para fazer a chamada. O Frontend deve chamar seu próprio Backend, que usa a chave para chamar a API externa.
  // Exceção: Firebase/Supabase (Anon Keys) ou quando o user quer rodar Local AI.
  const getIntegrationKey = (serviceId: string, keyName: string): string | null => {
    const service = integrations[serviceId];
    if (!service || !service.enabled) return null;
    return service.credentials[keyName] || null;
  };

  // Mock Integrity Check
  const checkVaultIntegrity = (): boolean => {
    return true; // Assumimos que o backend cuida disso
  };

  return (
    <IntegrationContext.Provider value={{
      integrations,
      updateIntegration,
      getIntegrationKey,
      isVaultLocked,
      checkVaultIntegrity,
      isLoading
    }}>
      {children}
    </IntegrationContext.Provider>
  );
};

export const useIntegration = () => {
  const context = useContext(IntegrationContext);
  if (context === undefined) throw new Error('useIntegration must be used within a IntegrationProvider');
  return context;
};
