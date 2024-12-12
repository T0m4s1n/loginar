<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Mail, Lock, LogIn, Eye, EyeOff, UserPlus } from 'lucide-vue-next';
import router from '../router';

export default defineComponent({
    name: 'Login',
    components: {
        Mail,
        Lock,
        LogIn,
        Eye,
        EyeOff,
        UserPlus
    },
    setup() {
        const email = ref('');
        const password = ref('');
        const showPassword = ref(false);
        const isLoading = ref(false);
        const errorMessage = ref('');
        const showError = ref(false);

        const togglePassword = () => {
            showPassword.value = !showPassword.value;
        };

        const generateSessionToken = (email: string): string => {
            const timestamp = Date.now();
            return btoa(`${email}_${timestamp}`);
        };

        const validateEmail = (email: string): boolean => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        const showErrorMessage = (message: string) => {
            errorMessage.value = message;
            showError.value = true;
            setTimeout(() => {
                showError.value = false;
            }, 3000);
        };

        const login = async () => {
            try {
                isLoading.value = true;
                errorMessage.value = '';

                // Validate empty fields
                if (!email.value || !password.value) {
                    showErrorMessage('Por favor, complete todos los campos');
                    return;
                }

                // Validate email format
                if (!validateEmail(email.value)) {
                    showErrorMessage('El formato del correo electrónico no es válido');
                    return;
                }

                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find((u: any) => u.email === email.value);

                // Check if user exists
                if (!user) {
                    showErrorMessage('El correo electrónico no está registrado');
                    return;
                }

                // Validate password
                if (user.password !== password.value) {
                    showErrorMessage('La contraseña es incorrecta');
                    return;
                }

                // Create session
                const sessionToken = generateSessionToken(user.email);
                localStorage.setItem('session', JSON.stringify({
                    ...user,
                    token: sessionToken
                }));

                // Successful login
                router.push('/').then(() => {
                    window.location.reload();
                });

            } catch (error) {
                console.error('Login error:', error);
                showErrorMessage('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
            } finally {
                isLoading.value = false;
            }
        };

        const goToRegister = () => {
            router.push('/register');
        };

        const checkSession = () => {
            const session = localStorage.getItem('session');
            if (session) {
                router.push('/');
            }
        };

        onMounted(() => {
            checkSession();
        });

        return {
            email,
            password,
            showPassword,
            isLoading,
            errorMessage,
            showError,
            togglePassword,
            login,
            goToRegister
        };
    }
});
</script>
<template>
    <div class="login-container">
        <form @submit.prevent="login" class="login-form">
            <fieldset class="login-fieldset">
                <div class="form-header">
                    <h2 class="login-title">Bienvenido</h2>
                    <p class="login-subtitle">Inicia sesion en tu cuenta para acceder al demo de la aplicacion</p>
                </div>

                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <div class="input-group">
                    <label for="input__email">Email</label>
                    <div class="input-wrapper">
                        <Mail class="input-icon" :size="18" />
                        <input 
                            id="input__email"
                            v-model="email"
                            type="email"
                            required
                            placeholder="Ingresa tu Email"
                        >
                    </div>
                </div>

                <div class="input-group">
                    <label for="input__password">Contraseña</label>
                    <div class="input-wrapper">
                        <Lock class="input-icon" :size="18" />
                        <input 
                            id="input__password"
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            required
                            placeholder="Ingresa tu contraseña"
                        >
                        <button 
                            type="button"
                            class="toggle-password"
                            @click="togglePassword"
                        >
                            <transition name="fade">
                                <Eye v-if="!showPassword" :size="18" />
                                <EyeOff v-else :size="18" />
                            </transition>
                        </button>
                    </div>
                </div>

                <footer class="login-footer">
                    <button type="submit" class="login-button" :disabled="isLoading">
                        <span class="button-content" :class="{ 'loading': isLoading }">
                            <LogIn :size="18" />
                            <span>{{ isLoading ? 'Iniciando...' : 'Inicia Sesion' }}</span>
                        </span>
                    </button>
                    
                    <div class="register-link">
                        <p>No tienes una cuenta? puedes registrarte aqui!</p>
                        <button type="button" class="register-button" @click="goToRegister">
                            <UserPlus :size="18" />
                            <span>Registrate</span>
                        </button>
                    </div>
                </footer>
            </fieldset>
        </form>
    </div>
</template>

<style scoped>

.error-message {
    background: rgba(255, 0, 0, 0.1);
    color: #ff4444;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

/* Add shake animation */
@keyframes shake {
    10%, 90% {
        transform: translate3d(-1px, 0, 0);
    }
    20%, 80% {
        transform: translate3d(2px, 0, 0);
    }
    30%, 50%, 70% {
        transform: translate3d(-2px, 0, 0);
    }
    40%, 60% {
        transform: translate3d(2px, 0, 0);
    }
}
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: transparent;
    padding: 1rem;
    perspective: 1000px;
}

.login-form {
    width: 100%;
    max-width: 400px;
    transform-style: preserve-3d;
    animation: formEntry 0.6s ease-out;
}

.login-fieldset {
    background: var(--bg-secondary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
}

.form-header {
    text-align: center;
    margin-bottom: 2rem;
}

.login-title {
    color: var(--text-primary);
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, #fff, #999);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.login-subtitle {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.input-group {
    margin-bottom: 1.5rem;
    opacity: 0;
    transform: translateY(20px);
    animation: slideUp 0.5s ease forwards;
}

.input-group:nth-child(2) { animation-delay: 0.1s; }
.input-group:nth-child(3) { animation-delay: 0.2s; }

.input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 1rem;
    color: var(--text-primary);
    transition: color 0.3s ease;
}

.input-group input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    background: var(--bg-primary);
    border: 2px solid #333;
    border-radius: 0.5rem;
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.3s ease;
    font-family: "Poppins", serif;
}

.input-group input:focus {
    outline: none;
    border-color: var(--bg-secondary);
    background: var(--bg-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.input-group input:focus + .input-icon {
    color: var(--bg-primary);
}

.toggle-password {
    position: absolute;
    right: 1rem;
    background: transparent;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.3s ease;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}

.toggle-password:hover {
    color: #999;
}

.login-footer {
    margin-top: 2rem;
}
.login-button {
    width: 100%;
    padding: 0.75rem;
    color: #fff;
    border: 2px solid rgba(51, 51, 51, 0.1);
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    overflow: hidden;
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
    font-family: "Poppins", serif;
}

.login-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg, 
        rgba(255,255,255,0) 0%, 
        rgba(255,255,255,0.2) 50%, 
        rgba(255,255,255,0) 100%
    );
    animation: shine-overlay 5s ease-in-out infinite;
}

@keyframes shine {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

@keyframes shine-overlay {
    0%, 100% {
        left: -100%;
    }
    50% {
        left: 200%;
    }
}

.login-button:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 10px rgba(134, 81, 231, 0.25);
}
.register-link{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    color: var(--text-primary);
    font-size: 0.9rem;
}
.register-button {
    width: 100%;
    padding: 0.75rem;
    color: #fff;
    border: 2px solid rgba(51, 51, 51, 0.1);
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    overflow: hidden;
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
    font-family: "Poppins", serif;
}

.register-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg, 
        rgba(255,255,255,0) 0%, 
        rgba(255,255,255,0.2) 50%, 
        rgba(255,255,255,0) 100%
    );
    animation: shine-overlay 5s ease-in-out infinite;
}

.register-button:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 10px rgba(134, 81, 231, 0.25);
}

.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.button-content.loading {
    animation: pulse 1.5s ease-in-out infinite;
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

@keyframes slideUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

@media (max-width: 480px) {
    .login-fieldset {
        padding: 1.5rem;
    }

    .login-title {
        font-size: 1.5rem;
    }

    .input-group input {
        padding: 0.6rem 1rem 0.6rem 2.5rem;
    }
}

.error-message{
    color: red;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1rem;
}
</style>
