<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Trash } from 'lucide-vue-next';

interface Commerce {
  id: number;
  name: string;
  logo?: string;
  nit: string;
  type: string;
  phone: string;
  owner: string;
  contact: string;
  foundationDate?: string;
  createdAt: string;
  emoji: string;
}

interface NewCommerce {
  name: string;
  logo: string;
  nit: string;
  type: string;
  phone: string;
  owner: string;
  contact: string;
  foundationDate: string;
}

const router = useRouter();
const commerces = ref<Commerce[]>([]);
const currentUser = ref<any>(null);
const showCreateForm = ref(false);
const error = ref('');

const newCommerce = reactive<NewCommerce>({
  name: '',
  logo: '',
  nit: '',
  type: '',
  phone: '',
  owner: '',
  contact: '',
  foundationDate: '',
});

const getCommerceEmoji = (name: string, type: string): string => {
  const keywordMap = {
    comida: '🍽️', restaurante: '🍽️', cafe: '☕', cafeteria: '☕', bar: '🍺', pizza: '🍕',
    panaderia: '🥖', pasteleria: '🧁', heladeria: '🍦', ropa: '👕', moda: '👗', zapatos: '👞',
    zapateria: '👞', boutique: '👗', tecnologia: '💻', computadora: '🖥️', celular: '📱',
    telefono: '📱', juegos: '🎮', software: '⌨️', salud: '⚕️', belleza: '💅', spa: '💆',
    gimnasio: '💪', farmacia: '💊', mercado: '🛒', super: '🏪', supermercado: '🏪', libro: '📚',
    libreria: '📚', juguetes: '🎪', mascota: '🐾', mascotas: '🐾', auto: '🚗', autos: '🚗',
    musica: '🎵', arte: '🎨', flores: '🌸', floristeria: '🌸', joyeria: '💎', deportes: '⚽',
    ferreteria: '🔧', papeleria: '📓', minorista: '🏪', mayorista: '🏭', manufactura: '🏭', servicios: '🛠️'
  };

  const nameLower = name.toLowerCase();
  const typeLower = type.toLowerCase();

  for (const [keyword, emoji] of Object.entries(keywordMap)) {
    if (nameLower.includes(keyword)) {
      return emoji;
    }
  }

  return keywordMap[typeLower as keyof typeof keywordMap] || '🏢';
};

onMounted(() => {
  const session = JSON.parse(localStorage.getItem('session') || 'null');
  if (session) {
    currentUser.value = session;

    const userCommerces = localStorage.getItem(`userCommerces_${session.email}`);
    if (userCommerces) {
      commerces.value = JSON.parse(userCommerces);
    }
  } else {
    router.push('/login');
  }
});

const saveToLocalStorage = () => {
  if (currentUser.value) {
    localStorage.setItem(`userCommerces_${currentUser.value.email}`, JSON.stringify(commerces.value));
  }
};

const handleCreateCommerce = () => {
  if (!validateForm()) {
    return;
  }

  const emoji = getCommerceEmoji(newCommerce.name, newCommerce.type);

  const commerce: Commerce = {
    id: Date.now(),
    ...newCommerce,
    emoji,
    createdAt: new Date().toISOString().split('T')[0]
  };

  commerces.value.push(commerce);
  saveToLocalStorage();
  cancelCreate();
};

const validateForm = () => {
  if (!newCommerce.name.trim()) {
    error.value = 'El nombre del comercio es requerido';
    return false;
  }
  if (!newCommerce.nit.trim()) {
    error.value = 'El NIT es requerido';
    return false;
  }
  if (!newCommerce.type) {
    error.value = 'El tipo de negocio es requerido';
    return false;
  }
  if (!newCommerce.phone.trim()) {
    error.value = 'El teléfono es requerido';
    return false;
  }
  if (!newCommerce.owner.trim()) {
    error.value = 'El nombre del propietario es requerido';
    return false;
  }
  if (!newCommerce.contact.trim()) {
    error.value = 'El email de contacto es requerido';
    return false;
  }
  return true;
};

const cancelCreate = () => {
  showCreateForm.value = false;
  error.value = '';
  Object.keys(newCommerce).forEach(key => {
    newCommerce[key as keyof NewCommerce] = '';
  });
};

const deleteCommerce = (id: number) => {
  if (confirm('¿Estás seguro de que deseas eliminar este comercio?')) {
    commerces.value = commerces.value.filter(c => c.id !== id);
    saveToLocalStorage();
  }
};

const enterCommerce = (commerce: Commerce) => {
  router.push(`/commerce/${commerce.id}`);
};

const formatBusinessType = (type: string) => {
  const types = {
    retail: 'Minorista',
    wholesale: 'Mayorista',
    manufacturing: 'Manufactura',
    service: 'Servicios',
    other: 'Otro'
  };
  return types[type as keyof typeof types] || type;
};


</script>
<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1 class="dashboard-title">Mis Comercios</h1>
        <p class="dashboard-subtitle">Maneja y administra tus comercios con la ayuda de LogiNar IA</p>
      </div>
      <button @click="showCreateForm = true" class="create-button">
        <span class="button-content">
          <i class="fas fa-plus"></i>
          Crear Comercio
        </span>
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Estado vacío -->
    <div v-if="commerces.length === 0" class="empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <i class="fas fa-store-alt empty-icon"></i>
          <span class="empty-state-emoji">😅</span>
        </div>
        <h2>¡Ups! Aún no tienes comercios</h2>
        <p>Parece que todavía no has creado ningún comercio. ¡Es el momento perfecto para comenzar tu viaje empresarial!</p>
        <button @click="showCreateForm = true" class="create-button">
          <span class="button-content">
            <i class="fas fa-plus"></i>
            Crear Mi Primer Comercio
          </span>
        </button>
      </div>
    </div>

    <!-- Modal de creación -->
    <div v-if="showCreateForm" class="modal-overlay">
      <div class="modal-form">
        <h2 class="modal-title">Crear Nuevo Comercio</h2>
        <form @submit.prevent="handleCreateCommerce">
          <div class="form-section">
            <h3 class="section-title">Información Básica</h3>
            <div class="input-groups-container">
              <div class="input-group">
                <label>Nombre del Negocio *</label>
                <div class="input-wrapper">
                  <i class="fas fa-store input-icon"></i>
                  <input
                    v-model="newCommerce.name"
                    type="text"
                    placeholder="Ingresa el nombre del negocio"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label>URL del Logo</label>
                <div class="input-wrapper">
                  <i class="fas fa-image input-icon"></i>
                  <input
                    v-model="newCommerce.logo"
                    type="url"
                    placeholder="Ingresa la URL del logo"
                  />
                </div>
              </div>

              <div class="input-group">
                <label>NIT *</label>
                <div class="input-wrapper">
                  <i class="fas fa-id-card input-icon"></i>
                  <input
                    v-model="newCommerce.nit"
                    type="text"
                    placeholder="Ingresa el NIT"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label>Tipo de Negocio *</label>
                <div class="input-wrapper">
                  <i class="fas fa-building input-icon"></i>
                  <select v-model="newCommerce.type" required>
                    <option value="">Selecciona el tipo</option>
                    <option value="retail">Minorista</option>
                    <option value="wholesale">Mayorista</option>
                    <option value="manufacturing">Manufactura</option>
                    <option value="service">Servicios</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Información de Contacto</h3>
            <div class="input-groups-container">
              <div class="input-group">
                <label>Teléfono *</label>
                <div class="input-wrapper">
                  <i class="fas fa-phone input-icon"></i>
                  <input
                    v-model="newCommerce.phone"
                    type="tel"
                    placeholder="Ingresa el teléfono"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label>Nombre del Propietario *</label>
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input
                    v-model="newCommerce.owner"
                    type="text"
                    placeholder="Ingresa el nombre del propietario"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label>Email de Contacto *</label>
                <div class="input-wrapper">
                  <i class="fas fa-envelope input-icon"></i>
                  <input
                    v-model="newCommerce.contact"
                    type="email"
                    placeholder="Ingresa el email de contacto"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label>Fecha de Fundación</label>
                <div class="input-wrapper">
                  <i class="fas fa-calendar input-icon"></i>
                  <input
                    v-model="newCommerce.foundationDate"
                    type="date"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="cancelCreate" class="cancel-button">
              Cancelar
            </button>
            <button type="submit" class="submit-button">
              Crear Comercio
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-else class="commerce-grid">
      <div
        v-for="commerce in commerces"
        :key="commerce.id"
        class="commerce-card"
      >
        <div class="commerce-card-header">
          <div class="commerce-avatar">
            <img 
              v-if="commerce.logo" 
              :src="commerce.logo" 
              :alt="commerce.name"
              class="commerce-logo"
            />
            <span v-else class="commerce-emoji">{{ commerce.emoji }}</span>
          </div>
          <h3>{{ commerce.name }}</h3>
        </div>
        <div class="commerce-info">
          <p><strong>Tipo:</strong> {{ formatBusinessType(commerce.type) }}</p>
          <p><strong>NIT:</strong> {{ commerce.nit }}</p>
          <p><strong>Propietario:</strong> {{ commerce.owner }}</p>
          <p><strong>Teléfono:</strong> {{ commerce.phone }}</p>
          <p><strong>Contacto:</strong> {{ commerce.contact }}</p>
        </div>
        <div class="commerce-actions">
          <button
            @click="enterCommerce(commerce)"
            class="enter-button"
          >
            <span class="button-content">
              Entrar al Comercio
              <i class="fas fa-arrow-right"></i>
            </span>
          </button>
          <button
            @click="deleteCommerce(commerce.id)"
            class="delete-button" 
          >
            <i class="fas fa-trash">
              <Trash />
            </i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 120vh;
  padding: 2rem;
  background: transparent;
  perspective: 1000px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  animation: formEntry 0.6s ease-out;
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.dashboard-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  animation: fadeIn 0.5s ease-out;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
  padding: 3rem 2rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(134, 81, 231, 0.2);
}

.empty-state-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.empty-icon {
  font-size: 5rem;
  color: rgba(134, 81, 231, 0.8);
  margin-bottom: 0.5rem;
}

.empty-state-emoji {
  position: absolute;
  font-size: 2rem;
  bottom: -10px;
  right: -10px;
  animation: bounce 2s ease-in-out infinite;
  top: 10px;
}

.empty-state h2 {
  font-size: 1.75rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1.1rem;
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
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  animation: formEntry 0.6s ease-out;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}

.form-section:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(134, 81, 231, 0.2);
}

.input-groups-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
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

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.input-wrapper input,
.input-wrapper select {
  width: 83%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: var(--bg-primary);
  border: 2px solid rgba(134, 81, 231, 0.2);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
  outline: none;
  border-color: rgba(134, 81, 231, 0.8);
  box-shadow: 0 0 0 3px rgba(134, 81, 231, 0.2);
}

.commerce-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  animation: formEntry 0.6s ease-out;
}

.commerce-card {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.commerce-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
}

.commerce-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(134, 81, 231, 0.1);
  margin-right: 1rem;
}

.commerce-emoji {
  font-size: 1.5rem;
  line-height: 1;
}

.commerce-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.commerce-card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.commerce-logo {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.commerce-info {
  margin: 1rem 0;
}

.commerce-info p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
}

.commerce-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.create-button, .enter-button {
  padding: 0.75rem 1.5rem;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.8), 
    rgba(76, 42, 165, 0.8), 
    rgba(175, 160, 255, 0.8), 
    rgba(214, 210, 255, 0.8)
  );
  background-size: 400% 400%;
  animation: shine 5s ease-in-out infinite;
  box-shadow: 0 6px 8px rgba(134, 81, 231, 0.2);
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
}

.create-button:hover, .enter-button:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 10px rgba(134, 81, 231, 0.25);
  font-family: "Poppins", sans-serif;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 2px solid rgba(134, 81, 231, 0.2);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
}

.cancel-button:hover {
  background: rgba(134, 81, 231, 0.1);
}

.submit-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(120deg, 
    rgba(134, 81, 231, 0.8), 
    rgba(76, 42, 165, 0.8)
  );
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(134, 81, 231, 0.2);
}

.delete-button {
  padding: 0.5rem;
  background: rgba(255, 0, 0, 0.1);
  border: none;
  border-radius: 0.5rem;
  color: #ff4444;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: rgba(255, 0, 0, 0.2);
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
  animation: slideUp 0.3s ease-out;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(134, 81, 231, 0.2);
}

@keyframes formEntry {
  from {
    opacity: 0;
    transform: translateY(20px) rotateX(-10deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shine {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
    min-height: 180vh;
  }

  .commerce-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-form {
    padding: 1.5rem;
    margin: 1rem;
  }

  .input-groups-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .input-group {
    margin-bottom: 0.75rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
  }

  .commerce-actions {
    flex-direction: column;
  }

  .commerce-actions button {
    width: 100%;
  }
}
</style>