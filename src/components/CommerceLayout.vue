<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { Backpack, ShoppingBasket, Archive, ChartArea, Brain, BookUser } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { AI_CONFIG } from '../config/ai.config';
import { AIService } from '../AIService';

const aiService = ref<{
  instance: AIService | null;
  connected: boolean;
  error: string | null;
}>({
  instance: null,
  connected: false,
  error: null
});

const initAIService = async () => {
  try {
    aiService.value.instance = new AIService({
      provider: AI_CONFIG.provider as 'openai',
      apiKey: AI_CONFIG.apiKey,
      baseUrl: AI_CONFIG.baseUrl
    });
    
    aiService.value.connected = await aiService.value.instance.connect();
  } catch (error) {
    aiService.value.error = 'Error connecting to AI service';
    console.error(error);
  }
};
  
interface Commerce {
  id: number;
  name: string;
  logo?: string;
  emoji: string;
  type: string;
  nit: string;
  phone: string;
  owner: string;
  contact: string;
  foundationDate?: string;
  createdAt: string;
}

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
}

const route = useRoute();
const commerce = ref<Commerce | null>(null);
const isAIChatOpen = ref(false);
const chatMessages = ref<ChatMessage[]>([]);
const newMessage = ref('');
const currentSection = ref('overview');
const isLoading = ref(true);
const error = ref<string | null>(null);

const sectionTitles = {
  overview: 'Vista General',
  products: 'Productos',
  inventory: 'Inventario',
  analytics: 'Análisis',
  providers: 'Proveedores'
};

const sectionTitle = computed(() => {
  return sectionTitles[currentSection.value as keyof typeof sectionTitles] || '';
});

const loadCommerceData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const commerceId = route.params.id;
    
    // Get user session
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    if (session) {
      // Get commerces from localStorage using the user's email
      const userCommerces = localStorage.getItem(`userCommerces_${session.email}`);
      if (userCommerces) {
        const commerces = JSON.parse(userCommerces);
        const foundCommerce = commerces.find((c: Commerce) => c.id === Number(commerceId));
        
        if (foundCommerce) {
          commerce.value = foundCommerce;
          if (chatMessages.value.length === 0) {
            chatMessages.value.push({
              type: 'ai',
              text: `¡Hola! Soy tu asistente IA para ${commerce.value?.name || 'tu comercio'}. ¿En qué puedo ayudarte hoy?`
            });
          }
        } else {
          error.value = 'Comercio no encontrado';
        }
      }
    }
  } catch (e) {
    error.value = 'Error al cargar los datos del comercio';
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

watch(() => route.path, (newPath) => {
  const section = newPath.split('/').pop();
  if (section) {
    currentSection.value = section;
  }
});

const toggleAIChat = () => {
  isAIChatOpen.value = !isAIChatOpen.value;
};

// Add this to your existing refs
const isSidebarOpen = ref(false);

// Add this to your existing functions
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  // Prevent body scroll when sidebar is open
  document.body.style.overflow = isSidebarOpen.value ? 'hidden' : '';
};

// Add this to your existing watch functions
watch(() => route.path, () => {
  // Close sidebar on route change
  isSidebarOpen.value = false;
  document.body.style.overflow = '';
});

// Clean up on component unmount
onUnmounted(() => {
  document.body.style.overflow = '';
});

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  chatMessages.value.push({
    type: 'user',
    text: newMessage.value
  });

  const userQuery = newMessage.value;
  newMessage.value = '';

  try {
    setTimeout(() => {
      chatMessages.value.push({
        type: 'ai',
        text: `He recibido tu mensaje: "${userQuery}". Estamos trabajando en la integración con el servicio de IA.`
      });
    }, 1000);
  } catch (e) {
    chatMessages.value.push({
      type: 'ai',
      text: 'Lo siento, ha ocurrido un error al procesar tu mensaje.'
    });
  }
};

onMounted(() => {
  loadCommerceData();
  initAIService();
});
</script>
```vue
<template>
  <div class="commerce-layout">
    <!-- Mobile Menu Toggle -->
    <button class="menu-toggle" @click="toggleSidebar" aria-label="Toggle menu">
      <div class="hamburger" :class="{ 'is-active': isSidebarOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <!-- Sidebar Navigation -->
    <nav class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-header">
        <div class="commerce-info">
          <div class="commerce-avatar">
            <img 
              v-if="commerce?.logo" 
              :src="commerce.logo" 
              :alt="commerce.name"
              class="commerce-logo"
            />
            <span v-else class="commerce-emoji">{{ commerce?.emoji }}</span>
          </div>
          <h2 class="commerce-name">{{ commerce?.name }}</h2>
        </div>
      </div>

      <div class="nav-links">
        <router-link to="./ChatBot" class="nav-link ai-chat-toggle" :class="{ active: currentSection === 'chatbot' }">
          <Brain class="nav-icon" />
          <span>LogiNar IA</span>
        </router-link>
        
        <router-link to="./overview" class="nav-link" :class="{ active: currentSection === 'overview' }">
          <Backpack class="nav-icon" />
          <span>Vista General</span>
        </router-link>
        
        <router-link to="./products" class="nav-link" :class="{ active: currentSection === 'products' }">
          <ShoppingBasket class="nav-icon" />
          <span>Productos</span>
        </router-link>
        
        <router-link to="./inventory" class="nav-link" :class="{ active: currentSection === 'inventory' }">
          <Archive class="nav-icon" />
          <span>Inventario</span>
        </router-link>
        
        <router-link to="./analytics" class="nav-link" :class="{ active: currentSection === 'analytics' }">
          <ChartArea class="nav-icon" />
          <span>Análisis</span>
        </router-link>
        
        <router-link to="./providers" class="nav-link" :class="{ active: currentSection === 'providers' }">
          <BookUser class="nav-icon" />
          <span>Proveedores</span>
        </router-link>
      </div>
    </nav>

    <!-- Sidebar Overlay -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>

    <!-- Main Content -->
    <main class="main-content">
      <header class="content-header">
        <h1>{{ sectionTitle }}</h1>
        <div class="header-actions">
        </div>
      </header>

      <div class="content-body">
        <Suspense>
          <template #default>
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component 
                  :is="Component" 
                  :commerce="commerce"
                  @refresh-data="loadCommerceData" 
                />
              </transition>
            </router-view>
          </template>
          <template #fallback>
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Cargando...</span>
            </div>
          </template>
        </Suspense>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Layout */
.commerce-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
  background: var(--bg-primary);
  position: relative;
}

/* Mobile Menu Toggle */
.menu-toggle {
  display: none;
  position: fixed;
  top: 6rem;
  left: 1rem;
  z-index: 101;
  background: #999;
  border: none;
  border-radius: 0.5rem;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 20px;
  height: 20px;
  margin: auto;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--text-primary);
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger.is-active span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger.is-active span:nth-child(2) {
  opacity: 0;
}

.hamburger.is-active span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Sidebar */
.sidebar {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 100;
}

.sidebar-header {
  margin-bottom: 2rem;
}

.commerce-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.commerce-info:hover {
  background: rgba(134, 81, 231, 0.1);
}

.commerce-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(134, 81, 231, 0.1);
  flex-shrink: 0;
}

.commerce-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.commerce-emoji {
  font-size: 1.5rem;
}

.commerce-name {
  font-size: 1.25rem;
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Navigation Links */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  user-select: none;
}

.nav-link:hover {
  background: rgba(134, 81, 231, 0.1);
  color: var(--text-primary);
}

.nav-link.active {
  background: rgba(134, 81, 231, 0.2);
  color: var(--text-primary);
}

.nav-icon {
  width: 20px;
  height: 20px;
}

/* AI Chat Toggle Special Styling */
.ai-chat-toggle {
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.2),
    rgba(76, 42, 165, 0.2)
  );
  border: 1px solid rgba(134, 81, 231, 0.3);
}

.ai-chat-toggle:hover {
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.3),
    rgba(76, 42, 165, 0.3)
  );
  transform: translateY(-1px);
}

/* Main Content */
.main-content {
  overflow-y: auto;
}

.content-header {
  margin-bottom: 2rem;
}

.content-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(134, 81, 231, 0.1);
  border-top-color: rgb(134, 81, 231);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .commerce-layout {
    grid-template-columns: 1fr;
  }

  .menu-toggle {
    display: flex;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 250px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;
  }

  .main-content {
    padding-top: 4rem;
  }
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Utilities */
.hidden {
  display: none;
}

/* Print Styles */
@media print {
  .sidebar,
  .menu-toggle {
    display: none;
  }

  .commerce-layout {
    grid-template-columns: 1fr;
  }

  .main-content {
    padding: 0;
  }
}
</style>
```