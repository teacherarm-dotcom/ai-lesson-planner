/**
 * BaseProvider — Abstract AI Provider Interface
 * All AI providers (Gemini, OpenAI, Claude, etc.) must implement this interface.
 */
export class BaseProvider {
  constructor(apiKey) {
    if (new.target === BaseProvider) {
      throw new Error('BaseProvider is abstract and cannot be instantiated directly.');
    }
    this.apiKey = apiKey;
    this.maxRetries = 5;
    this.retryDelays = [2000, 4000, 8000, 15000, 32000];
  }

  /** Provider display name */
  static get displayName() { throw new Error('Not implemented'); }

  /** Provider ID (e.g., 'gemini', 'openai', 'claude') */
  static get providerId() { throw new Error('Not implemented'); }

  /** Placeholder for API key input */
  static get apiKeyPlaceholder() { return 'Enter your API key...'; }

  /** Help URL for getting API key */
  static get apiKeyHelpUrl() { return '#'; }

  /** Help text */
  static get apiKeyHelpText() { return 'Get your API key from the provider\'s website'; }

  /**
   * Send a message with optional file attachments.
   * @param {string} systemPrompt - System/instruction prompt
   * @param {Array} contents - Array of content objects: { type: 'text'|'image'|'pdf'|'word', data: string }
   * @param {Object} options - { requireJson: boolean }
   * @returns {Promise<string>} - The AI response text
   */
  async sendMessage(systemPrompt, contents, options = {}) {
    throw new Error('sendMessage() must be implemented by subclass');
  }

  /**
   * Validate the API key
   * @returns {Promise<boolean>}
   */
  async validateKey() {
    throw new Error('validateKey() must be implemented by subclass');
  }

  /**
   * Retry wrapper with exponential backoff
   */
  async withRetry(fn) {
    let lastError;
    for (let i = 0; i <= this.maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        // Don't retry client errors (except 429)
        if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
          throw err;
        }
        if (i < this.retryDelays.length) {
          await new Promise(r => setTimeout(r, this.retryDelays[i]));
        }
      }
    }
    throw lastError;
  }

  /**
   * Helper: Convert file data to base64
   */
  fileToBase64(dataUrl) {
    return dataUrl.split(',')[1];
  }
}
