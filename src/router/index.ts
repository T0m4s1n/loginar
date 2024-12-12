import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CreationView from '../views/CreationView.vue'
import CommerceLayout from '../components/CommerceLayout.vue'
import CommerceDashboard from '../components/CommerceDashboard.vue'
import VistaGeneral from '../components/VistaGeneral.vue'
import Chatbot from '../components/Chatbot.vue'
import BusinessPart from '../components/BusinessPart.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/business',
      name: 'business',
      component: BusinessPart,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path:'/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/creation',
      name: 'creation',
      component: CreationView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: CommerceDashboard
    },
    {
      path: '/commerce/:id',
      component: CommerceLayout,
      children: [
        {
          path: '',
          redirect: to => `/commerce/${to.params.id}/overview`
        },
        {
          path: 'chatbot',
          name: 'chatbot',
          component: Chatbot
        },
        {
          path: 'overview',
          name: 'vista-general',
          component: VistaGeneral
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../components/Products.vue')
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('../components/Inventory.vue')
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('../components/Analytics.vue')
        },
        {
          path: 'Providers',
          name: 'Popo',
          component:() => import('../components/Popo.vue')
        }
      ]
    },
  ],
})

export default router