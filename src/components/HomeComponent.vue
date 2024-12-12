<script setup>
import { ref } from 'vue';

const features = ref([
  {
    title: 'Inventario Moderno',
    description: 'Organiza tu inventario con IA, busca items instantáneamente y optimiza los tiempos de tu negocio.',
    icon: '🤖'
  },
  {
    title: 'Búsqueda Inteligente',
    description: 'Encuentra productos al instante con nuestra búsqueda inteligente.',
    icon: '🔍'
  },
]);

const stats = ref([
  {
    value: '99.98%',
    label: 'optima'
  },
  {
    value: '100+',
    label: 'Objetos procesados'
  },
  {
    value: '2',
    label: 'Usuarios'
  }
]);
</script>
<template>
  <div class="home-container"> 
    <main class="content-wrapper">
      <section class="hero-section">
        <h1 class="main-title">Inventario Inteligente</h1>
        <p class="subtitle">
            Organiza tu inventario con IA, busca items instantáneamente y optimiza los tiempos de tu negocio.
        </p>
      </section>

      <section class="features-section">
        <div class="features-grid">
          <div 
            v-for="feature in features" 
            :key="feature.title" 
            class="feature-card"
          >
            <span class="feature-icon">{{ feature.icon }}</span>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <section class="stats-section">
        <div class="stats-grid">
          <div 
            v-for="stat in stats" 
            :key="stat.label" 
            class="stat-card"
          >
            <h4 class="stat-value">{{ stat.value }}</h4>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      </section>

      <section class="benefits-section">
        <div class="benefits-content">
          <h2 class="section-title">Porque escoger LogiNar</h2>
          <div class="benefits-grid">
            <div class="benefit-item">
              <h3>Analisis predictivo</h3>
              <p>Nuestro análisis predictivo realizado por IA utiliza algoritmos avanzados y aprendizaje automático para identificar patrones y tendencias en tus datos.</p>
            </div>
            <div class="benefit-item">
              <h3>Optimizacion</h3>
              <p>Nuestra herramienta optimiza automáticamente el inventario, reduciendo el exceso de stock y mejorando la eficiencia operativa.</p>
            </div>
            <div class="benefit-item">
              <h3>Colaboración inteligente</h3>
              <p>Nuestra función de sugerencias inteligentes de uso compartido y control de acceso facilita la colaboración eficiente entre tu equipo. </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  margin-left: auto;
  width: 60%;
  max-width: 1200px;
}

.hero-section {
  padding: 4rem 0;
  text-align: left;
}

.main-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 600px;
}

.cta-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.cta-button {
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background-color: var(--primary);
  color: white;
  border: none;
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cta-button.secondary {
  background-color: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
}

.cta-button.secondary:hover {
  background-color: var(--primary);
  color: white;
}

.features-section {
  padding: 4rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: 1rem;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.feature-title {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.stats-section {
  padding: 4rem 0;
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  margin: 2rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  color: var(--primary);
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.benefits-section {
  padding: 4rem 0;
}

.section-title {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
}

.benefit-item {
  padding: 1.5rem;
  border-left: 3px solid var(--primary);
  background-color: var(--bg-secondary);
  border-radius: 0.5rem;
}

.benefit-item h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.benefit-item p {
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .content-wrapper {
    width: 90%;
    margin: 0 auto;
  }

  .main-title {
    font-size: 2.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .cta-group {
    flex-direction: column;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style>