<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const name = ref('')
const creditLimit = ref(0)
const isLoading = ref(false)
const error = ref('')
const isEditing = ref(false)
const userId = ref(null)

const fetchProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    error.value = 'No se ha iniciado sesión.'
    return
  }

  userId.value = user.id

  const { data, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    error.value = fetchError.message
  } else if (data) {
    isEditing.value = true
    name.value = data.name
    creditLimit.value = data.credit_limit
  }
}

onMounted(fetchProfile)

const submit = async () => {
  if (!name.value || creditLimit.value <= 0) {
    error.value = 'Por favor completa todos los campos correctamente.'
    return
  }

  isLoading.value = true
  error.value = ''

  const values = {
    name: name.value,
    credit_limit: creditLimit.value
  }

  try {
    let result

    if (isEditing.value) {
      result = await supabase
        .from('user_profiles')
        .update(values)
        .eq('id', userId.value)
    } else {
      result = await supabase
        .from('user_profiles')
        .insert({ id: userId.value, ...values })
    }

    if (result.error) {
      error.value = result.error.message
      return
    }

    router.push('/dashboard')
  } catch (err) {
    error.value = 'Ocurrió un error inesperado.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6">
    <!-- Card principal -->
    <div class="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      <div class="p-8 sm:p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white">Completa tu perfil</h2>
          <p class="mt-2 text-gray-400">
            Antes de comenzar, necesitamos algunos datos básicos para configurar tu cuenta.
          </p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="submit" class="space-y-6">
          <!-- Nombre -->
          <div>
            <label for="name" class="block mb-2 text-sm font-medium text-gray-300">Nombre completo</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="name"
                v-model="name"
                type="text"
                class="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 placeholder-gray-400"
                placeholder="Tu nombre completo"
                required
                autocomplete="name"
              />
            </div>
          </div>

          <!-- Límite de crédito -->
          <div>
            <label for="creditLimit" class="block mb-2 text-sm font-medium text-gray-300">Límite de crédito ($)</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                id="creditLimit"
                v-model.number="creditLimit"
                type="number"
                min="1"
                step="any"
                class="bg-gray-700 border border-gray-600 text-gray-100 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 placeholder-gray-400"
                placeholder="Ej. 5000"
                required
              />
            </div>
          </div>

          <!-- Info box -->
          <div class="p-4 mb-4 text-sm text-indigo-100 bg-indigo-900/30 rounded-lg border border-indigo-800 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>El límite de crédito te ayudará a controlar mejor tus gastos.</span>
          </div>

          <!-- Botón de submit -->
          <button
            type="submit"
            class="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200 flex justify-center items-center"
            :disabled="isLoading"
          >
            <svg
              v-if="isLoading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEditing ? 'Actualizar perfil' : 'Guardar y continuar' }}
          </button>

          <!-- Mensaje de error -->
          <div
            v-if="error"
            class="p-4 mb-4 text-sm text-red-100 bg-red-900/30 rounded-lg border border-red-800 flex items-start"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ error }}</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>