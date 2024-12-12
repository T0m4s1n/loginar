<script setup lang="ts">
import { ref } from 'vue';
import { Boxes, Brain, Lock, Server, Users, Zap } from 'lucide-vue-next';

const features = ref([
  {
    icon: Brain,
    title: 'Loginar IA',
    description: 'Una IA que esta entrenada para la analitica y prediccion de datos de inventario.',
    color: '#4F46E5'
  },
  {
    icon: Lock,
    title: 'Seguridad',
    description: 'Tus datos estan seguros con nosotros, usamos la mejor tecnologia para proteger tu informacion.',
    color: '#7C3AED'
  },
  {
    icon: Zap,
    title: 'Rapidez',
    description: 'Nuestra aplicacion es rapida y eficiente, para que puedas trabajar sin problemas.',
    color: '#EC4899'
  },
]);

const stats = ref([
  { value: '100%', label: 'En Linea' },
  { value: '100+', label: 'Archivos Procesados' },
  { value: '2', label: 'Usuarios Activos' },
  { value: '4', label: 'Comercios' }
]);

const team = ref([
  {
    name: 'Desarrollo de Frontend',
    description: 'Equipo de desarrollo de la interfaz de usuario.',
    icon: Boxes,
    color: '#7C3AED'
  },
  {
    name: 'Desarrollo de IA',
    description: 'Equipo de desarrollo de la inteligencia artificial.',
    icon: Brain,
    color: '#4F46E5'
  },
  {
    name: 'Equipo de Soporte',
    description: 'Equipo de soporte tecnico para ayudarte en lo que necesites.',
    icon: Users,
    color: '#EC4899'
  }
]);
</script>

<template>
  <div class="about-container">
    <section class="hero-section">
      <h1 class="title">Revolucionando</h1>
      <p class="subtitle">Combinando IA y la gestion de inventarios </p>
    </section>

    <section class="stats-section">
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <h3 class="stat-value">{{ stat.value }}</h3>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <section class="features-section">
      <h2 class="section-title">Nuestras Caracteristicas</h2>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon" :style="{ backgroundColor: feature.color + '10' }">
            <component :is="feature.icon" :size="24" :color="feature.color" />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <section class="team-section">
      <h2 class="section-title">Nuestro Equipo</h2>
      <div class="team-grid">
        <div v-for="member in team" :key="member.name" class="team-card">
          <div class="team-icon" :style="{ backgroundColor: member.color + '10' }">
            <component :is="member.icon" :size="32" :color="member.color" />
          </div>
          <h3 class="team-title">{{ member.name }}</h3>
          <p class="team-description">{{ member.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--text-primary);
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #462989 0%, #6d42c7 100%);
  border-radius: 1rem;
  margin-bottom: 3rem;
  color: white;
  margin-top: 1rem;
}

.title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
}

.stats-section {
  margin-bottom: 4rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-card {
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.feature-card {
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: 1rem;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  display: inline-flex;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.team-card {
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.team-card:hover {
  transform: translateY(-5px);
}

.team-icon {
  display: inline-flex;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
}

.team-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.team-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 1rem;
  }

  .hero-section {
    padding: 3rem 1rem;
  }

  .title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid,
  .team-grid {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 2rem;
  }

  .feature-card,
  .team-card {
    padding: 1.5rem;
  }
}
</style>
