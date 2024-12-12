<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Line as LineChart } from 'vue-chartjs';
import { Box } from 'lucide-vue-next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const route = useRoute();
const products = ref<Product[]>([]);
const currentForecastPeriod = ref('6 Meses');
const forecastPeriods = ['3 Meses', '6 Meses', '1 Año'];

// Get commerce-specific storage key
const getStorageKey = (key: string) => {
  const commerceId = route.params.id;
  return `commerce_${commerceId}_${key}`;
};

// Load products from commerce
const loadProducts = async () => {
  try {
    const storageKey = getStorageKey('products');
    const savedProducts = localStorage.getItem(storageKey);
    if (savedProducts) {
      products.value = JSON.parse(savedProducts);
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

// Computed metrics
const inventoryMetrics = computed(() => {
  const totalProducts = products.value.length;
  const totalStock = products.value.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.value.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStockProducts = products.value.filter(p => p.quantity < 10).length;
  const criticalStock = products.value.filter(p => p.quantity === 0).length;
  const avgPrice = totalProducts > 0 ? totalValue / totalStock : 0;

  return {
    totalProducts,
    totalStock,
    totalValue,
    lowStockProducts,
    criticalStock,
    avgPrice
  };
});

// AI Insights based on real data
const aiInsights = computed(() => [
  {
    title: 'Valor del Inventario',
    description: 'Valor total en stock',
    value: formatCurrency(inventoryMetrics.value.totalValue),
    percentage: 0,
    trend: 'up',
    icon: 'fas fa-dollar-sign',
    color: 'rgba(134, 81, 231, 0.2)'
  },
  {
    title: 'Stock Total',
    description: 'Unidades totales',
    value: `${inventoryMetrics.value.totalStock} unidades`,
    percentage: 0,
    trend: 'up',
    icon: 'fas fa-box',
    color: 'rgba(52, 211, 153, 0.2)'
  },
  {
    title: 'Productos en Riesgo',
    description: 'Stock bajo o crítico',
    value: `${inventoryMetrics.value.lowStockProducts} productos`,
    percentage: (inventoryMetrics.value.lowStockProducts / inventoryMetrics.value.totalProducts) * 100,
    trend: 'down',
    icon: 'fas fa-exclamation-triangle',
    color: 'rgba(239, 68, 68, 0.2)'
  },
  {
    title: 'Precio Promedio',
    description: 'Por unidad',
    value: formatCurrency(inventoryMetrics.value.avgPrice),
    percentage: 0,
    trend: 'up',
    icon: 'fas fa-tags',
    color: 'rgba(59, 130, 246, 0.2)'
  }
]);

// Low stock products
const lowStockProducts = computed(() => {
  return products.value.filter(p => p.quantity < 10);
});

// Top products based on value
const sortedProducts = computed(() => {
  return [...products.value].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity));
});

const topProducts = computed(() => {
  return sortedProducts.value
    .slice(0, 3)
    .map((product, index) => ({
      id: product.id,
      rank: `#${index + 1}`,
      name: product.name,
      image: product.image || '/api/placeholder/100/100',
      description: product.description,
      revenue: product.price * product.quantity,
      quantity: product.quantity,
      progress: 100 - (index * 15), // Decrease progress for each rank
      color: index === 0 ? 'rgb(134, 81, 231)' : 
             index === 1 ? 'rgb(52, 211, 153)' : 'rgb(59, 130, 246)'
    }));
});

// Chart data
const generateChartData = () => {
  // Example data - you would replace this with real historical data
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const baseValue = inventoryMetrics.value.totalValue / 6;

  return months.map((month, index) => ({
    month,
    value: baseValue + (baseValue * Math.sin(index) * 0.3)
  }));
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#ffffff'
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ffffff'
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#ffffff'
      }
    }
  }
};

const salesChartData = computed(() => {
  const data = generateChartData();
  return {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Valor del Inventario',
        data: data.map(d => d.value),
        borderColor: 'rgb(134, 81, 231)',
        backgroundColor: 'rgba(134, 81, 231, 0.5)',
        tension: 0.4
      }
    ]
  };
});

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const getProductEmoji = (name: string, description: string) => {
  if (name.toLowerCase().includes('apple')) return '🍎';
  if (description.toLowerCase().includes('fresh')) return '🌿';
  return '📦';
};

onMounted(() => {
  loadProducts();
});
</script>
<template>
  <div class="overview-dashboard">
    <!-- AI Generated Insights -->
    <section class="ai-insights">
      <div class="insight-header">
        <h3>Resumen del Negocio</h3>
      </div>
      <div class="insights-grid">
        <div v-for="(insight, index) in aiInsights" :key="index" class="insight-card">
          <div class="insight-icon" :style="{ background: insight.color }">
            <Box />
          </div>
          <div class="insight-content">
            <h4>{{ insight.title }}</h4>
            <p>{{ insight.description }}</p>
            <span class="insight-value">{{ insight.value }}</span>
            <span v-if="insight.percentage > 0" class="insight-trend" :class="insight.trend">
              <i :class="insight.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ insight.percentage.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </section>

    <div class="flex-container">
      <!-- Top Products Section -->
      <section class="top-products panel" v-if="topProducts.length > 0">
        <div class="section-header">
          <h3>Productos con Mayor Valor</h3>
        </div>
        <div class="products-list">
          <div v-for="product in topProducts" :key="product.id" class="product-card">
            <div class="product-rank" :style="{ backgroundColor: product.color + '20' }">
              {{ product.rank }}
            </div>
            <div class="product-emoji-container">
              {{ getProductEmoji(product.name, product.description) }}
            </div>
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <p class="product-stats">
                <span class="product-revenue">{{ formatCurrency(product.revenue) }}</span>
                <span class="product-quantity">{{ product.quantity }} unidades</span>
              </p>
              <div class="progress-bar">
                <div class="progress" 
                     :style="{ width: `${product.progress}%`, backgroundColor: product.color }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stock Status Section -->
      <section class="stock-status panel">
        <div class="section-header">
          <h3>Estado del Inventario</h3>
        </div>
        <div class="status-cards">
          <div class="status-card critical">
            <div class="status-icon">
              <Box />
            </div>
            <div class="status-info">
              <h4>Sin Stock</h4>
              <p>{{ inventoryMetrics.criticalStock }} productos</p>
            </div>
          </div>
          <div class="status-card warning">
            <div class="status-icon">
              <Box />
            </div>
            <div class="status-info">
              <h4>Stock Bajo</h4>
              <p>{{ inventoryMetrics.lowStockProducts }} productos</p>
            </div>
          </div>
          <div class="status-card info">
            <div class="status-icon">
              <Box />
            </div>
            <div class="status-info">
              <h4>Stock Total</h4>
              <p>{{ inventoryMetrics.totalStock }} unidades</p>
            </div>
          </div>
        </div>

        <!-- Low Stock Alerts -->
        <div class="low-stock-list" v-if="lowStockProducts.length > 0">
          <h4>Productos en Riesgo</h4>
          <div class="alert-card" v-for="product in lowStockProducts" :key="product.id">
            <div class="alert-emoji">
              {{ getProductEmoji(product.name, product.description) }}
            </div>
            <div class="alert-content">
              <h5>{{ product.name }}</h5>
              <p>{{ product.quantity === 0 ? 'Sin stock' : `${product.quantity} unidades` }}</p>
            </div>
            <div class="alert-status" :class="{ 'critical': product.quantity === 0 }">
              {{ product.quantity === 0 ? '❌' : '⚠️' }}
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Inventory Value Chart -->
    <section class="inventory-chart panel">
      <div class="section-header">
        <h3>Valor del Inventario</h3>
        <div class="chart-controls">
          <button 
            v-for="period in forecastPeriods" 
            :key="period"
            @click="currentForecastPeriod = period"
            :class="['period-button', { active: currentForecastPeriod === period }]"
          >
            {{ period }}
          </button>
        </div>
      </div>
      <div class="chart-container">
        <LineChart 
          :data="salesChartData" 
          :options="chartOptions"
          class="sales-chart"
        />
      </div>
    </section>
  </div>
</template>
<style scoped>
.overview-dashboard {
  display: grid;
  gap: 2rem;
}

.ai-insights {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.insight-header h3 {
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.refresh-button {
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.refresh-button:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.insight-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
}

.insight-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.insight-content h4 {
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.insight-content p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.insight-value {
  display: block;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.insight-trend {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.insight-trend.up {
  color: rgb(52, 211, 153);
}

.insight-trend.down {
  color: rgb(239, 68, 68);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.section-header select {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  cursor: pointer;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.product-card {
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-rank {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 40px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-info h4 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  transition: width 0.3s ease;
}

.sales-forecast {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.period-button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-button.active {
  background: rgba(134, 81, 231, 0.2);
  color: var(--text-primary);
  border-color: rgba(134, 81, 231, 0.4);
}

.period-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.chart-container {
  height: 400px;
  margin-top: 1.5rem;
  position: relative;
}

.sales-chart {
  width: 100%;
  height: 100%;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .insights-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .overview-dashboard {
    gap: 1.5rem;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .chart-controls {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .period-button {
    white-space: nowrap;
  }

  .product-card {
    flex-direction: column;
    text-align: center;
  }

  .product-rank {
    min-width: auto;
  }

  .product-stats {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}

/* Loading States */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(134, 81, 231, 0.3);
  border-top-color: rgb(134, 81, 231);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Tooltip Styles */
.tooltip {
  position: absolute;
  background: var(--bg-secondary);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  color: var(--text-primary);
  z-index: 100;
  pointer-events: none;
}

/* Additional Card Styles */
.info-card {
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card:hover {
  border-color: rgba(134, 81, 231, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Badge Styles */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-success {
  background: rgba(52, 211, 153, 0.2);
  color: rgb(52, 211, 153);
}

.badge-warning {
  background: rgba(251, 191, 36, 0.2);
  color: rgb(251, 191, 36);
}

.badge-danger {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(239, 68, 68);
}

/* Table Styles for Additional Data */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.data-table th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
}

.data-table td {
  color: var(--text-primary);
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(134, 81, 231, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(134, 81, 231, 0.5);
}

.overview-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
}

.flex-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
}

.panel {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
}

/* Insights Grid */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.insight-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.insight-card:hover {
  transform: translateY(-2px);
}

/* Product Cards */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-emoji-container {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: rgba(134, 81, 231, 0.1);
  border-radius: 0.5rem;
}

/* Status Cards */
.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Low Stock Alerts */
.low-stock-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-emoji {
  font-size: 1.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(134, 81, 231, 0.1);
  border-radius: 0.5rem;
}

/* Chart Section */
.chart-container {
  height: 300px;
  margin-top: 1rem;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .flex-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .overview-dashboard {
    padding: 1rem;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .status-cards {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .chart-controls {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .product-card {
    flex-direction: column;
    text-align: center;
  }

  .alert-card {
    flex-direction: column;
    text-align: center;
  }
}

/* Print Styles */
@media print {
  .overview-dashboard {
    background: white;
    color: black;
  }

  .chart-controls,
  .refresh-button,
  .section-header select {
    display: none;
  }

  .chart-container {
    break-inside: avoid;
  }
}
</style>