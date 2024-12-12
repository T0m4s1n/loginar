 <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { themeUtils } from '../themeUtils';
  import {
    Moon,
    Sun,
    BadgePercent,
    House,
    UserRound,
    ChevronDown,
    LayoutDashboard,
    LogOut,
    DollarSign
  } from 'lucide-vue-next';
  
  declare global {
    interface HTMLElement {
      _clickOutside?: (event: Event) => void;
    }
  }
  
  const router = useRouter();
  const isMenuOpen = ref(false);
  const isDarkMode = ref(false);
  const isProfileMenuOpen = ref(false);
  const userName = ref<string | null>(null);
  const isMobile = ref(false);
  const windowWidth = ref(window.innerWidth);
  const profileMenuRef = ref<HTMLElement | null>(null);
  const lastScrollPosition = ref(0);
  const isHeaderVisible = ref(true);
  const headerHeight = ref(0);
  
  const isResponsiveMode = computed(() => windowWidth.value <= 768);
  
  const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth;
    isMobile.value = isResponsiveMode.value;
    
    if (!isResponsiveMode.value) {
      isMenuOpen.value = false;
      document.body.style.overflow = '';
    }
  };
  
  const handleScroll = () => {
    const currentScrollPosition = window.scrollY;
    
    if (currentScrollPosition < headerHeight.value) {
      isHeaderVisible.value = true;
      lastScrollPosition.value = currentScrollPosition;
      return;
    }
  
    isHeaderVisible.value = currentScrollPosition < lastScrollPosition.value || currentScrollPosition < headerHeight.value;
    lastScrollPosition.value = currentScrollPosition;
  };
  
  const debounce = (fn: (...args: any[]) => void, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };
  
  const debouncedUpdateWindowWidth = debounce(updateWindowWidth);
  const debouncedHandleScroll = debounce(handleScroll, 10);
  
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    themeUtils.toggleTheme();
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  };
  
  const toggleMenu = () => {
    if (!isResponsiveMode.value) return;
    
    isMenuOpen.value = !isMenuOpen.value;
    document.body.style.overflow = isMenuOpen.value ? 'hidden' : '';
  };
  
  const toggleProfileMenu = (event: Event) => {
    event.stopPropagation();
    isProfileMenuOpen.value = !isProfileMenuOpen.value;
  };
  
  const handleClickOutside = (event: Event) => {
    if (profileMenuRef.value && !profileMenuRef.value.contains(event.target as Node)) {
      isProfileMenuOpen.value = false;
    }
  };
  
  const closeMenu = () => {
    isMenuOpen.value = false;
    document.body.style.overflow = '';
  };
  
  const closeAllMenus = () => {
    isMenuOpen.value = false;
    isProfileMenuOpen.value = false;
    document.body.style.overflow = '';
  };
  
  const redirectToLogin = () => {
    router.push('/login');
    closeAllMenus();
  };
  
  const handleLogout = () => {
    localStorage.removeItem('session');
    userName.value = null;
    closeAllMenus();
    router.push('/login');
  };
  
  const initializeApp = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark';
      themeUtils[isDarkMode.value ? 'enableDarkMode' : 'enableLightMode']();
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    if (session?.name) {
      userName.value = session.name;
    }
  
    updateWindowWidth();
  };
  
  watch(isResponsiveMode, (newValue) => {
    if (!newValue && (isMenuOpen.value || isProfileMenuOpen.value)) {
      closeAllMenus();
    }
  });
  
  watch(() => router.currentRoute.value.path, () => {
    closeAllMenus();
  });
  
  onMounted(() => {
    initializeApp();
    window.addEventListener('resize', debouncedUpdateWindowWidth);
    window.addEventListener('scroll', debouncedHandleScroll);
    document.addEventListener('click', handleClickOutside);
    
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        isDarkMode.value = e.matches;
      }
    });
  
    const headerElement = document.querySelector('.header');
    if (headerElement) {
      headerHeight.value = headerElement.getBoundingClientRect().height;
      document.body.style.paddingTop = `${headerHeight.value}px`;
    }
  });
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', debouncedUpdateWindowWidth);
    window.removeEventListener('scroll', debouncedHandleScroll);
    document.removeEventListener('click', handleClickOutside);
    document.body.style.paddingTop = '';
  });
  </script>
  <template>
    <header class="header" :class="{ 
      'dark-mode': isDarkMode,
      'header-hidden': !isHeaderVisible,
      'header-visible': isHeaderVisible 
    }">
      <div class="logo">
        <BadgePercent :size="64" color="white" />
      </div>
  
      <nav v-if="!isResponsiveMode" class="desktop-nav">
        <router-link to="/" @click="closeMenu">
          <House :size="24" color="white" />
          <span>Inicio</span>
        </router-link>
        
        <router-link to="/about" @click="closeMenu">
          <UserRound :size="24" color="white" />
          <span>Nosotros</span>
        </router-link>

        <router-link to="/business" @click="closeMenu">
          <DollarSign :size="24" color="white" />
          <span>Negocios</span>
        </router-link>
        
        <template v-if="!userName">
          <button class="login-btn" @click="redirectToLogin">
            <span class="textButton">Demo</span>
          </button>
        </template>
        
        <div v-else class="profile-menu-container" ref="profileMenuRef">
          <button class="profile-btn" @click="toggleProfileMenu">
            <span class="textButton">{{ userName }}</span>
            <ChevronDown 
              :class="{ 'rotate-180': isProfileMenuOpen }" 
              :size="20" 
              color="white"
            />
          </button>
  
          <transition name="submenu">
            <div v-show="isProfileMenuOpen" class="submenu">
              <router-link to="/dashboard" class="submenu-item" @click="isProfileMenuOpen = false">
                <LayoutDashboard :size="20" />
                <span>Panel de flujo</span>
              </router-link>
              <button class="submenu-item logout" @click="handleLogout">
                <LogOut :size="20" color="red" />
                <span>Cerrar Sesion</span>
              </button>
            </div>
          </transition>
        </div>
      </nav>
  
      <div class="header-right">
        <button class="theme-toggle-btn" @click="toggleTheme" aria-label="Toggle theme">
          <Transition mode="out-in">
            <Moon v-if="isDarkMode" :size="24" key="sun" class="theme-icon sun"/>
            <Sun v-else :size="24" key="moon" class="theme-icon moon"/>
          </Transition>
        </button>
  
        <button 
          v-if="isResponsiveMode"
          class="hamburger" 
          :class="{ 'is-active': isMenuOpen }" 
          @click="toggleMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div 
        v-if="isResponsiveMode"
        class="mobile-menu" 
        :class="{ 'is-active': isMenuOpen }"
      >
        <nav class="mobile-nav">
          <router-link to="/" @click="closeMenu">
            <House :size="24" color="white" />
            <span>Inicio</span>
          </router-link>
          
          <router-link to="/about" @click="closeMenu">
            <UserRound :size="24" color="white" />
            <span>Nosotros</span>
          </router-link>
          <router-link to="/business" @click="closeMenu">
            <DollarSign :size="24" color="white" />
            <span>Negocios</span>
          </router-link>
          
          <template v-if="!userName">
            <button class="login-btn" @click="redirectToLogin">
              <span class="textButton">Demo</span>
            </button>
          </template>
          
          <template v-else>
            <div class="mobile-profile-menu">
              <button class="profile-btn mobile" @click="toggleProfileMenu">
                <span class="textButton">{{ userName }}</span>
                <ChevronDown 
                  :class="{ 'rotate-180': isProfileMenuOpen }" 
                  :size="20" 
                  color="white"
                />
              </button>
  
              <transition name="submenu">
                <div v-show="isProfileMenuOpen" class="mobile-submenu">
                  <router-link to="/dashboard" class="submenu-item" @click="closeMenu">
                    <LayoutDashboard :size="20" />
                    <span>Panel de flujo</span>
                  </router-link>
                  <button class="submenu-item logout" @click="handleLogout">
                    <LogOut :size="20" />
                    <span>Cerrar sesion</span>
                  </button>
                </div>
              </transition>
            </div>
          </template>
        </nav>
      </div>
    </header>
  </template>
  <style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #462989;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease, opacity 0.3s ease;
    will-change: transform;
  }
  
  .header-hidden {
    transform: translateY(-100%);
    opacity: 0;
  }
  
  .header-visible {
    transform: translateY(0);
    opacity: 1;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .logo {
    display: flex;
    align-items: center;
    color: #ffffff;
    transition: transform 0.3s ease;
    z-index: 1001;
  }
  
  .logo:hover {
    transform: scale(1.05);
  }
  
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  
  .desktop-nav a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #ffffff;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }
  
  .desktop-nav a:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .theme-toggle-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  }
  
  .theme-toggle-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .theme-icon {
    color: white;
    transition: transform 0.3s ease;
  }
  
  .theme-icon.sun {
    color: #9BA4B5;
  }
  
  .theme-icon.moon {
    color: #FFD700;
  }
  
  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 20px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 1100;
  }
  
  .hamburger span {
    width: 100%;
    height: 2px;
    background-color: white;
    transition: all 0.3s ease;
  }
  
  .hamburger.is-active span:first-child {
    transform: rotate(45deg) translate(6px, 6px);
  }
  
  .hamburger.is-active span:nth-child(2) {
    opacity: 0;
  }
  
  .hamburger.is-active span:last-child {
    transform: rotate(-45deg) translate(6px, -6px);
  }
  
  .profile-menu-container {
    position: relative;
  }
  
  .profile-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.75rem;
    border: none;
    border-radius: 0.5rem;
    background: linear-gradient(45deg, #462989, #a597ee, #462989);
    background-size: 200% 100%;
    color: white;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    min-width: 120px;
    animation: gradientMove 3s ease infinite;
    box-shadow: 0 4px 15px rgba(70, 41, 137, 0.2);
  }
  
  .profile-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: 0.5s;
  }
  
  .profile-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(70, 41, 137, 0.4);
  }
  
  .profile-btn:hover::before {
    left: 100%;
  }
  
  .submenu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--text-primary);
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 0.9rem;
}

.submenu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.submenu-item.logout {
  color: #ff6b6b;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
}

.submenu-item.logout:hover {
  background-color: rgba(255, 107, 107, 0.1);
}

.login-btn {
  padding: 0.75rem 1.75rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(
      90deg, 
      rgba(255,255,255,0) 0%, 
      rgba(255,255,255,0.2) 50%, 
      rgba(255,255,255,0) 100%
  );
  background-size: 200% 100%;
  color: white;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-width: 120px;
  animation: gradientMove 3s ease infinite;
  box-shadow: 0 4px 15px rgba(70, 41, 137, 0.2);
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: 0.5s;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(70, 41, 137, 0.4);
}

.login-btn:hover::before {
  left: 100%;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #462989;
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  display: none;
}

.mobile-menu.is-active {
  opacity: 1;
  visibility: visible;
}

.mobile-nav {
  padding: 80px 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mobile-profile-menu {
  width: 100%;
}

.mobile-submenu {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  overflow: hidden;
}

.mobile-submenu .submenu-item {
  color: white;
}

.mobile-submenu .submenu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-submenu .submenu-item.logout {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.textButton {
  position: relative;
  background: linear-gradient(90deg, #ffffff, #f0f0f0, #ffffff);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: shimmer 3s ease infinite;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 0.9rem;
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .desktop-nav {
    display: none !important;
  }

  .hamburger {
    display: flex !important;
  }

  .logo svg {
    width: 48px;
    height: 48px;
  }

  .mobile-menu {
    display: block;
  }

  .mobile-nav .profile-btn,
  .mobile-nav .login-btn {
    width: 100%;
    padding: 1rem;
    margin: 0.5rem 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .mobile-nav a, 
  .mobile-nav button:not(.hamburger) {
    font-size: 1.1rem;
    padding: 1rem;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: white;
    text-decoration: none;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    transition: background-color 0.3s ease;
  }

  .mobile-nav a:hover,
  .mobile-nav button:not(.hamburger):hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .profile-btn.mobile {
    justify-content: space-between;
    width: 100%;
  }

  .mobile-submenu {
    position: static;
    width: 100%;
    box-shadow: none;
  }
}

@media (min-width: 769px) {
  .mobile-menu,
  .hamburger {
    display: none !important;
  }

  .desktop-nav {
    display: flex !important;
  }
}

.dark-mode {
  background-color: #1a1a1a;
}

.dark-mode .submenu {
  background: #2a2a2a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-mode .submenu-item {
  color: #ffffff;
}

.dark-mode .submenu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .mobile-menu {
  background-color: #1a1a1a;
}

.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Fix for iOS Safari */
@supports (-webkit-touch-callout: none) {
  .mobile-menu {
    height: -webkit-fill-available;
  }
}
</style>