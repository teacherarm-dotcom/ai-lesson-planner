import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { ClaudeProvider } from './ClaudeProvider';

/**
 * Registry of all available AI providers.
 * To add a new provider: 1) Create XxxProvider.js extending BaseProvider 
 *                         2) Import and add to this array
 */
const PROVIDERS = [
  GeminiProvider,
  OpenAIProvider,
  ClaudeProvider,
];

/**
 * Get list of available providers with metadata
 */
export function getAvailableProviders() {
  return PROVIDERS.map(P => ({
    id: P.providerId,
    name: P.displayName,
    placeholder: P.apiKeyPlaceholder,
    helpUrl: P.apiKeyHelpUrl,
    helpText: P.apiKeyHelpText,
  }));
}

/**
 * Create a provider instance by ID
 * @param {string} providerId - e.g., 'gemini', 'openai', 'claude'
 * @param {string} apiKey
 * @returns {BaseProvider}
 */
export function createProvider(providerId, apiKey) {
  const ProviderClass = PROVIDERS.find(P => P.providerId === providerId);
  if (!ProviderClass) {
    throw new Error(`Unknown AI provider: ${providerId}`);
  }
  return new ProviderClass(apiKey);
}

/**
 * Get provider metadata by ID
 */
export function getProviderMeta(providerId) {
  const ProviderClass = PROVIDERS.find(P => P.providerId === providerId);
  if (!ProviderClass) return null;
  return {
    id: ProviderClass.providerId,
    name: ProviderClass.displayName,
    placeholder: ProviderClass.apiKeyPlaceholder,
    helpUrl: ProviderClass.apiKeyHelpUrl,
    helpText: ProviderClass.apiKeyHelpText,
  };
}
