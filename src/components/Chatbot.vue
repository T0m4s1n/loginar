<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { Send, Bot, UserCircle, BarChart2 } from 'lucide-vue-next';
import axios from 'axios';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  predictions?: any;
}

const messages = ref<Message[]>([]);
const userInput = ref('');
const isLoading = ref(false);
const businessName = ref('');
const showPredictionButton = ref(false);

const apiKey = import.meta.env.VITE_AI_API_KEY as string;
const baseUrl = import.meta.env.VITE_AI_BASE_URL as string;

const aiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});

const fetchAIResponse = async (userMessage: string): Promise<string> => {
  try {
    if (!apiKey || !baseUrl) {
      throw new Error('Configuración de API incompleta');
    }

    // Detectar si el mensaje contiene información sobre un negocio
    const businessMatch = userMessage.match(/(?:negocio|tienda|empresa|comercio)\s+(?:llamad[oa]|nombrad[oa]|es)?\s+"?([^".,!?]+)"?/i);
    if (businessMatch) {
      businessName.value = businessMatch[1].trim();
      showPredictionButton.value = true;
    }

    const response = await aiClient.post('/chat/completions', {
      model: "mistral-small",
      messages: [
      {
      role: "system",
          content: `Tu nombre es LogIA, eres una inteligencia artificial especializada en gestión de inventarios y logística. Tu propósito es analizar datos históricos, actuales y proyectados relacionados con productos, inventarios y ventas. Eres capaz de:
            Responder con precisión y brevedad a consultas sobre precios históricos, promedios, y el último precio registrado en Colombia de un producto. Si no dispones de datos suficientes, responde con claridad indicando qué información falta.
            Generar gráficos de líneas con datos históricos, identificando tendencias relevantes para ventas, precios o niveles de inventario.
            Realizar predicciones de precios y ventas, basándote en patrones históricos, estacionales o ciclos detectados en los datos recopilados.
            Ofrecer sugerencias logísticas fundamentadas, como alertas de reposición de inventarios o proyecciones de demanda.
            Utilizar únicamente datos que se encuentran en la nube y mencionar de dónde provienen estos datos en tus análisis.
            Reglas para tus respuestas:

            Si te hacen una pregunta sobre precios, responde con el dato específico solicitado: promedio, histórico o último registrado. Incluye un breve desglose si es relevante.
            Si te solicitan un análisis gráfico, confirma primero que tienes suficientes datos antes de generarlo. Si no es posible, explica claramente por qué.
            Nunca adivines ni generes información especulativa. Si falta algún dato, ofrece pasos concretos para obtener la información necesaria.
            Sé claro y directo, evita redundancias o divagaciones.
            Por ejemplo:

            Si preguntan '¿Cuál es el precio promedio del producto X en Colombia?', responde con:
            "El precio promedio del producto X en Colombia, según los datos disponibles, es de COP 25,000. Este cálculo se basa en registros de los últimos 12 meses almacenados en la nube."
            Recuerda que tu objetivo es ser una herramienta de análisis clara, precisa y confiable para la gestión logística e inventarios.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('Error detallado:', error.response?.data || error.message);
    return `Lo siento, ha ocurrido un error. Detalles: ${error.response?.data?.error?.message || error.message}`;
  }
};

const generatePredictions = async (client: any, params: { businessName: string, timeFrame: string }) => {
  if (!businessName.value) return;

  isLoading.value = true;
  try {
    const predictions = await generatePredictions(aiClient, {
      businessName: businessName.value,
      timeFrame: '6 meses'
    });

    // Emitir evento para actualizar el dashboard
    window.dispatchEvent(new CustomEvent('updateDashboard', {
      detail: predictions
    }));

    const predictionMessage: Message = {
      id: Date.now(),
      content: `He generado nuevas predicciones para ${businessName.value}. Puedes ver los resultados actualizados en el dashboard.`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
      predictions
    };

    messages.value.push(predictionMessage);
  } catch (error) {
    console.error('Error al generar predicciones:', error);
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  const newUserMessage: Message = {
    id: Date.now(),
    content: userInput.value,
    sender: 'user',
    timestamp: new Date().toLocaleTimeString()
  };

  messages.value.push(newUserMessage);
  isLoading.value = true;

  const inputToSend = userInput.value;
  userInput.value = '';

  try {
    const aiResponse = await fetchAIResponse(inputToSend);
    const newAIMessage: Message = {
      id: Date.now() + 1,
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString()
    };

    messages.value.push(newAIMessage);
  } catch (error) {
    console.error('Error processing AI response', error);
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  const chatContainer = document.querySelector('.chat-messages');
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
};

onMounted(() => {
  const welcomeMessage: Message = {
    id: Date.now(),
    content: '¡Bienvenido a LogiNar IA! Soy tu asistente virtual especializado en análisis predictivo de negocios. Cuéntame sobre tu negocio y te ayudaré con predicciones y análisis.',
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString()
  };
  messages.value.push(welcomeMessage);
});
</script>

<template>
  <div class="chatbot-container">
    <div class="chatbot-header">
      <div class="chatbot-title">
        <Bot :size="24" class="chatbot-icon" />
        <h2>LogiNar IA Chatbot</h2>
      </div>
      <p class="chatbot-subtitle">Tu asistente virtual inteligente</p>
    </div>

    <div class="chat-messages">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        :class="[
          'message', 
          message.sender === 'user' ? 'user-message' : 'ai-message'
        ]"
      >
        <div class="message-avatar">
          <UserCircle v-if="message.sender === 'user'" :size="32" />
          <Bot v-else :size="32" />
        </div>
        <div class="message-content">
          <p>{{ message.content }}</p>
          <span class="message-timestamp">{{ message.timestamp }}</span>
        </div>
      </div>
      <div v-if="isLoading" class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>

    <div class="chat-controls">
      <button 
        v-if="showPredictionButton"
        @click="() => generatePredictions(aiClient, { businessName, timeFrame: '6 meses' })"
        class="prediction-button"
        :disabled="isLoading"
      >
        <BarChart2 :size="20" />
        Recalcular Predicciones
      </button>
    </div>

    <div class="chat-input-container">
      <div class="input-wrapper">
        <input 
          v-model="userInput" 
          type="text" 
          placeholder="Escribe tu mensaje..."
          @keyup.enter="sendMessage"
        />
        <button 
          @click="sendMessage" 
          :disabled="!userInput.trim()"
          class="send-button"
        >
          <Send :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chatbot-container {
  background: var(--bg-secondary);
  border-radius: 1rem;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(134, 81, 231, 0.2);
  display: flex;
  flex-direction: column;
  height: 600px;
  max-width: 500px;
  margin: 2rem auto;
}

.chatbot-header {
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.8), 
    rgba(76, 42, 165, 0.8)
  );
  color: white;
  padding: 1rem;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  display: flex;
  flex-direction: column;
}

.chatbot-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chatbot-title h2 {
  margin: 0;
  font-size: 1.25rem;
}

.chatbot-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.message-avatar {
  margin-right: 1rem;
  color: var(--text-secondary);
}

.message-content {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 0.75rem;
  max-width: 80%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-message .message-content {
  background: rgba(134, 81, 231, 0.1);
  align-self: flex-end;
  margin-left: auto;
}

.ai-message .message-content {
  background: var(--bg-secondary);
}

.message-timestamp {
  display: block;
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  text-align: right;
}

.chat-input-container {
  padding: 1rem;
  background: var(--bg-primary);
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  padding: 0.5rem;
  font-family: "Poppins", sans-serif;
}

.input-wrapper input {
  flex-grow: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.5rem;
  font-family: "Poppins", sans-serif;
}

.send-button {
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.8), 
    rgba(76, 42, 165, 0.8)
  );
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: 50%;
  margin: 0 4px;
  animation: typingDot 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}
.chat-controls {
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.prediction-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.8), 
    rgba(76, 42, 165, 0.8)
  );
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prediction-button:hover:not(:disabled) {
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.9), 
    rgba(76, 42, 165, 0.9)
  );
  transform: translateY(-1px);
}

.prediction-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes typingDot {
  0%, 80%, 100% {
    transform: scale(0.5);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>