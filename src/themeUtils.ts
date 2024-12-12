import { ref } from 'vue'

export const isDarkMode = ref(false)

export const themeUtils = {
  init() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.enableDarkMode()
    } else {
      this.enableLightMode()
    }
  },

  toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    if (isDarkMode.value) {
      this.enableDarkMode()
    } else {
      this.enableLightMode()
    }
  },

  enableDarkMode() {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    localStorage.setItem('theme', 'dark')
    isDarkMode.value = true
  },

  enableLightMode() {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
    isDarkMode.value = false
  }
}

export const ThemePlugin = {
  install: (app: any) => {
    app.config.globalProperties.$theme = themeUtils
    themeUtils.init()
  }
}