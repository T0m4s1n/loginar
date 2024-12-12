import OpenAI from 'openai';

interface AIConfig {
  provider: 'openai' | 'huggingface' | 'localmodel';
  apiKey: string;
  baseUrl?: string;
  modelName?: string;
}

interface AnalysisResult {
  summary: string;
  recommendations: string[];
  confidence: number;
}

export class AIService {
  private client: any;
  private provider: string;
  private isConnected: boolean = false;
  private context: Map<string, any> = new Map();

  constructor(config: AIConfig) {
    this.provider = config.provider;

    switch (config.provider) {
      case 'openai':
        this.client = new OpenAI({
          apiKey: config.apiKey,
          dangerouslyAllowBrowser: true
        });
        break;

      case 'huggingface':
        this.client = {
          baseURL: 'https://api-inference.huggingface.co/models/',
          headers: { Authorization: `Bearer ${config.apiKey}` }
        };
        break;

      case 'localmodel':
        // Conexión a modelo local o servicio personalizado
        this.client = {
          baseURL: config.baseUrl,
          model: config.modelName
        };
        break;
    }
  }

  async connect(): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'openai':
          // Verificar conexión con OpenAI
          await this.client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: "Connection test" }],
            max_tokens: 5
          });
          break;

        case 'huggingface': {
          // Verificar conexión con Hugging Face
          const response = await fetch(`${this.client.baseURL}/status`);
          if (!response.ok) throw new Error('Connection failed');
          break;
        }

        case 'localmodel': {
          // Verificar conexión con modelo local
          const localResponse = await fetch(`${this.client.baseURL}/health`);
          if (!localResponse.ok) throw new Error('Local model not available');
          break;
        }
      }

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      this.isConnected = false;
      return false;
    }
  }

  async analyzeProducts(products: any[]): Promise<AnalysisResult> {
    if (!this.isConnected) throw new Error('AI Service not connected');

    const prompt = `
      Analiza los siguientes productos y proporciona:
      1. Resumen general del catálogo
      2. Productos más rentables
      3. Sugerencias de precios
      4. Oportunidades de mercado
      5. Recomendaciones de inventario

      Productos: ${JSON.stringify(products)}
    `;

    try {
      const analysis = await this.generateResponse(prompt, 'product_analysis');
      return this.formatAnalysis(analysis);
    } catch (error) {
      console.error('Product analysis error:', error);
      throw error;
    }
  }

  async getProductSuggestions(product: any): Promise<string> {
    if (!this.isConnected) throw new Error('AI Service not connected');

    const prompt = `
      Para el siguiente producto:
      ${JSON.stringify(product)}
      
      Proporciona:
      1. Sugerencias de mejora
      2. Precio óptimo recomendado
      3. Estrategias de marketing
      4. Productos complementarios sugeridos
      5. Tendencias relevantes del mercado
    `;

    return this.generateResponse(prompt, 'product_suggestions');
  }

  private async generateResponse(prompt: string, context: string): Promise<string> {
    try {
      switch (this.provider) {
        case 'openai': {
          const completion = await this.client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { 
                role: "system", 
                content: "Eres un experto en análisis de negocios y productos." 
              },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
          });
          return completion.choices[0].message.content;
        }

        case 'huggingface':
          // Implementar llamada a Hugging Face
          const response = await fetch(`${this.client.baseURL}/text-generation`, {
            method: 'POST',
            headers: this.client.headers,
            body: JSON.stringify({ inputs: prompt })
          });
          const result = await response.json();
          return result[0].generated_text;

        case 'localmodel':
          // Implementar llamada a modelo local
          const localResponse = await fetch(`${this.client.baseURL}/generate`, {
            method: 'POST',
            body: JSON.stringify({ prompt, context })
          });
          const localResult = await localResponse.json();
          return localResult.response;

        default:
          throw new Error('Unknown AI provider');
      }
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  }

  private formatAnalysis(rawAnalysis: string): AnalysisResult {
    // Formatear la respuesta en una estructura más útil
    return {
      summary: rawAnalysis.split('\n')[0] || '',
      recommendations: rawAnalysis.split('\n').slice(1) || [],
      confidence: 0.8 // Ejemplo simplificado
    };
  }
}