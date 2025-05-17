<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const isLogin = ref(true)
const isLoading = ref(false)
const showAlert = ref(false)

const submit = async () => {
  error.value = ''
  showAlert.value = false

  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Todos los campos son obligatorios.'
    showAlert.value = true
    return
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    showAlert.value = true
    return
  }

  isLoading.value = true

  try {
    let result

    if (isLogin.value) {
      result = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
    } else {
      result = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      })
    }

    if (result.error) {
      error.value = result.error.message || 'Error de autenticación.'
      showAlert.value = true
    } else if (!isLogin.value && result.data?.user) {
      // Crear un perfil vacío después del registro
      await supabase.from('user_profiles').insert({
        id: result.data.user.id,
        name: null,
        credit_limit: null
      })
      error.value = '¡Registro exitoso! Verifica tu correo electrónico.'
      showAlert.value = true
    } else if (result.data?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('name, credit_limit')
        .eq('id', result.data.user.id)
        .maybeSingle()

      console.log('Perfil:', profile)
      console.log('Error en consulta de perfil:', profileError)

      if (profileError) {
        error.value = 'Error al consultar el perfil.'
        showAlert.value = true
        return
      }

      // Verifica si ambos campos están vacíos
      const isProfileEmpty = !profile?.name?.trim() && profile?.credit_limit == null

      console.log('isProfileEmpty:', isProfileEmpty)

      if (isProfileEmpty) {
        router.push('/perfil')
      } else {
        router.push('/dashboard')
      }
    }
  } catch (err) {
    error.value = 'Ocurrió un error inesperado.'
    showAlert.value = true
    console.error('Error general:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="bg-gray-900 min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <!-- CARD -->
      <div class="bg-gray-800 rounded-lg shadow-xl p-8 sm:p-10 border border-gray-700">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-100">
            {{ isLogin ? 'Iniciar sesión' : 'Crear cuenta' }}
          </h2>
          <p class="mt-2 text-sm text-gray-400">
            {{ isLogin ? 'Ingresa tus credenciales' : 'Completa el formulario para registrarte' }}
          </p>
        </div>

        <!-- ALERTA -->
        <div
          v-if="error && showAlert"
          class="flex items-start gap-3 mb-6 p-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg"
          role="alert"
        >
          <svg
            class="flex-shrink-0 w-5 h-5 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="flex-1">
            {{ error }}
          </div>
          <button @click="showAlert = false" class="text-gray-400 hover:text-gray-300">
            <span class="sr-only">Cerrar</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- FORM -->
        <form @submit.prevent="submit" class="space-y-6">
          <div>
            <label for="email" class="block mb-2 text-sm font-medium text-gray-300">Correo electrónico</label>
            <input
              type="email"
              id="email"
              v-model="email"
              autocomplete="email"
              class="bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 placeholder-gray-400"
              placeholder="usuario@gmail.com"
              required
            />
          </div>

          <div>
            <label for="password" class="block mb-2 text-sm font-medium text-gray-300">Contraseña</label>
            <input
              type="password"
              id="password"
              v-model="password"
              autocomplete="current-password"
              minlength="6"
              class="bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-500 font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors duration-200"
            :disabled="isLoading"
          >
            <div class="flex items-center justify-center gap-2">
              <svg
                v-if="isLoading"
                class="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              <span>
                {{ isLogin ? 'Iniciar sesión' : 'Registrarse' }}
              </span>
            </div>
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-400">
          {{ isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?' }}
          <button
            @click.prevent="isLogin = !isLogin"
            class="font-medium text-indigo-400 hover:text-indigo-300 hover:underline ml-1 transition-colors duration-200"
          >
            {{ isLogin ? 'Regístrate' : 'Inicia sesión' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>