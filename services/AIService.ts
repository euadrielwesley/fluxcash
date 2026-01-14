
import { IntegrationConfig } from '../types';

export interface AIRequestParams {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  model?: string;
  temperature?: number;
}

export const AIService = {
  /**
   * Universal fetch wrapper for OpenAI-compatible endpoints (OpenAI, Anthropic via proxy, Ollama, LocalAI)
   */
  async generateCompletion(
    config: IntegrationConfig, 
    params: AIRequestParams
  ): Promise<string> {
    const apiKey = config.credentials['apiKey'] || 'no-key';
    const baseUrl = config.credentials['baseUrl'] || 'https://api.openai.com/v1';
    const model = config.credentials['model'] || 'gpt-3.5-turbo';
    const orgId = config.credentials['orgId'];

    // Clean URL
    const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const endpoint = `${cleanUrl}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    if (orgId) {
      headers['OpenAI-Organization'] = orgId;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: params.model || model,
          messages: params.messages,
          temperature: params.temperature || 0.7,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  },

  /**
   * Pings the model to verify credentials
   */
  async testConnection(config: IntegrationConfig): Promise<{ success: boolean; message: string }> {
    try {
        // Simple "Hello" prompt with max_tokens 1 to save cost/time
        await this.generateCompletion(config, {
            messages: [{ role: 'user', content: 'Hi' }],
            temperature: 0,
        });
        return { success: true, message: 'Conexão estabelecida com sucesso!' };
    } catch (error: any) {
        let msg = error.message;
        if (msg.includes('401')) msg = 'Erro 401: Chave de API inválida.';
        if (msg.includes('404')) msg = 'Erro 404: Endpoint ou Modelo não encontrado.';
        if (msg.includes('Failed to fetch')) msg = 'Erro de Rede: Verifique sua internet ou a URL base.';
        
        return { success: false, message: msg };
    }
  }
};
