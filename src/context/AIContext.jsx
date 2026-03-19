import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { createProvider, getAvailableProviders, getProviderMeta } from '../providers/AIProviderFactory';

const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [providerId, setProviderId] = useState(() => localStorage.getItem('ai_provider') || 'gemini');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_apikey') || '');

  const providerInstance = useMemo(() => {
    if (!apiKey) return null;
    try {
      return createProvider(providerId, apiKey);
    } catch {
      return null;
    }
  }, [providerId, apiKey]);

  const providers = useMemo(() => getAvailableProviders(), []);
  const currentMeta = useMemo(() => getProviderMeta(providerId), [providerId]);

  const saveSettings = useCallback((newProviderId, newApiKey) => {
    setProviderId(newProviderId);
    setApiKey(newApiKey);
    localStorage.setItem('ai_provider', newProviderId);
    localStorage.setItem('ai_apikey', newApiKey);
  }, []);

  /**
   * Unified AI call function
   * @param {string} systemPrompt
   * @param {Array} contents - [{ type: 'text'|'image'|'pdf'|'word', data: string, mimeType?: string }]
   * @param {Object} options - { requireJson: boolean }
   * @returns {Promise<string>}
   */
  const callAI = useCallback(async (systemPrompt, contents = [], options = {}) => {
    if (!providerInstance) {
      throw new Error('API_KEY_MISSING');
    }
    return providerInstance.sendMessage(systemPrompt, contents, options);
  }, [providerInstance]);

  const value = {
    providerId,
    apiKey,
    providers,
    currentMeta,
    providerInstance,
    isReady: !!providerInstance,
    saveSettings,
    callAI,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within <AIProvider>');
  return context;
}
