<script lang="ts">
import { TriangleAlert, Home, ArrowLeft, Search, AlertCircle } from 'lucide-vue-next';

export default {
  name: 'NotFoundComponent',
  components: {
    TriangleAlert,
    Home,
    ArrowLeftIcon: ArrowLeft,
    SearchIcon: Search,
    AlertCircleIcon: AlertCircle,
    HomeIcon: Home,
  },
  methods: {
    handleGoBack() {
      window.history.back()
    }
  }
}
</script>

<template>
    <section class="not-found-container">
      <div class="not-found-content">
        <div class="error-card">
          <div class="icon-wrapper">
            <TriangleAlert class="alert-icon" />
          </div>
          
          <h1 class="error-title">404</h1>
          <h2 class="error-subtitle">Oops! Pagina no encontrada</h2>
          
          <p class="error-message">
            La pagina que estas buscando no existe o dejo de existir, pero no te preocupes puedes seguir navegando sin preocupacion
          </p>
          
          <div class="buttons-container">
            <button @click="handleGoBack" class="action-button back-button">
              <ArrowLeftIcon class="button-icon" />
              Atras
            </button>
            
            <router-link to="/" class="action-button home-button">
              <HomeIcon class="button-icon" />
              Inicio
            </router-link>
            
            <router-link to="/search" class="action-button search-button">
              <SearchIcon class="button-icon" />
              Buscar
            </router-link>
          </div>
  
          <div class="support-info">
            <p>
              si crees que esto es un error, puedes contactarte con nosotros para darte soporte!
            </p>
          </div>
        </div>
      </div>
      
      <div class="background-decoration">
        <div class="decoration-orb orb-1"></div>
        <div class="decoration-orb orb-2"></div>
      </div>
    </section>
</template>

<style scoped>
.not-found-container {
  margin-top: 6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: transparent;
  padding: 1rem;
}

.not-found-content {
  width: 100%;
  max-width: 600px;
}
.error-card {
  background-color: var(--bg-primary);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-card {
    background: var(--bg-secondary);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 10px 30px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
  }

.icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.alert-icon {
  width: 4rem;
  height: 4rem;
  color: var(--accent-color-dark);
}

.error-title {
  font-size: 4rem;
  color: var(--accent-color-dark);
  margin-bottom: 0.5rem;
}

.error-subtitle {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.buttons-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.action-button {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
}

.action-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.button-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
}

.home-button {
  text-decoration: none;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
}

.search-button {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.search-button:hover {
  background: color-mix(in srgb, #666 80%, white);
}

.support-info {
  margin-top: 1.5rem;
  color: #888;
  font-size: 0.9rem;
}

.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.decoration-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--accent-color-rgb), 0.1) 0%, transparent 70%);
  opacity: 0.5;
}

.decoration-orb-1 {
  top: -10%;
  left: -10%;
  width: 400px;
  height: 400px;
}

.decoration-orb-2 {
  bottom: -10%;
  right: -10%;
  width: 500px;
  height: 500px;
}

@media (max-width: 768px) {
  .error-card {
    padding: 1.5rem;
    border-radius: 15px;
  }

  .error-title {
    font-size: 3rem;
  }

  .error-subtitle {
    font-size: 1.3rem;
  }

  .buttons-container {
    flex-direction: column;
    align-items: center;
  }

  .action-button {
    width: 77%;
    max-width: 300px;
  }

  .decoration-orb-1 {
    width: 250px;
    height: 250px;
  }

  .decoration-orb-2 {
    width: 300px;
    height: 300px;
  }
}
</style>