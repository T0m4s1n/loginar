import axios from 'axios';
import type { AxiosInstance } from 'axios';

interface SalesData {
  date: string;
  productId: string;
  quantity: number;
  revenue: number;
}

interface PredictionRequest {
  historicalData: SalesData[];
  predictionPeriod: number; // número de días/semanas/meses a predecir
  productId?: string; // opcional, para predecir un producto específico
}

interface PredictionResponse {
  predictions: {
    date: string;
    productId: string;
    expectedQuantity: number;
    confidenceLevel: number;
  }[];
  insights: {
    seasonalTrends: string[];
    demandPatterns: string[];
    recommendations: string[];
  };
}

export class AIPredictionService {
  private apiClient: AxiosInstance;
  private readonly DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
  };

  constructor(apiKey: string, baseURL: string) {
    this.apiClient = axios.create({
      baseURL,
      headers: {
        ...this.DEFAULT_HEADERS,
        'Authorization': `Bearer ${apiKey}`
      }
    });
  }

  /**
   * Realiza predicciones de demanda basadas en datos históricos
   */
  public async predictDemand(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      // Preparar los datos para el modelo de IA
      const promptData = this.prepareDataForAI(request);

      // Llamar a la API de IA
      const response = await this.apiClient.post('/predictions', promptData);

      // Procesar y transformar la respuesta
      return this.processAIResponse(response.data);
    } catch (error) {
      console.error('Error al realizar predicción:', error);
      throw new Error('Error al procesar la predicción de demanda');
    }
  }

  /**
   * Prepara los datos históricos para ser procesados por la IA
   */
  private prepareDataForAI(request: PredictionRequest) {
    // Aquí puedes formatear los datos según los requisitos específicos de tu IA
    return {
      messages: [{
        role: "system",
        content: "Analiza los siguientes datos históricos de ventas y genera predicciones de demanda futura."
      }, {
        role: "user",
        content: JSON.stringify({
          historicalData: request.historicalData,
          predictionPeriod: request.predictionPeriod,
          productId: request.productId
        })
      }]
    };
  }

  /**
   * Procesa la respuesta de la IA y la transforma al formato requerido
   */
  private processAIResponse(aiResponse: any): PredictionResponse {
    // Aquí deberás implementar la lógica para interpretar la respuesta de tu IA
    // y transformarla al formato PredictionResponse
    
    // Este es un ejemplo de estructura de respuesta
    return {
      predictions: aiResponse.predictions.map((pred: any) => ({
        date: pred.date,
        productId: pred.productId,
        expectedQuantity: pred.quantity,
        confidenceLevel: pred.confidence
      })),
      insights: {
        seasonalTrends: aiResponse.trends || [],
        demandPatterns: aiResponse.patterns || [],
        recommendations: aiResponse.recommendations || []
      }
    };
  }

  /**
   * Método para validar y analizar la calidad de las predicciones
   */
  public async validatePredictions(
    predictions: PredictionResponse
  ): Promise<number> {
    const totalPredictions = predictions.predictions.length;
    let correctPredictions = 0;
    predictions.predictions.forEach(prediction => {
      if (prediction.expectedQuantity > 0) {
        correctPredictions++;
      }
    });

    return (correctPredictions / totalPredictions) * 100;
  }
}