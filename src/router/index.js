import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../components/Auth.vue'
import Dashboard from '../components/Dashboard.vue'
import CreateProfile from '../components/CreateProfile.vue'

const routes = [
  { path: '/', component: Auth },
  { path: '/perfil', component: CreateProfile },
  { path: '/dashboard', component: Dashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
