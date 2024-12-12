<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Map, Clock, DollarSign, Truck, Users, Search } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import L from 'leaflet';

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

interface DeliveryProduct {
  id: number;
  name: string;
  quantity: number;
  weight: number;
  price: number;
}

interface Delivery {
  id: number;
  address: string;
  coordinates: [number, number];
  products: DeliveryProduct[];
  timeWindow: {
    start: string;
    end: string;
  };
}

interface RouteNode {
  id: number;
  coordinates: [number, number];
  distance: number;
  previous: RouteNode | null;
  visited: boolean;
}

interface RouteMetrics {
  distance: number;
  estimatedTime: number;
  fuelCost: number;
  laborCost: number;
  totalCost: number;
}

interface SearchResult {
  display_name: string;
  coordinates: [number, number];
}

const route = useRoute();
const deliveries = ref<Delivery[]>([]);
const map = ref<LeafletMap | null>(null);
const routeLayer = ref<LayerGroup<any>>(L.layerGroup());
const selectedRoute = ref<RouteNode[]>([]);
const metrics = ref<RouteMetrics | null>(null);
const isCalculating = ref(false);
const userLocation = ref<[number, number] | null>(null);
const availableProducts = ref<Product[]>([]);
const selectedProducts = ref<DeliveryProduct[]>([]);
const searchAddress = ref('');
const searchResults = ref<SearchResult[]>([]);
const isSearching = ref(false);
const watchId = ref<number | null>(null);

// Map configuration
const mapConfig = {
  center: [4.6097, -74.0817] as [number, number], // Bogotá
  zoom: 12,
  maxZoom: 18,
};

const COSTS = {
  fuelPerKm: 1000,
  laborPerHour: 15000,
  averageSpeed: 30,
} as const;

// Get commerce-specific storage key
const getStorageKey = (key: string): string => {
  const commerceId = route.params.id;
  return `commerce_${commerceId}_${key}`;
};

// Load products from correct commerce
const loadAvailableProducts = async (): Promise<void> => {
  try {
    const storageKey = getStorageKey('products');
    const savedProducts = localStorage.getItem(storageKey);
    if (savedProducts) {
      availableProducts.value = JSON.parse(savedProducts);
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

// Geolocation functions
const startLocationTracking = (): void => {
  if ('geolocation' in navigator) {
    watchId.value = navigator.geolocation.watchPosition(
      (position) => {
        userLocation.value = [position.coords.latitude, position.coords.longitude];
        if (map.value) {
          updateUserLocationMarker();
          if (deliveries.value.length === 0) {
            map.value.setView(userLocation.value, 15);
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }
};

const stopLocationTracking = (): void => {
  if (watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value);
    watchId.value = null;
  }
};

// Map functions
const initializeMap = (): void => {
  if (!map.value) {
    const mapElement = document.getElementById('route-map');
    if (!mapElement) return;
    
    map.value = L.map(mapElement).setView(mapConfig.center, mapConfig.zoom);
    // @ts-ignore
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.value);
    // @ts-ignore
    routeLayer.value = L.layerGroup().addTo(map.value);
  }
};

const updateUserLocationMarker = (): void => {
  if (!map.value || !userLocation.value) return;

  routeLayer.value.clearLayers();

  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div class="user-marker-inner"></div>',
  });

  const marker = L.marker(userLocation.value, { icon: userIcon });
  //@ts-ignore
  marker.addTo(routeLayer.value).bindPopup('Tu ubicación actual');

  if (deliveries.value.length > 0) {
    drawRoute(selectedRoute.value);
  }
};

// Get emoji for products without images
const getProductEmoji = (name: string, description: string = ''): string => {
  const keywordMap: Record<string, string> = {
    // Food and Beverages
    cafe: '☕', pan: '🥖', pizza: '🍕', hamburguesa: '🍔', sushi: '🍱', 
    helado: '🍦', pastel: '🍰', chocolate: '🍫', galleta: '🍪', refresco: '🥤',
    cerveza: '🍺', vino: '🍷', jugo: '🧃', agua: '💧', leche: '🥛',
    
    // Fruits and Vegetables
    manzana: '🍎', platano: '🍌', naranja: '🍊', limon: '🍋', zanahoria: '🥕',
    tomate: '🍅', papa: '🥔', cebolla: '🧅', ajo: '🧄', fruta: '🍎',
    
    // Clothing and Accessories
    camisa: '👕', pantalon: '👖', vestido: '👗', zapato: '👞', gorra: '🧢',
    bufanda: '🧣', guante: '🧤', bolso: '👜', reloj: '⌚', joya: '💎',
    
    // Technology
    computadora: '💻', celular: '📱', tablet: '📱', audifono: '🎧', television: '📺',
    camara: '📸', impresora: '🖨️', juego: '🎮', bateria: '🔋', cable: '🔌',
    
    // Cleaning and Hygiene
    jabon: '🧼', papel: '🧻', cepillo: '🪥', crema: '🧴', perfume: '💨',
    
    // Others
    libro: '📚', cuaderno: '📓', lapiz: '✏️', tijera: '✂️', llave: '🔑',
    medicina: '💊', herramienta: '🔧', pintura: '🎨', planta: '🌱', flor: '💐',
    regalo: '🎁', mascota: '🐾', juguete: '🎲', deporte: '⚽', musica: '🎵'
  };

  const searchText = (name + ' ' + description).toLowerCase();
  
  for (const [keyword, emoji] of Object.entries(keywordMap)) {
    if (searchText.includes(keyword)) return emoji;
  }

  if (searchText.includes('kit') || searchText.includes('set')) return '🎁';
  if (searchText.includes('pack') || searchText.includes('paquete')) return '📦';
  if (searchText.includes('premium') || searchText.includes('especial')) return '⭐';
  
  return '📦';
};

const addProductToDelivery = (product: Product): void => {
  if (product.quantity <= 0) return;

  const existingProduct = selectedProducts.value.find(p => p.id === product.id);
  
  if (existingProduct) {
    if (existingProduct.quantity < product.quantity) {
      existingProduct.quantity += 1;
    }
  } else {
    selectedProducts.value.push({
      id: product.id,
      name: product.name,
      quantity: 1,
      weight: product.weight,
      price: product.price
    });
  }
};

const removeProductFromDelivery = (productId: number): void => {
  const index = selectedProducts.value.findIndex(p => p.id === productId);
  if (index !== -1) {
    if (selectedProducts.value[index].quantity > 1) {
      selectedProducts.value[index].quantity -= 1;
    } else {
      selectedProducts.value.splice(index, 1);
    }
  }
};

// Address search functions
const searchAddressLocation = async (): Promise<void> => {
  if (!searchAddress.value) return;
  
  isSearching.value = true;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress.value)}`
    );
    const data = await response.json();
    searchResults.value = data.map((result: any) => ({
      display_name: result.display_name,
      coordinates: [parseFloat(result.lat), parseFloat(result.lon)] as [number, number]
    }));
  } catch (error) {
    console.error('Error searching address:', error);
  } finally {
    isSearching.value = false;
  }
};

const selectDeliveryLocation = (result: SearchResult): void => {
  if (!userLocation.value) return;

  const newDelivery: Delivery = {
    id: Date.now(),
    address: result.display_name,
    coordinates: result.coordinates,
    products: [...selectedProducts.value],
    timeWindow: { start: "09:00", end: "18:00" }
  };
  
  deliveries.value = [
    {
      id: 0,
      address: "Punto de Partida",
      coordinates: userLocation.value,
      products: [],
      timeWindow: { start: "09:00", end: "18:00" }
    },
    newDelivery
  ];

  searchResults.value = [];
  searchAddress.value = '';
  selectedProducts.value = [];
  calculateOptimalRoute();
};

// Route calculation functions
const calculateDistance = (
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => (deg * Math.PI) / 180;

const findOptimalRoute = (deliveries: Delivery[]): RouteNode[] => {
  const nodes: RouteNode[] = deliveries.map(delivery => ({
    id: delivery.id,
    coordinates: delivery.coordinates,
    distance: Infinity,
    previous: null,
    visited: false,
  }));

  nodes[0].distance = 0;

  while (nodes.some(n => !n.visited)) {
    const current = nodes
      .filter(n => !n.visited)
      .reduce((min, node) => 
        node.distance < min.distance ? node : min, 
        { distance: Infinity } as RouteNode
      );

    if (current.distance === Infinity) break;

    current.visited = true;

    nodes
      .filter(n => !n.visited)
      .forEach(neighbor => {
        const distance = calculateDistance(
          current.coordinates,
          neighbor.coordinates
        );
        const totalDistance = current.distance + distance;

        if (totalDistance < neighbor.distance) {
          neighbor.distance = totalDistance;
          neighbor.previous = current;
        }
      });
  }

  return reconstructRoute(nodes);
};

const reconstructRoute = (nodes: RouteNode[]): RouteNode[] => {
  const route: RouteNode[] = [];
  let current = nodes[nodes.length - 1];

  while (current) {
    route.unshift(current);
    current = current.previous as RouteNode;
  }

  return route;
};

const calculateMetrics = (route: RouteNode[]): RouteMetrics => {
  const distance = route.reduce((total, node, i) => {
    if (i === 0) return 0;
    return total + calculateDistance(
      route[i - 1].coordinates,
      node.coordinates
    );
  }, 0);

  const estimatedTime = distance / COSTS.averageSpeed;
  const fuelCost = distance * COSTS.fuelPerKm;
  const laborCost = estimatedTime * COSTS.laborPerHour;
  const totalCost = fuelCost + laborCost;

  return {
    distance,
    estimatedTime,
    fuelCost,
    laborCost,
    totalCost,
  };
};

const drawRoute = (route: RouteNode[]): void => {
  if (!map.value || !routeLayer.value) return;

  routeLayer.value.clearLayers();

  const coordinates = route.map(node => node.coordinates);
  L.polyline(coordinates, {
    color: '#8651E7',
    weight: 4,
    opacity: 0.8,
  // @ts-ignore
  }).addTo(routeLayer.value);

  route.forEach((node, index) => {
    const isFirst = index === 0;
    const isLast = index === route.length - 1;
    
    L.marker(node.coordinates, {
      icon: L.divIcon({
        className: `marker-icon ${isFirst ? 'start' : isLast ? 'end' : ''}`,
        html: `<div class="marker-number">${index + 1}</div>`,
      }),
      // @ts-ignore
    }).addTo(routeLayer.value);
  });

  const bounds = L.latLngBounds(coordinates);
  map.value.fitBounds(bounds, { padding: [50, 50] });
};

const calculateOptimalRoute = async (): Promise<void> => {
  if (deliveries.value.length < 2) return;
  
  isCalculating.value = true;
  try {
    const optimalRoute = findOptimalRoute(deliveries.value);
    selectedRoute.value = optimalRoute;
    metrics.value = calculateMetrics(optimalRoute);
    drawRoute(optimalRoute);
  } catch (error) {
    console.error('Error calculating route:', error);
  } finally {
    isCalculating.value = false;
  }
};

const formatTime = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Lifecycle hooks
onMounted(async () => {
  await loadAvailableProducts();
  initializeMap();
  startLocationTracking();
});

onUnmounted(() => {
  stopLocationTracking();
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});
</script>
<template>
  <div class="route-optimization">
    <!-- Horizontal Metrics Panel -->
    <div v-if="metrics && deliveries.length > 1" class="metrics-panel">
      <div class="metrics-container">
        <!-- Distancia Total -->
        <div class="metric-card">
          <Map class="metric-icon" />
          <div class="metric-content">
            <h3>Distancia Total</h3>
            <p class="metric-value">{{ metrics.distance.toFixed(1) }} km</p>
          </div>
        </div>

        <!-- Tiempo Estimado -->
        <div class="metric-card">
          <Clock class="metric-icon" />
          <div class="metric-content">
            <h3>Tiempo Estimado</h3>
            <p class="metric-value">{{ formatTime(metrics.estimatedTime) }}</p>
          </div>
        </div>

        <!-- Costo de Combustible -->
        <div class="metric-card">
          <Truck class="metric-icon" />
          <div class="metric-content">
            <h3>Costo de Combustible</h3>
            <p class="metric-value">{{ formatCurrency(metrics.fuelCost) }}</p>
          </div>
        </div>

        <!-- Costo de Personal -->
        <div class="metric-card">
          <Users class="metric-icon" />
          <div class="metric-content">
            <h3>Costo de Personal</h3>
            <p class="metric-value">{{ formatCurrency(metrics.laborCost) }}</p>
          </div>
        </div>

        <!-- Costo Total -->
        <div class="metric-card total">
          <DollarSign class="metric-icon" />
          <div class="metric-content">
            <h3>Costo Total</h3>
            <p class="metric-value">{{ formatCurrency(metrics.totalCost) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Panel de Selección -->
      <div class="selection-panel">
        <h2>Selección de Productos</h2>
        
        <!-- Lista de Productos Disponibles -->
        <div class="products-list">
          <div v-for="product in availableProducts" 
               :key="product.id" 
               class="product-item">
            <div class="product-info">
              <div v-if="product.image" class="product-thumbnail">
                <img :src="product.image" :alt="product.name">
              </div>
              <div v-else class="product-emoji">
                {{ getProductEmoji(product.name, product.description) }}
              </div>
              <div>
                <h3>{{ product.name }}</h3>
                <p>Stock: {{ product.quantity }}</p>
                <p>{{ formatCurrency(product.price) }}</p>
              </div>
            </div>
            <button @click="addProductToDelivery(product)"
                    :disabled="product.quantity <= 0"
                    class="add-product-btn">
              Agregar
            </button>
          </div>
        </div>

        <!-- Productos Seleccionados -->
        <div v-if="selectedProducts.length > 0" class="selected-products">
          <h3>Productos Seleccionados</h3>
          <div v-for="product in selectedProducts" 
               :key="product.id" 
               class="selected-product-item">
            <div class="selected-product-info">
              <span>{{ product.name }}</span>
              <span>x{{ product.quantity }}</span>
              <span>{{ formatCurrency(product.price * product.quantity) }}</span>
            </div>
            <button @click="removeProductFromDelivery(product.id)"
                    class="remove-product-btn">
              Remover
            </button>
          </div>
          <div class="selected-products-total">
            <strong>Total:</strong>
            <span>{{ formatCurrency(
              selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)
            ) }}</span>
          </div>
        </div>

        <!-- Búsqueda de Dirección -->
        <div class="address-search">
          <h3>Dirección de Entrega</h3>
          <div class="search-input">
            <input v-model="searchAddress" 
                   type="text" 
                   placeholder="Ingrese la dirección de entrega"
                   @keyup.enter="searchAddressLocation">
            <button @click="searchAddressLocation"
                    :disabled="isSearching || !searchAddress"
                    class="search-btn">
              <Search v-if="!isSearching" />
              <div v-else class="spinner-small"></div>
            </button>
          </div>
          
          <!-- Resultados de búsqueda -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="result in searchResults"
                 :key="result.display_name"
                 class="search-result-item"
                 @click="selectDeliveryLocation(result)">
              {{ result.display_name }}
            </div>
          </div>
        </div>

        <!-- Botón de Cálculo -->
        <button 
          v-if="deliveries.length > 1"
          @click="calculateOptimalRoute"
          class="calculate-button"
          :disabled="isCalculating || !userLocation"
        >
          <span v-if="!userLocation">Activar ubicación para calcular</span>
          <span v-else-if="isCalculating">Calculando...</span>
          <span v-else>Recalcular Ruta Óptima</span>
        </button>
      </div>

      <!-- Contenedor del Mapa -->
      <div class="map-container">
        <div id="route-map"></div>
        <div v-if="!userLocation" class="location-warning">
          <p>Activar la ubicación para comenzar</p>
        </div>

        <!-- Estado de Cálculo -->
        <div v-if="isCalculating" class="calculating-overlay">
          <div class="spinner"></div>
          <p>Calculando ruta óptima...</p>
        </div>

        <!-- Resumen de Entregas -->
        <div v-if="deliveries.length > 1" class="delivery-summary">
          <h3>Puntos de Entrega</h3>
          <div v-for="(delivery, index) in deliveries" 
               :key="delivery.id"
               class="delivery-point">
            <div class="delivery-marker">{{ index + 1 }}</div>
            <div class="delivery-info">
              <p class="delivery-address">{{ delivery.address }}</p>
              <p v-if="delivery.products.length" class="delivery-products">
                {{ delivery.products.length }} productos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.route-optimization {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.metrics-panel {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 1rem;
  width: 90%;
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  height: calc(100vh - 13rem);
}

/* Map and Container Styles */
.map-container {
  height: 100%;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

#route-map {
  height: 100%;
  width: 100%;
  z-index: 1;
}

/* Selection Panel Styles */
.selection-panel {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100%;
  overflow-y: auto;
}

/* Products List Styles */
.products-list {
  display: grid;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Product Thumbnail Styles */
.product-thumbnail,
.product-emoji {
  width: 40px;
  height: 40px;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(134, 81, 231, 0.1);
  overflow: hidden;
}

.product-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-emoji {
  font-size: 1.5rem;
}

/* Button Styles */
.add-product-btn,
.remove-product-btn,
.search-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
}

.add-product-btn {
  background: rgb(134, 81, 231);
  color: white;
}

.add-product-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-product-btn {
  background: rgba(255, 71, 87, 0.1);
  color: rgb(255, 71, 87);
}

/* Selected Products Styles */
.selected-products {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 100%;
}

.selected-product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Search Styles */
.address-search {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 100%;
}

.search-input {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  max-width: 100%;
}

.search-input input {
  flex: 1;
  min-width: 0;
  padding: 0.75rem;
  border: 2px solid rgba(134, 81, 231, 0.2);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.search-btn {
  padding: 0.75rem;
  background: rgb(134, 81, 231);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-results {
  margin-top: 1rem;
  background: var(--bg-primary);
  border-radius: 0.5rem;
  overflow: hidden;
  max-width: 100%;
  word-break: break-word;
}

.search-result-item {
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow-wrap: break-word;
  hyphens: auto;
}

.search-result-item:hover {
  background: rgba(134, 81, 231, 0.1);
}

/* Metrics Panel Styles */
.metrics-panel {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow-y: auto;
}

.metrics-panel h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.metric-card {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  color: rgb(134, 81, 231);
}

.metric-content h3 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  animation: fadeInUp 0.5s ease-out;
}

.metric-card.total {
  background: rgb(134, 81, 231);
}

.metric-card.total .metric-icon,
.metric-card.total .metric-content h3,
.metric-card.total .metric-value {
  color: white;
}

/* Calculate Button Styles */
.calculate-button {
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.8), 
    rgba(76, 42, 165, 0.8)
  );
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
  font-family: "Poppins", sans-serif;
}

.calculate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(134, 81, 231, 0.2);
}

.calculate-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Map Marker Styles */
.user-location-marker {
  width: 20px;
  height: 20px;
}

.user-marker-inner {
  width: 20px;
  height: 20px;
  background: rgb(134, 81, 231);
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgb(134, 81, 231);
}

.marker-icon {
  background: none;
  border: none;
}

.marker-number {
  width: 24px;
  height: 24px;
  background: rgb(134, 81, 231);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.marker-number:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.marker-icon.start .marker-number {
  background: #4CAF50;
  width: 30px;
  height: 30px;
  font-size: 14px;
}

.marker-icon.end .marker-number {
  background: #f44336;
  width: 30px;
  height: 30px;
  font-size: 14px;
}

/* Loading and Error States */
.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-left-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(134, 81, 231, 0.1);
  border-left-color: rgb(134, 81, 231);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #f44336;
}

.error-state h3 {
  margin-bottom: 1rem;
}

.error-state button {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-state button:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

/* Map Customization */
.leaflet-tooltip {
  background: var(--bg-secondary);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.leaflet-tooltip::before {
  border-top-color: var(--bg-secondary);
}

.leaflet-control-zoom {
  border: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.leaflet-control-zoom a {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: none !important;
}

.leaflet-control-zoom a:hover {
  background: var(--bg-primary) !important;
}

.leaflet-interactive {
  transition: all 0.3s ease;
}

.leaflet-interactive:hover {
  opacity: 1 !important;
  stroke-width: 6px !important;
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes drawRoute {
  to {
    stroke-dashoffset: 0;
  }
}

/* Responsive Styles */
@media (max-width: 1400px) {
  .metrics-container {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .metric-card.total {
    grid-column: span 3;
  }
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    height: auto;
    max-width: 100%;
  }
  
  .map-container {
    height: 400px;
    order: -1;
  }
  
  .selection-panel {
    order: -1;
    max-width: 100%;
    max-height:50vh;
    overflow-x: hidden;
  }
  
  .metrics-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metric-card.total {
    grid-column: span 2;
  }

  .search-input,
  .search-results {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .route-optimization {
    padding: 1rem;
  }

  .metrics-container {
    grid-template-columns: 1fr;
  }

  .metric-card.total {
    grid-column: span 1;
  }

  .selection-panel {
    padding: 1rem;
  }
}
</style>