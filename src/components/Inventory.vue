<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Trash, Pencil, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Package, AlertOctagon } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

interface Product {
  id: number;
  commerceId: string;
  name: string;
  description: string;
  weight: number;
  unit: string;
  price: number;
  image?: string;
  providerId?: number;
  quantity: number;
}

interface Commerce {
  id: number;
  name: string;
  logo?: string;
  emoji: string;
  type: string;
}

const route = useRoute();
const products = ref<Product[]>([]);
const commerce = ref<Commerce | null>(null);
const isLoading = ref(true);

// Función para obtener el ID del comercio actual
const getCurrentCommerceId = () => {
  return route.params.id as string;
};

const stockAlerts = computed(() => {
  const criticalProducts = products.value.filter(p => p.quantity === 0);
  const ultraWarningProducts = products.value.filter(p => p.quantity > 0 && p.quantity < 5);
  
  return {
    critical: criticalProducts,
    ultraWarning: ultraWarningProducts,
    hasCritical: criticalProducts.length > 0,
    hasUltraWarning: ultraWarningProducts.length > 0
  };
});

// Validar acceso al comercio
const validateCurrentCommerce = () => {
  const commerceId = getCurrentCommerceId();
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  
  if (!session) {
    return false;
  }

  const userCommerces = JSON.parse(localStorage.getItem(`userCommerces_${session.email}`) || '[]');
  const currentCommerce = userCommerces.find((c: Commerce) => c.id === Number(commerceId));
  
  if (currentCommerce) {
    commerce.value = currentCommerce;
    return true;
  }
  
  return false;
};

// Obtener la key de almacenamiento específica del comercio
const getStorageKey = (key: string) => {
  const commerceId = getCurrentCommerceId();
  return `commerce_${commerceId}_${key}`;
};

// Métricas calculadas
const metrics = computed(() => {
  const totalProducts = products.value.length;
  const totalStock = products.value.reduce((sum, product) => sum + product.quantity, 0);
  const totalValue = products.value.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const lowStockProducts = products.value.filter(product => product.quantity < 10).length;
  const outOfStockProducts = products.value.filter(product => product.quantity === 0).length;
  
  return {
    totalProducts,
    totalStock,
    totalValue,
    lowStockProducts,
    outOfStockProducts,
  };
});

// Función para cargar productos específicos del comercio
const loadProducts = async () => {
  try {
    isLoading.value = true;
    
    if (!validateCurrentCommerce()) {
      console.error('Comercio no encontrado o sin acceso');
      return;
    }

    const savedProducts = localStorage.getItem(getStorageKey('products'));
    if (savedProducts) {
      products.value = JSON.parse(savedProducts);
    } else {
      products.value = [];
    }
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    isLoading.value = false;
  }
};

const getProductEmoji = (name: string, description: string = ''): string => {
  const keywordMap = {
    cafe: '☕', pan: '🥖', pizza: '🍕', hamburguesa: '🍔',
    computadora: '💻', celular: '📱', libro: '📚', ropa: '👕',
    // ... (resto del mapa de emojis)
  };

  const searchText = (name + ' ' + description).toLowerCase();
  for (const [keyword, emoji] of Object.entries(keywordMap)) {
    if (searchText.includes(keyword)) return emoji;
  }
  return '📦';
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

onMounted(() => {
  loadProducts();
});
</script>
<template>
  <div class="inventory-dashboard">
    <!-- Sección de Alertas -->
    <div class="alerts-section" v-if="stockAlerts.hasCritical || stockAlerts.hasUltraWarning">
      <div class="alert critical" v-if="stockAlerts.hasCritical">
        <div class="alert-icon">
          <AlertOctagon :size="24" />
        </div>
        <div class="alert-content">
          <h4>¡Alerta Crítica de Inventario!</h4>
          <p>Tienes {{ stockAlerts.critical.length }} productos sin stock:</p>
          <ul>
            <li v-for="product in stockAlerts.critical" :key="product.id">
              {{ product.name }}
            </li>
          </ul>
        </div>
      </div>

      <div class="alert ultra-warning" v-if="stockAlerts.hasUltraWarning">
        <div class="alert-icon">
          <AlertTriangle :size="24" />
        </div>
        <div class="alert-content">
          <h4>¡Stock Extremadamente Bajo!</h4>
          <p>Tienes {{ stockAlerts.ultraWarning.length }} productos con menos de 5 unidades:</p>
          <ul>
            <li v-for="product in stockAlerts.ultraWarning" :key="product.id">
              {{ product.name }} ({{ product.quantity }} unidades)
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Sección de Métricas -->
    <div class="metrics-section">
      <h1 class="dashboard-title">Dashboard de Inventario</h1>
      
      <div class="metrics-grid">
        <!-- Total de Productos -->
        <div class="metric-card">
          <div class="metric-icon">
            <Package class="icon" />
          </div>
          <div class="metric-content">
            <h3>Total Productos</h3>
            <p class="metric-value">{{ metrics.totalProducts }}</p>
            <p class="metric-label">productos diferentes</p>
          </div>
        </div>

        <!-- Valor Total del Inventario -->
        <div class="metric-card">
          <div class="metric-icon">
            <DollarSign class="icon" />
          </div>
          <div class="metric-content">
            <h3>Valor Total</h3>
            <p class="metric-value">{{ formatCurrency(metrics.totalValue) }}</p>
            <p class="metric-label">en inventario</p>
          </div>
        </div>

        <!-- Stock Total -->
        <div class="metric-card">
          <div class="metric-icon">
            <TrendingUp class="icon" />
          </div>
          <div class="metric-content">
            <h3>Stock Total</h3>
            <p class="metric-value">{{ metrics.totalStock }}</p>
            <p class="metric-label">unidades totales</p>
          </div>
        </div>

        <!-- Productos con Stock Bajo -->
        <div class="metric-card warning">
          <div class="metric-icon">
            <AlertTriangle class="icon" />
          </div>
          <div class="metric-content">
            <h3>Stock Bajo</h3>
            <p class="metric-value">{{ metrics.lowStockProducts }}</p>
            <p class="metric-label">productos por acabarse</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Productos -->
    <div class="products-section">
      <div class="section-header">
        <h2>Lista de Productos en Inventario</h2>
      </div>
      
      <div v-if="isLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando inventario...</p>
      </div>

      <div v-else-if="products.length === 0" class="empty-state">
        <span><Package :size="90" /></span>
        <h3>No hay productos en inventario</h3>
        <p>Agrega productos para comenzar a gestionar tu inventario</p>
      </div>

      <div v-else class="inventory-grid">
        <div v-for="product in products" 
             :key="product.id" 
             class="inventory-card"
             :class="{ 
               'low-stock': product.quantity < 10,
               'critical-stock': product.quantity === 0,
               'ultra-warning-stock': product.quantity > 0 && product.quantity < 5
             }">
          <div class="product-info">
            <div class="product-image">
              <img v-if="product.image" 
                   :src="product.image" 
                   :alt="product.name" 
                   class="product-thumbnail">
              <div v-else 
                   class="product-emoji" 
                   :title="product.name">
                {{ getProductEmoji(product.name, product.description) }}
              </div>
            </div>
            <div class="product-details">
              <h3>{{ product.name }}</h3>
              <p class="stock-info">
                <span class="stock-quantity">{{ product.quantity }}</span>
                <span class="stock-unit">unidades</span>
              </p>
              <p class="stock-value">{{ formatCurrency(product.price * product.quantity) }}</p>
            </div>
          </div>
          <div class="stock-status" 
               :class="{ 
                 'critical': product.quantity === 0,
                 'ultra-warning': product.quantity > 0 && product.quantity < 5,
                 'warning': product.quantity >= 5 && product.quantity < 10,
                 'good': product.quantity >= 10 
               }">
            <template v-if="product.quantity === 0">
              ❌ Sin Stock
            </template>
            <template v-else-if="product.quantity > 0 && product.quantity < 5">
              🚨 ULTRA WARNING
            </template>
            <template v-else-if="product.quantity >= 5 && product.quantity < 10">
              ⚠️ Stock Bajo
            </template>
            <template v-else>
              ✔️ Stock Normal
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.inventory-dashboard {
  padding: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.metrics-section {
  margin-bottom: 3rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.metric-card {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease-out;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  background: rgba(134, 81, 231, 0.1);
  padding: 1rem;
  border-radius: 0.8rem;
  color: rgb(134, 81, 231);
}

.metric-card.warning .metric-icon {
  background: rgba(255, 159, 67, 0.1);
  color: rgb(255, 159, 67);
}

.alerts-section {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.8rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  animation: slideIn 0.3s ease-out;
}

.alert.critical {
  background: linear-gradient(to right, 
    rgba(255, 71, 87, 0.2),
    rgba(255, 71, 87, 0.1)
  );
  border-left: 4px solid rgb(255, 71, 87);
}

.alert.ultra-warning {
  background: linear-gradient(to right,
    rgba(255, 159, 67, 0.2),
    rgba(255, 159, 67, 0.1)
  );
  border-left: 4px solid rgb(255, 159, 67);
}

.alert-icon {
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert.critical .alert-icon {
  color: rgb(255, 71, 87);
  background: rgba(255, 71, 87, 0.2);
}

.alert.ultra-warning .alert-icon {
  color: rgb(255, 159, 67);
  background: rgba(255, 159, 67, 0.2);
}

.alert-content {
  flex: 1;
}

.alert-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.alert-content p {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.alert-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alert-content li {
  color: var(--text-secondary);
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Update your existing stock-status styles */
.stock-status.critical {
  background: rgba(255, 71, 87, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 71, 87, 0.4);
}

.stock-status.ultra-warning {
  background: rgba(255, 159, 67, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 159, 67, 0.4);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .alert {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem;
  }
  
  .alert-icon {
    margin-bottom: 0.5rem;
  }
}

.metric-content h3 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.inventory-card {
  background: var(--bg-secondary);
  border-radius: 0.8rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease-out;
}

.inventory-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 0.5rem;
  object-fit: cover;
}

.product-details h3 {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.stock-quantity {
  font-weight: 600;
  color: var(--text-primary);
}

.stock-unit {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.stock-value {
  color: rgb(134, 81, 231);
  font-size: 0.9rem;
  font-weight: 500;
}

.stock-status {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.stock-status.critical {
background: rgba(255, 71, 87, 0.2);
color: #fff;
}

.stock-status.ultra-warning {
  background: rgba(255, 159, 67, 0.2);
  color: #fff;
}

.stock-status.warning {
  background: rgba(255, 159, 67, 0.1);
  color: #fff;
}

.stock-status.good {
background: rgba(46, 213, 115, 0.3);
color: #fff;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state h3 {
  margin: 1rem 0;
  color: var(--text-primary);
}


@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .inventory-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: 1rem;
  }
}
</style>