<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Trash, Pencil } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

interface Commerce {
  id: number;
  name: string;
  logo?: string;
  emoji: string;
  type: string;
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

interface Provider {
  id: number;
  name: string;
}

const route = useRoute();
const commerce = ref<Commerce | null>(null);
const isLoading = ref(true);
const showCreateForm = ref(false);
const isSubmitting = ref(false);
const isEditing = ref(false);
const editingProductId = ref<number | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const products = ref<Product[]>([]);
const providers = ref<Provider[]>([]);

const providerList = ref<Provider[]>([
  { id: 1, name: 'Proveedor A' },
  { id: 2, name: 'Proveedor B' },
  { id: 3, name: 'Proveedor C' }
]);

const emptyProduct = {
  name: '',
  description: '',
  weight: 0,
  unit: '',
  price: 0,
  image: '',
  providerId: undefined,
  quantity: 0,
  commerceId: ''
};

const newProduct = ref<Omit<Product, 'id'>>({ ...emptyProduct });

const units = [
  { value: 'kg', label: 'Kilogramos' },
  { value: 'g', label: 'Gramos' },
  { value: 'l', label: 'Litros' },
  { value: 'ml', label: 'Mililitros' },
  { value: 'u', label: 'Unidades' },
  { value: 'lb', label: 'Libras' },
  { value: 'oz', label: 'Onzas' }
];

const getCurrentCommerceId = () => {
  return route.params.id as string;
};

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

const getStorageKey = (key: string) => {
  const commerceId = getCurrentCommerceId();
  return `commerce_${commerceId}_${key}`;
};

const getProductEmoji = (name: string, description: string = ''): string => {
  const keywordMap = {
    // Alimentos y Bebidas
    cafe: '☕', pan: '🥖', pizza: '🍕', hamburguesa: '🍔', sushi: '🍱', 
    helado: '🍦', pastel: '🍰', chocolate: '🍫', galleta: '🍪', refresco: '🥤',
    cerveza: '🍺', vino: '🍷', jugo: '🧃', agua: '💧', leche: '🥛',
    
    // Frutas y Verduras
    manzana: '🍎', platano: '🍌', naranja: '🍊', limon: '🍋', zanahoria: '🥕',
    tomate: '🍅', papa: '🥔', cebolla: '🧅', ajo: '🧄', fruta: '🍎',
    
    // Ropa y Accesorios
    camisa: '👕', pantalon: '👖', vestido: '👗', zapato: '👞', gorra: '🧢',
    bufanda: '🧣', guante: '🧤', bolso: '👜', reloj: '⌚', joya: '💎',
    
    // Tecnología
    computadora: '💻', celular: '📱', tablet: '📱', audifono: '🎧', television: '📺',
    camara: '📸', impresora: '🖨️', juego: '🎮', bateria: '🔋', cable: '🔌',
    
    // Limpieza e Higiene
    jabon: '🧼', papel: '🧻', cepillo: '🪥', crema: '🧴', perfume: '💨',
    
    // Otros
    libro: '📚', cuaderno: '📓', lapiz: '✏️', tijera: '✂️', llave: '🔑',
    medicina: '💊', herramienta: '🔧', pintura: '🎨', planta: '🌱', flor: '💐',
    regalo: '🎁', mascota: '🐾', juguete: '🎲', deporte: '⚽', musica: '🎵'
  };

  const searchText = (name + ' ' + description).toLowerCase();

  for (const [keyword, emoji] of Object.entries(keywordMap)) {
    if (searchText.includes(keyword)) {
      return emoji;
    }
  }

  if (searchText.includes('kit') || searchText.includes('set')) return '🎁';
  if (searchText.includes('pack') || searchText.includes('paquete')) return '📦';
  if (searchText.includes('premium') || searchText.includes('especial')) return '⭐';
  
  return '📦';
};

const saveToStorage = (key: string, data: any) => {
  const storageKey = getStorageKey(key);
  localStorage.setItem(storageKey, JSON.stringify(data));
};

const getFromStorage = (key: string) => {
  const storageKey = getStorageKey(key);
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : null;
};

const loadData = async () => {
  try {
    isLoading.value = true;
    
    if (!validateCurrentCommerce()) {
      console.error('Comercio no encontrado o sin acceso');
      return;
    }

    const savedProducts = getFromStorage('products');
    if (savedProducts) {
      products.value = savedProducts;
    } else {
      products.value = [];
    }

    const savedProviders = getFromStorage('providers');
    if (savedProviders) {
      providers.value = savedProviders;
    } else {
      providers.value = providerList.value;
      saveToStorage('providers', providerList.value);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    isLoading.value = false;
  }
};

const openCreateForm = () => {
  isEditing.value = false;
  editingProductId.value = null;
  newProduct.value = { 
    ...emptyProduct,
    commerceId: getCurrentCommerceId() 
  };
  showCreateForm.value = true;
};

const openEditForm = (product: Product) => {
  isEditing.value = true;
  editingProductId.value = product.id;
  newProduct.value = { ...product };
  showCreateForm.value = true;
};

const closeForm = () => {
  showCreateForm.value = false;
  isEditing.value = false;
  editingProductId.value = null;
  newProduct.value = { 
    ...emptyProduct,
    commerceId: getCurrentCommerceId()
  };
};

const handleSubmit = async () => {
  isSubmitting.value = true;

  try {
    if (!validateCurrentCommerce()) {
      throw new Error('No tienes acceso a este comercio');
    }

    if (isEditing.value && editingProductId.value) {
      const index = products.value.findIndex(p => p.id === editingProductId.value);
      if (index !== -1) {
        products.value[index] = {
          ...products.value[index],
          ...newProduct.value,
          commerceId: getCurrentCommerceId()
        };
      }
    } else {
      const product: Product = {
        id: Date.now(),
        ...newProduct.value,
        commerceId: getCurrentCommerceId()
      };
      products.value.push(product);
    }

    saveToStorage('products', products.value);
    closeForm();
  } catch (error) {
    console.error('Error saving product:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = (id: number) => {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    deleteProduct(id);
  }
};

const deleteProduct = (id: number) => {
  products.value = products.value.filter(p => p.id !== id);
  saveToStorage('products', products.value);
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      newProduct.value.image = e.target?.result as string;
    };
    reader.readAsDataURL(input.files[0]);
  }
};

const triggerImageInput = () => {
  imageInput.value?.click();
};

const getProviderName = (providerId: number) => {
  return providers.value.find(p => p.id === providerId)?.name || 'Proveedor Desconocido';
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
  <div class="products-section">
    <div class="section-header">
      <div>
        <h1 class="section-title">Productos</h1>
        <p class="section-description">Gestiona el catálogo de productos de tu comercio</p>
      </div>
      <button @click="openCreateForm()" class="create-button">
        <span class="button-content">
          <i class="fas fa-plus"></i>
          Nuevo Producto
        </span>
      </button>
    </div>

    <div v-if="showCreateForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-form">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Producto' : 'Crear Nuevo Producto' }}</h2>
          <button @click="closeForm" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="product-form">
          <div class="form-grid">
            <div class="form-section">
              <h3>Información Básica</h3>
              <div class="input-group">
                <label>Nombre del Producto *</label>
                <input 
                  v-model="newProduct.name"
                  type="text"
                  required
                  placeholder="Ej: Café Premium"
                />
              </div>

              <div class="input-group">
                <label>Descripción</label>
                <textarea
                  v-model="newProduct.description"
                  placeholder="Describe tu producto..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="form-section">
              <h3>Especificaciones</h3>
              <div class="weight-group">
                <div class="input-group">
                  <label>Peso</label>
                  <input 
                    v-model.number="newProduct.weight"
                    type="number"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div class="input-group">
                  <label>Unidad de Medida *</label>
                  <select v-model="newProduct.unit" required>
                    <option value="">Selecciona una unidad</option>
                    <option v-for="unit in units" :key="unit.value" :value="unit.value">
                      {{ unit.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="input-group">
                <label>Precio Unitario (Venta) *</label>
                <div class="price-input">
                  <span class="currency-symbol">$</span>
                  <input
                    v-model.number="newProduct.price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="input-group">
                <label>Cantidad en Inventario *</label>
                <div class="quantity-input">
                  <input
                    v-model.number="newProduct.quantity"
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                  <span class="quantity-label">unidades</span>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Imagen del Producto</h3>
              <div class="image-upload">
                <div 
                  class="image-preview"
                  :class="{ 'has-image': newProduct.image }"
                  @click="triggerImageInput"
                >
                  <img 
                    v-if="newProduct.image"
                    :src="newProduct.image"
                    alt="Preview"
                  />
                  <div v-else class="upload-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Subir Imagen</span>
                  </div>
                </div>
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  class="hidden"
                />
              </div>
            </div>

            <div class="form-section">
              <h3>Proveedor (Opcional)</h3>
              <div class="input-group">
                <select v-model="newProduct.providerId">
                  <option value="">Seleccionar Proveedor</option>
                  <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                    {{ provider.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeForm" class="cancel-button">
              Cancelar
            </button>
            <button type="submit" class="submit-button" :disabled="isSubmitting">
              <span class="button-content">
                <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                <span>{{ isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto') }}</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Cargando productos...</p>
    </div>

    <div v-else-if="products.length === 0" class="empty-state">
      <i class="fas fa-box"></i>
      <h3>No hay productos</h3>
      <p>Comienza agregando tu primer producto al catálogo</p>
      <button @click="openCreateForm()" class="create-button">
        <span class="button-content">
          <i class="fas fa-plus"></i>
          Agregar Producto
        </span>
      </button>
    </div>
    

    <div v-else class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-image">
          <template v-if="product.image">
            <img :src="product.image" :alt="product.name">
          </template>
          <div v-else class="product-emoji">
            {{ getProductEmoji(product.name, product.description) }}
          </div>
        </div>
        <div class="product-details">
          <h3>{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-specs">
            <span class="product-weight">{{ product.weight }}{{ product.unit }}</span>
            <span class="product-price">{{ formatCurrency(product.price) }}</span>
          </div>
          <div class="product-inventory">
            <i class="fas fa-box"></i>
            <span>Stock: {{ product.quantity }} unidades</span>
          </div>
          <div v-if="product.providerId" class="product-provider">
            <i class="fas fa-truck"></i>
            <span>{{ getProviderName(product.providerId) }}</span>
          </div>
        </div>
        <div class="product-actions">
          <button @click="openEditForm(product)" class="edit-button" title="Editar">
            <Pencil :size="18" />
          </button>
          <button @click="confirmDelete(product.id)" class="delete-button" title="Eliminar">
            <Trash :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.products-section {
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.product-emoji {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.1),
    rgba(76, 42, 165, 0.1)
  );
  transition: all 0.3s ease;
}

.product-emoji:hover {
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.2),
    rgba(76, 42, 165, 0.2)
  );
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.section-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-form {
  background: var(--bg-secondary);
  border-radius: 1rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-input {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-input input {
  width: 120px;
}

.quantity-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.product-inventory {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(134, 81, 231, 0.1);
  border-radius: 1rem;
  width: fit-content;
}

.product-inventory i {
  font-size: 0.875rem;
  color: rgb(134, 81, 231);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-button {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.product-form {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-section h3 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.input-group input,
.input-group select,
.input-group textarea {
  width: 80%;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 2px solid rgba(134, 81, 231, 0.2);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  border-color: rgba(134, 81, 231, 0.8);
  box-shadow: 0 0 0 3px rgba(134, 81, 231, 0.2);
}

.weight-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.price-input {
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.price-input input {
  padding-left: 2rem;
}

.image-upload {
  width: 100%;
}

.image-preview {
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(134, 81, 231, 0.2);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.upload-button{
    padding: 0.75rem 1.5rem;
    background: var(--bg-primary);
    border: 2px solid rgba(134, 81, 231, 0.2);
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Poppins', sans-serif;
}

.image-preview:hover {
  border-color: rgba(134, 81, 231, 0.8);
  background: rgba(134, 81, 231, 0.1);
}

.image-preview.has-image {
  border-style: solid;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.upload-placeholder i {
  font-size: 2rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.product-card {
  background: var(--bg-secondary);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 96%;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  padding: 1.5rem;
}

.product-details h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.product-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.product-specs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.product-weight,
.product-price {
  background: rgba(134, 81, 231, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.product-provider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.product-actions {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.edit-button,
.delete-button {
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-button {
  background: rgba(134, 81, 231, 0.1);
  color: rgb(134, 81, 231);
}

.delete-button {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
}

.edit-button:hover {
  background: rgba(134, 81, 231, 0.2);
}

.delete-button:hover {
  background: rgba(255, 0, 0, 0.2);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state i {
  font-size: 4rem;
  color: rgba(134, 81, 231, 0.8);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.create-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.8), 
    rgba(76, 42, 165, 0.8)
  );
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(134, 81, 231, 0.2);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-button, .submit-button, .upload-button{
  padding: 0.75rem 1.5rem;
  background: var(--bg-primary);
  border: 2px solid rgba(134, 81, 231, 0.2);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
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
  .form-grid {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .modal-form {
    margin: 1rem;
    max-height: 85vh;
  }
}
</style>