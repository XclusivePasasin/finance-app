<template>
  <div class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Header -->
    <header v-if="isAuthenticated" class="bg-gray-800 border-b border-gray-700 shadow-sm">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo and toggle -->
          <div class="flex items-center">
            <button
              @click="toggleSidebar"
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
            >
              <span class="sr-only">Abrir menú</span>
              <svg
                class="h-6 w-6"
                :class="{ 'hidden': sidebarOpen, 'block': !sidebarOpen }"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                class="h-6 w-6"
                :class="{ 'hidden': !sidebarOpen, 'block': sidebarOpen }"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div class="flex-shrink-0 flex items-center ml-4">
              
            </div>
          </div>
          
          <!-- User menu for mobile -->
          <div class="md:hidden">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-300 hover:text-white rounded-md transition-colors duration-200"
            >
              <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <span class="text-white font-medium">{{ userProfile?.name?.charAt(0) || 'U' }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Mobile Sidebar (Overlay) -->
      <div 
        v-if="sidebarOpen" 
        class="fixed inset-0 z-40 md:hidden"
        @click="sidebarOpen = false"
      >
        <div class="fixed inset-0 bg-opacity-75"></div>
      </div>

      <!-- Sidebar -->
      <aside 
        class="fixed md:sticky top-0 h-full z-50 bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out"
        :class="{
            'w-64': true,
            'translate-x-0': sidebarOpen,
            '-translate-x-full md:translate-x-0': !sidebarOpen
        }"
      >
        <div class="flex flex-col h-full">
          <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div class="flex items-center justify-between px-4 mb-5">
              <h2 class="text-lg font-semibold text-gray-200">Menú</h2>
              <button 
                @click="sidebarOpen = false"
                class=" text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav class="flex-1 px-2 space-y-1">
              <router-link 
                to="/dashboard" 
                class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                active-class="bg-gray-900 text-white"
                @click="sidebarOpen = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </router-link>
              
              <router-link 
                to="/perfil" 
                class="group flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                active-class="bg-gray-900 text-white"
                @click="sidebarOpen = false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </router-link>
            </nav>
          </div>
          
          <!-- User dropdown -->
          <div class="p-4 border-t border-gray-700 relative">
            <button 
              @click="toggleUserMenu"
              class="w-full flex items-center focus:outline-none"
            >
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span class="text-white font-medium">{{ userProfile?.name?.charAt(0) || 'U' }}</span>
                </div>
              </div>
              <div class="ml-3 text-left">
                <p class="text-sm font-medium text-white truncate">{{ userProfile?.name || 'Usuario' }}</p>
                <p class="text-xs font-medium text-gray-400">Límite: ${{ userProfile?.credit_limit?.toLocaleString() || '0' }}</p>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="ml-auto h-5 w-5 text-gray-400 transform transition-transform duration-200"
                :class="{ 'rotate-180': userMenuOpen }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div 
                v-if="userMenuOpen"
                class="origin-top-right absolute left-4 right-4 bottom-16 mt-2 rounded-md shadow-lg bg-gray-700 ring-1 ring-opacity-5 focus:outline-none z-10"
              >
                <div class="py-1">
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </div>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main 
        class="flex-1 overflow-y-auto focus:outline-none bg-gray-900 text-white transition-all duration-300 ease-in-out"
      >
        <div class="py-6">
          <div class="mx-auto px-4 sm:px-6 md:px-4">
            <div v-if="isLoading" class="flex items-center justify-center h-64">
              <div class="flex flex-col items-center">
                <svg class="animate-spin h-12 w-12 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-400">Cargando...</p>
              </div>
            </div>
            <div v-else>
              <slot />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const route = useRoute()

const session = ref(null)
const userProfile = ref(null)
const isLoading = ref(true)
const sidebarOpen = ref(false)
const userMenuOpen = ref(false)

const fetchProfile = async () => {
  if (!session.value) return

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.value.user.id)
    .single()

  userProfile.value = data
  isLoading.value = false

  // Redirección según existencia del perfil
  if (!data && route.path !== '/perfil') {
    router.push('/perfil')
  } else if (data && route.path === '/perfil') {
    router.push('/dashboard')
  }
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  if (session.value) {
    await fetchProfile()
  } else {
    isLoading.value = false
    if (route.path !== '/') {
      router.push('/')
    }
  }

  supabase.auth.onAuthStateChange(async (_event, newSession) => {
    session.value = newSession
    if (newSession) {
      await fetchProfile()
    } else {
      userProfile.value = null
      isLoading.value = false
      router.push('/')
    }
  })
})

const isAuthenticated = computed(() => !!session.value)
const hasProfile = computed(() => !!userProfile.value)

const handleLogout = async () => {
  await supabase.auth.signOut()
  userMenuOpen.value = false
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}
</script>

<style scoped>
/* Agrega estilos adicionales si son necesarios */
</style>