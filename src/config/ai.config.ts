export const AI_CONFIG = {
    provider: import.meta.env.VITE_AI_PROVIDER || 'openai',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseUrl: import.meta.env.VITE_AI_BASE_URL
  }