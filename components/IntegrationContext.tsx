
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IntegrationMap, IntegrationConfig } from '../types';
import { api } from '../services/api';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<IntegrationMap>(DEFAULT_INTEGRATIONS);
  const [isVaultLocked, setIsVaultLocked] = useState(false); // Backend controla isso agora
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load Integrations from User Profile (Source of Truth)
  useEffect(() => {
    if (user?.integrations) {
      setIntegrations(user.integrations);
      setIsLoading(false);
    } else {
      // Fallback or empty state
      setIsLoading(false);
    }
  }, [user]);

  // 2. Secure Cloud Update
  const updateIntegration = async (serviceId: string, data: Partial<IntegrationConfig>) => {
    if (!user) return;

    // A. Optimistic Update (UI Instantânea)
    const prevIntegrations = { ...integrations };

    const current = integrations[serviceId] || { id: serviceId, enabled: false, credentials: {} };
    const newCredentials = data.credentials ? { ...current.credentials, ...data.credentials } : current.credentials;

    const updatedConfig: IntegrationConfig = {
      ...current,
      ...data,
      credentials: newCredentials,
      lastSyncedAt: Date.now()
    };

    const newState = { ...integrations, [serviceId]: updatedConfig };
    setIntegrations(newState);

    // B. Cloud Persistence (Background)
    try {
      // Update local storage backup strictly for offline redundancy
      localStorage.setItem(`flux_integrations_${user.id}`, JSON.stringify(newState));

      // Push to Supabase 'profiles' table
      const { error } = await supabase
        .from('profiles')
        .update({ integrations_enc: newState })
        .eq('id', user.id);

      if (error) throw error;

    } catch (error) {
      console.error('Failed to sync integrations to cloud:', error);
      // Rollback UI on critical failure
      setIntegrations(prevIntegrations);
      alert('Falha ao salvar na nuvem. Verifique sua conexão.');
    }
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
