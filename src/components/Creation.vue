<script setup>
    import { ref, onMounted } from 'vue'
    
    const product = ref({
        name: '',
        category: '',
        price: null,
        quantity: 1,
        expirationDate: '',
        image: null
    })
    
    const savedProducts = ref([])
    const imagePreview = ref(null)
    
    onMounted(() => {
        const saved = localStorage.getItem('products')
        if (saved) {
            savedProducts.value = JSON.parse(saved)
        }
    })
    
    const handleImageUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                product.value.image = e.target.result
                imagePreview.value = e.target.result
            }
            reader.readAsDataURL(file)
        }
    }
    
    const incrementQuantity = () => {
        product.value.quantity++
    }
    
    const decrementQuantity = () => {
        if (product.value.quantity > 1) {
            product.value.quantity--
        }
    }
    
    const saveProduct = () => {
        // Validate that all required fields are filled
        if (!product.value.name || 
                !product.value.category || 
                !product.value.price || 
                !product.value.quantity) {
            alert('Please fill in all required fields')
            return
        }
    
        // Save product to the list
        savedProducts.value.push({ ...product.value })
    
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(savedProducts.value))
    
        // Reset form
        product.value = {
            name: '',
            category: '',
            price: null,
            quantity: 1,
            expirationDate: '',
            image: null
        }
        imagePreview.value = null
    }
    
    const deleteProduct = (index) => {
        savedProducts.value.splice(index, 1)
        localStorage.setItem('products', JSON.stringify(savedProducts.value))
    }
</script>
<template>
        <div class="not-found-container">
            <div class="not-found-content">
                <div class="error-card">
                    <div class="container mx-auto p-4 max-w-md">
                        <h2 class="text-2xl font-bold mb-4">Crear Nuevo Producto</h2>
                        <form @submit.prevent="saveProduct" class="space-y-4">
                            <div>
                                <label class="block mb-2">Imagen</label>
                                <input 
                                    type="file" 
                                    @change="handleImageUpload"
                                    accept="image/*"
                                    class="w-full p-2 border rounded action-button"
                                />
                                <img v-if="imagePreview" :src="imagePreview" class="mt-2 max-h-40 mx-auto" />
                            </div>
            
                            <div>
                                <label class="block mb-2">Product Name</label>
                                <input 
                                    v-model="product.name" 
                                    type="text" 
                                    required 
                                    class="w-full p-2 border rounded action-button"
                                />
                            </div>
            
                            <div>
                                <label class="block mb-2">Categoria</label>
                                <select 
                                    v-model="product.category" 
                                    required 
                                    class="w-full p-2 border rounded action-button"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Food">Food</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
            
                            <div>
                                <label class="block mb-2">Unit Price</label>
                                <input 
                                    v-model.number="product.price" 
                                    type="number" 
                                    min="0" 
                                    step="0.01"
                                    required 
                                    class="w-full p-2 border rounded action-button"
                                />
                            </div>
            
                            <div>
                                <label class="block mb-2">Quantity</label>
                                <div class="flex items-center">
                                    <button 
                                        type="button" 
                                        @click="decrementQuantity"
                                        class="bg-red-500 text-white p-2 rounded-l action-button"
                                    >
                                        -
                                    </button>
                                    <input 
                                        v-model.number="product.quantity" 
                                        type="number" 
                                        min="0"
                                        required 
                                        class="w-full p-2 text-center border action-button"
                                    />
                                    <button 
                                        type="button" 
                                        @click="incrementQuantity"
                                        class="bg-green-500 text-white p-2 rounded-r action-button"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
            
                            <div>
                                <label class="block mb-2">Expiration Date (Optional)</label>
                                <input 
                                    v-model="product.expirationDate" 
                                    type="date" 
                                    class="w-full p-2 border rounded action-button"
                                />
                            </div>
            
                            <button 
                                type="submit" 
                                class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 action-button"
                            >
                                Save Product
                            </button>
                        </form>
            
                        <div v-if="savedProducts.length" class="mt-6">
                            <h3 class="text-xl font-bold mb-4">Saved Products</h3>
                            <ul>
                                <li 
                                    v-for="(p, index) in savedProducts" 
                                    :key="index" 
                                    class="mb-2 p-2 border rounded flex justify-between items-center"
                                >
                                    {{ p.name }} - ${{ p.price }} 
                                    <button 
                                        @click="deleteProduct(index)"
                                        class="bg-red-500 text-white p-1 rounded action-button"
                                    >
                                        Delete
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <div class="background-decoration">
            <div class="decoration-orb decoration-orb-1"></div>
            <div class="decoration-orb decoration-orb-2"></div>
        </div>
</template>  
<style scoped>  
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin-top: 0;
  padding: 1rem;
  background-color: transparent;
}

.not-found-content {
  width: 100%;
  max-width: 600px;
}

.error-card {
    margin-top: 6rem;
  background-color: var(--bg-secondary);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Icon Wrapper */
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

/* Typography */
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

/* Button Styles */
.buttons-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.action-button, 
.back-button, 
.home-button {
  position: relative;
  overflow: hidden;
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
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Shine Animation */
.action-button::before,
.back-button::before,
.home-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent
  );
  transition: all 0.6s;
}

.action-button:hover::before,
.back-button:hover::before,
.home-button:hover::before {
  left: 100%;
}

.action-button:hover,
.back-button:hover,
.home-button:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.button-icon {
  width: 1.2rem;
  height: 1.2rem;
}

/* Specific Button Variations */
.search-button {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.search-button:hover {
  background: color-mix(in srgb, #666 80%, white);
}

/* Support Information */
.support-info {
  margin-top: 1.5rem;
  color: #888;
  font-size: 0.9rem;
}

/* Background Decoration */
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

/* Responsive Design */
@media (min-width: 769px) {
  .buttons-container {
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
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