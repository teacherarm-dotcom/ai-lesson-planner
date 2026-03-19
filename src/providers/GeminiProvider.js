import { BaseProvider } from './BaseProvider';

export class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = 'gemini-2.0-flash';
  }

  static get displayName() { return 'Google Gemini'; }
  static get providerId() { return 'gemini'; }
  static get apiKeyPlaceholder() { return 'AIzaSy...'; }
  static get apiKeyHelpUrl() { return 'https://aistudio.google.com/app/apikey'; }
  static get apiKeyHelpText() { return 'ขอรับ API Key ฟรีได้จาก Google AI Studio'; }

  async sendMessage(systemPrompt, contents = [], options = {}) {
    const parts = [];

    // Add system prompt as first text part
    if (systemPrompt) {
      parts.push({ text: systemPrompt });
    }

    // Add content parts
    for (const content of contents) {
      if (content.type === 'text') {
        parts.push({ text: content.data });
      } else if (content.type === 'image') {
        const base64 = this.fileToBase64(content.data);
        const mimeType = content.mimeType || 'image/jpeg';
        parts.push({ inlineData: { mimeType, data: base64 } });
      } else if (content.type === 'pdf') {
        const base64 = this.fileToBase64(content.data);
        parts.push({ inlineData: { mimeType: 'application/pdf', data: base64 } });
      } else if (content.type === 'word') {
        parts.push({ text: `\n\n--- Document Content ---\n${content.data}` });
      }
    }

    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [{ role: 'user', parts }]
    };

    if (options.requireJson) {
      payload.generationConfig = { responseMimeType: 'application/json' };
    }

    return this.withRetry(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        const err = new Error(`HTTP ${response.status}: ${errText}`);
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response text from Gemini');
      return text;
    });
  }

  async validateKey() {
    try {
      const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello. Reply with just "OK".' }] }]
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
