<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from './lib/supabase'

const session = ref(null)
const userProfile = ref(null)
const router = useRouter()
const route = useRoute()
const isLoading = ref(true)

const fetchProfile = async () => {
  if (!session.value) return
  
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.value.user.id)
    .single()
  
  userProfile.value = data
  isLoading.value = false
  
  // Redirect based on profile existence
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

const handleLogout = async () => {
  await supabase.auth.signOut()
}

const isAuthenticated = computed(() => !!session.value)
const hasProfile = computed(() => !!userProfile.value)
</script>

<template>
  <router-view />
</template>
<style scoped>

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-enter-active {
  animation: fadeIn 0.3s;
}
.fade-leave-active {
  animation: fadeIn 0.3s reverse;
}
</style>