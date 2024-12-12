<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Trash, Pencil, Plus, Package, Box, DollarSign } from 'lucide-vue-next';

interface Provider {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

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
const providers = ref<Provider[]>([]);
const products = ref<Product[]>([]);
const showCreateForm = ref(false);
const isEditing = ref(false);
const currentProvider = ref<Provider | null>(null);
const isLoading = ref(true);

const newProvider = ref({
  name: '',
  contact: '',
  email: '',
  phone: '',
  address: ''
});

// Get storage key with commerce ID
const getStorageKey = (key: string) => {
  const commerceId = route.params.id;
  return `commerce_${commerceId}_${key}`;
};

// Load providers and products
const loadData = async () => {
  try {
    isLoading.value = true;
    
    // Load providers
    const savedProviders = localStorage.getItem(getStorageKey('providers'));
    if (savedProviders) {
      providers.value = JSON.parse(savedProviders);
    }

    // Load products
    const savedProducts = localStorage.getItem(getStorageKey('products'));
    if (savedProducts) {
      products.value = JSON.parse(savedProducts);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Computed property for provider statistics
const providerStats = computed(() => {
  return providers.value.map(provider => {
    const providerProducts = products.value.filter(p => p.providerId === provider.id);
    const totalProducts = providerProducts.length;
    const totalValue = providerProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStock = providerProducts.filter(p => p.quantity < 10).length;

    return {
      ...provider,
      totalProducts,
      totalValue,
      lowStock
    };
  });
});

const openCreateForm = () => {
  isEditing.value = false;
  currentProvider.value = null;
  newProvider.value = {
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  };
  showCreateForm.value = true;
};

const openEditForm = (provider: Provider) => {
  isEditing.value = true;
  currentProvider.value = provider;
  newProvider.value = { ...provider };
  showCreateForm.value = true;
};

const handleSubmit = () => {
  if (isEditing.value && currentProvider.value) {
    const index = providers.value.findIndex(p => p.id === currentProvider.value?.id);
    if (index !== -1) {
      providers.value[index] = {
        ...providers.value[index],
        ...newProvider.value
      };
    }
  } else {
    providers.value.push({
      id: Date.now(),
      ...newProvider.value
    });
  }

  // Save to localStorage
  localStorage.setItem(getStorageKey('providers'), JSON.stringify(providers.value));
  showCreateForm.value = false;
};

const deleteProvider = (id: number) => {
  if (confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
    providers.value = providers.value.filter(p => p.id !== id);
    localStorage.setItem(getStorageKey('providers'), JSON.stringify(providers.value));
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="providers-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div>
        <h2>Proveedores</h2>
        <p>Gestiona tus proveedores y sus productos asociados</p>
      </div>
      <button @click="openCreateForm" class="add-button">
        <Plus class="icon" />
        Nuevo Proveedor
      </button>
    </div>

    <!-- Provider Cards -->
    <div class="providers-grid">
      <div v-for="provider in providerStats" 
           :key="provider.id" 
           class="provider-card">
        <div class="provider-header">
          <div class="provider-info">
            <h3>{{ provider.name }}</h3>
            <span class="provider-contact">{{ provider.contact }}</span>
          </div>
          <div class="provider-actions">
            <button @click="openEditForm(provider)" class="icon-button edit">
              <Pencil :size="18" />
            </button>
            <button @click="deleteProvider(provider.id)" class="icon-button delete">
              <Trash :size="18" />
            </button>
          </div>
        </div>

        <div class="provider-metrics">
          <div class="metric">
            <Package class="metric-icon" />
            <div class="metric-info">
              <span class="metric-value">{{ provider.totalProducts }}</span>
              <span class="metric-label">Productos</span>
            </div>
          </div>
          <div class="metric">
            <DollarSign class="metric-icon" />
            <div class="metric-info">
              <span class="metric-value">{{ formatCurrency(provider.totalValue) }}</span>
              <span class="metric-label">Valor Total</span>
            </div>
          </div>
          <div class="metric" v-if="provider.lowStock > 0">
            <Box class="metric-icon warning" />
            <div class="metric-info">
              <span class="metric-value">{{ provider.lowStock }}</span>
              <span class="metric-label">Stock Bajo</span>
            </div>
          </div>
        </div>

        <div class="provider-details">
          <div class="detail-item">
            <i class="fas fa-envelope"></i>
            <span>{{ provider.email }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-phone"></i>
            <span>{{ provider.phone }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ provider.address }}</span>
          </div>
        </div>

        <!-- Provider Products -->
        <div class="provider-products" v-if="products.filter(p => p.providerId === provider.id).length">
          <h4>Productos Suministrados</h4>
          <div class="products-table">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products.filter(p => p.providerId === provider.id)"
                    :key="product.id"
                    :class="{ 'low-stock': product.quantity < 10 }">
                  <td>{{ product.name }}</td>
                  <td>{{ product.quantity }}</td>
                  <td>{{ formatCurrency(product.price * product.quantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
      <div class="modal-form">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h3>
          <button @click="showCreateForm = false" class="close-button">×</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="provider-form">
          <div class="form-group">
            <label>Nombre del Proveedor *</label>
            <input v-model="newProvider.name" required type="text" />
          </div>

          <div class="form-group">
            <label>Contacto Principal *</label>
            <input v-model="newProvider.contact" required type="text" />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="newProvider.email" required type="email" />
          </div>

          <div class="form-group">
            <label>Teléfono *</label>
            <input v-model="newProvider.phone" required type="tel" />
          </div>

          <div class="form-group">
            <label>Dirección *</label>
            <input v-model="newProvider.address" required type="text" />
          </div>

          <div class="form-actions">
            <button type="button" @click="showCreateForm = false" class="cancel-button">
              Cancelar
            </button>
            <button type="submit" class="submit-button">
              {{ isEditing ? 'Guardar Cambios' : 'Crear Proveedor' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.providers-dashboard {
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.provider-card {
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.provider-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.metric-icon {
  color: rgb(134, 81, 231);
}

.metric-icon.warning {
  color: rgb(234, 179, 8);
}

.provider-products {
  margin-top: 1rem;
}

.products-table {
  overflow-x: auto;
  margin-top: 0.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

tr.low-stock {
  color: rgb(234, 179, 8);
}

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgb(134, 81, 231);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-button {
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #999;
  color: var(--text-secondary);
}

.icon-button.edit:hover {
  background: rgba(134, 81, 231, 0.1);
  color: rgb(134, 81, 231);
}

.icon-button.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 1000;
}

.modal-form {
  background: var(--bg-secondary);
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.provider-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group input {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-button, .cancel-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button {
  background: rgb(134, 81, 231);
  color: white;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .providers-dashboard {
    padding: 1rem;
  }

  .providers-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }

  .provider-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-form {
    max-height: 85vh;
  }
}

@media (max-width: 480px) {
  .provider-metrics {
    grid-template-columns: 1fr;
  }

  .provider-header {
    flex-direction: column;
    gap: 1rem;
  }

  .provider-actions {
    display: flex;
    width: 100%;
    gap: 0.5rem;
  }

  .icon-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
  }

  .products-table {
    margin: 0 -1.5rem;
    width: calc(100% + 3rem);
  }

  table {
    font-size: 0.875rem;
  }

  th, td {
    padding: 0.5rem 0.75rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-button, .cancel-button {
    width: 100%;
  }
}

/* Animation and Transition Styles */
.provider-card {
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease-out;
}

.provider-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.metric {
  transition: all 0.3s ease;
}

.metric:hover {
  transform: scale(1.02);
}

.modal-form {
  animation: slideUp 0.3s ease-out;
}

/* Status Indicators */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-active {
  background: rgba(52, 211, 153, 0.2);
  color: rgb(52, 211, 153);
}

.status-inactive {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(239, 68, 68);
}

/* Table Enhancements */
.products-table {
  position: relative;
}

.table-wrapper {
  overflow-x: auto;
  margin: 0 -1px;
}

table tr {
  transition: background-color 0.2s ease;
}

table tr:hover {
  background: rgba(134, 81, 231, 0.05);
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

/* Empty States */
.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 1rem;
  margin-top: 1rem;
}

.empty-state-icon {
  font-size: 3rem;
  color: rgb(134, 81, 231);
  margin-bottom: 1rem;
}

.empty-state-text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* Search and Filter */
.search-container {
  position: relative;
  max-width: 300px;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

/* Animations */
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Accessibility Enhancements */
.icon-button:focus-visible,
.add-button:focus-visible,
.submit-button:focus-visible,
.cancel-button:focus-visible {
  outline: 2px solid rgb(134, 81, 231);
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .providers-dashboard {
    background: white;
    color: black;
  }

  .add-button,
  .provider-actions,
  .modal-overlay {
    display: none;
  }

  .provider-card {
    break-inside: avoid;
    border: 1px solid #ddd;
  }

  .products-table {
    break-inside: avoid;
  }
}

/* Custom Scrollbar */
.modal-form::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.modal-form::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
}

.modal-form::-webkit-scrollbar-thumb {
  background: rgba(134, 81, 231, 0.3);
  border-radius: 4px;
}

.modal-form::-webkit-scrollbar-thumb:hover {
  background: rgba(134, 81, 231, 0.5);
}

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
  font-family: "Poppins", sans-serif;
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
