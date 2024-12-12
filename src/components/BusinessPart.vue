```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Check, X, Star, Zap, Shield, Users, Crown, Rocket } from 'lucide-vue-next';

interface Feature {
  name: string;
  basic: boolean;
  pro: boolean;
  enterprise: boolean;
  description?: string;
}

interface Plan {
  id: string;
  name: string;
  icon: any;
  price: number;
  description: string;
  recommendedFor: string;
  highlight?: boolean;
}

const isAnnual = ref(true);

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    icon: Zap,
    price: 29900,
    description: 'Ideal para pequeños negocios que están comenzando',
    recommendedFor: 'Pequeños negocios',
  },
  {
    id: 'pro',
    name: 'Profesional',
    icon: Crown,
    price: 49900,
    description: 'Perfecto para negocios en crecimiento con más necesidades',
    recommendedFor: 'Negocios medianos',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    icon: Rocket,
    price: 99900,
    description: 'Para grandes empresas que necesitan máximo poder',
    recommendedFor: 'Grandes empresas',
  }
];

const features: Feature[] = [
  {
    name: 'Gestión de Inventario',
    basic: true,
    pro: true,
    enterprise: true,
    description: 'Control de stock y productos'
  },
  {
    name: 'Proveedores',
    basic: true,
    pro: true,
    enterprise: true,
    description: 'Gestión de proveedores'
  },
  {
    name: 'Analítica Básica',
    basic: true,
    pro: true,
    enterprise: true,
    description: 'Reportes básicos de ventas e inventario'
  },
  {
    name: 'Asistente IA',
    basic: false,
    pro: true,
    enterprise: true,
    description: 'Asistente inteligente para decisiones'
  },
  {
    name: 'Predicciones Avanzadas',
    basic: false,
    pro: true,
    enterprise: true,
    description: 'Predicciones de stock y ventas'
  },
  {
    name: 'Optimización de Rutas',
    basic: false,
    pro: true,
    enterprise: true,
    description: 'Planificación de rutas de entrega'
  },
  {
    name: 'Usuarios Múltiples',
    basic: false,
    pro: true,
    enterprise: true,
    description: 'Acceso para múltiples usuarios'
  },
  {
    name: 'API Access',
    basic: false,
    pro: false,
    enterprise: true,
    description: 'Acceso a API para integraciones'
  },
  {
    name: 'Soporte 24/7',
    basic: false,
    pro: false,
    enterprise: true,
    description: 'Soporte técnico prioritario'
  },
  {
    name: 'Personalización Avanzada',
    basic: false,
    pro: false,
    enterprise: true,
    description: 'Personalización completa del sistema'
  }
];

const toggleBilling = () => {
  isAnnual.value = !isAnnual.value;
};

const getPrice = (basePrice: number) => {
  const price = isAnnual.value ? basePrice * 12 * 0.8 : basePrice;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
</script>

<template>
  <div class="subscription-container">
    <div class="subscription-header">
      <h2>Planes de Suscripción</h2>
      <p>Elige el plan que mejor se adapte a tus necesidades</p>
      
      <div class="billing-toggle">
        <span :class="{ 'active': !isAnnual }">Mensual</span>
        <button 
          class="toggle-button" 
          :class="{ 'annual': isAnnual }"
          @click="toggleBilling"
        >
          <span class="toggle-slider"></span>
        </button>
        <span :class="{ 'active': isAnnual }">
          Anual
          <span class="discount-badge">20% OFF</span>
        </span>
      </div>
    </div>

    <!-- Plans Grid -->
    <div class="plans-grid">
      <div 
        v-for="plan in plans" 
        :key="plan.id"
        class="plan-card"
        :class="{ 'highlight': plan.highlight }"
      >
        <div class="plan-header">
          <component :is="plan.icon" class="plan-icon" :size="24" />
          <h3>{{ plan.name }}</h3>
          <p class="plan-description">{{ plan.description }}</p>
        </div>

        <div class="plan-price">
          <span class="currency">COP</span>
          <span class="amount">{{ getPrice(plan.price) }}</span>
          <span class="period">/{{ isAnnual ? 'año' : 'mes' }}</span>
        </div>

        <div class="plan-features">
          <p class="recommended-for">
            Recomendado para: <strong>{{ plan.recommendedFor }}</strong>
          </p>
          
          <ul class="features-list">
            <li 
              v-for="feature in features" 
              :key="feature.name"
              class="feature-item"
              :class="{
                'included': plan.id === 'basic' ? feature.basic :
                           plan.id === 'pro' ? feature.pro :
                           feature.enterprise
              }"
            >
              <Check 
                v-if="plan.id === 'basic' ? feature.basic :
                      plan.id === 'pro' ? feature.pro :
                      feature.enterprise"
                class="feature-icon"
                :size="18"
              />
              <X 
                v-else
                class="feature-icon"
                :size="18"
              />
              <span class="feature-name">{{ feature.name }}</span>
              <span 
                v-if="feature.description"
                class="feature-tooltip"
              >
                {{ feature.description }}
              </span>
            </li>
          </ul>
        </div>

        <button class="select-plan-button">
          Seleccionar Plan
          <span v-if="plan.highlight" class="recommended-badge">Recomendado</span>
        </button>
      </div>
    </div>

    <!-- Additional Information -->
    <div class="additional-info">
      <div class="info-card">
        <Shield class="info-icon" />
        <h4>Garantía de 30 días</h4>
        <p>Prueba sin riesgo con nuestra garantía de devolución de dinero</p>
      </div>

      <div class="info-card">
        <Users class="info-icon" />
        <h4>Soporte Dedicado</h4>
        <p>Equipo de soporte especializado para ayudarte en tu negocio</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscription-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.subscription-header {
  text-align: center;
  margin-bottom: 3rem;
}

.subscription-header h2 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.subscription-header p {
  color: var(--text-secondary);
}

.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.toggle-button {
  width: 48px;
  height: 24px;
  background: rgba(134, 81, 231, 0.2);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background: rgb(134, 81, 231);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
}

.toggle-button.annual .toggle-slider {
  transform: translateX(24px);
}

.discount-badge {
  background: rgba(52, 211, 153, 0.2);
  color: rgb(52, 211, 153);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.plan-card {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(134, 81, 231, 0.1);
}

.plan-card.highlight {
  border: 2px solid rgb(134, 81, 231);
  transform: scale(1.02);
}

.plan-header {
  text-align: center;
}

.plan-icon {
  color: rgb(134, 81, 231);
  margin-bottom: 1rem;
}

.plan-price {
  text-align: center;
  margin: 1.5rem 0;
}

.currency {
  color: var(--text-secondary);
  font-size: 1rem;
}

.amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.period {
  color: var(--text-secondary);
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: var(--text-secondary);
  position: relative;
}

.feature-icon {
  flex-shrink: 0;
}

.feature-item.included {
  color: var(--text-primary);
}

.feature-item.included .feature-icon {
  color: rgb(52, 211, 153);
}

.feature-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--bg-secondary);
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 10;
  width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feature-item:hover .feature-tooltip {
  opacity: 1;
  visibility: visible;
}

.select-plan-button {
  margin-top: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgb(134, 81, 231);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.select-plan-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(134, 81, 231, 0.2);
}

.recommended-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: rgb(52, 211, 153);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
}

.additional-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.info-card {
  text-align: center;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid rgba(134, 81, 231, 0.1);
}

.info-icon {
  color: rgb(134, 81, 231);
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .subscription-container {
    padding: 1rem;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .plan-card.highlight {
    transform: none;
  }
}
</style>