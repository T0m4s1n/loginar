<script setup>
import { ref } from 'vue';
import { 
  Box, 
  Search, 
  BarChart3, 
  Truck, 
  ScanLine, 
  BrainCircuit,
  ArrowRight
} from 'lucide-vue-next';

const features = ref([
  {
    title: "IA",
    description: "Gestión Inteligente",
    icon: BrainCircuit,
    color: "#6366f1"
  },
  {
    title: "Predicciones",
    description: "Análisis de Datos",
    icon: ScanLine,
    color: "#8b5cf6"
  },
  {
    title: "Stock",
    description: "Control Total",
    icon: Box,
    color: "#ec4899"
  },
  {
    title: "Analisis",
    description: "Datos en Tiempo Real",
    icon: BarChart3,
    color: "#14b8a6"
  }
]);

const activeFeature = ref(null);

const setActiveFeature = (index) => {
  activeFeature.value = activeFeature.value === index ? null : index;
};
</script>

<template>
  <div class="hero-container">
    <div class="hero-content">
      <h1 class="hero-title">LOGINAR</h1>
      <p class="hero-tagline">Gestión Inteligente de Inventario</p>

      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.title"
          class="feature-card"
          :class="{ 'active': activeFeature === index }"
          @click="setActiveFeature(index)"
        >
          <div class="feature-icon-wrapper" :style="{ backgroundColor: feature.color + '10' }">
            <component 
              :is="feature.icon" 
              class="feature-icon"
              :size="28"
              :color="feature.color"
            />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>

      <div class="cta-container">
        <router-link to="/login" class="cta-button primary">
          Comenzar
          <ArrowRight class="arrow-icon" :size="20" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-container {
  min-height: 70vh;
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  text-align: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
}

.hero-tagline {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.25rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card.active {
  border-color: var(--primary);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.1);
}

.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.feature-description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.cta-container {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.cta-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 1rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.cta-button:hover .arrow-icon {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .hero-container {
    padding: 1rem;
    padding-top: 0rem;
  }

  .hero-content {
    padding: 1.5rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-tagline {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .feature-card {
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .feature-icon-wrapper {
    margin-bottom: 0;
    width: 48px;
    height: 48px;
  }

  .feature-description {
    display: none;
  }

  .feature-card.active .feature-description {
    display: block;
    position: absolute;
    left: 1rem;
    right: 1rem;
    top: 100%;
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .cta-button {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>