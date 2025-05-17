
<script setup>
import { ref, onMounted, computed, nextTick, watch  } from 'vue'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout.vue'
import 'flatpickr/dist/flatpickr.min.css'
import 'flatpickr/dist/themes/dark.css'
import flatpickr from 'flatpickr'

const amount = ref('')
const description = ref('')
const categoryId = ref('')
const date = ref('')
const categories = ref([])
const expenses = ref([])
const userProfile = ref(null)
const loading = ref(true)
const datepickerInstance = ref(null)
const selectedCategory = ref('')
const selectedMonth = ref('')
const amountRange = ref([0, 10000])
const filterDate = ref('')
const filterDatepickerInstance = ref(null)
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref('');

const categoryColors = {
  'Alimentos': 'bg-green-600',
  'Transporte': 'bg-blue-600',
  'Entretenimiento': 'bg-purple-600',
  'Educación': 'bg-yellow-600',
  'Salud': 'bg-red-600',
}

const fetchProfileAndExpenses = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  userProfile.value = profile

  const { data: cat } = await supabase.from('categories').select('*')
  categories.value = cat || []

  const { data: gastos } = await supabase
    .from('expenses')
    .select('*, categories(name)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  expenses.value = gastos || []
  loading.value = false
}

const filteredExpenses = computed(() => {
  return expenses.value.filter(expense => {
    const matchesCategory = selectedCategory.value === '' || expense.category_id === selectedCategory.value
    const matchesMonth =
      selectedMonth.value === '' ||
      new Date(expense.date).toISOString().slice(0, 7) === selectedMonth.value
    const matchesAmount = expense.amount >= amountRange.value[0] && expense.amount <= amountRange.value[1]
    return matchesCategory && matchesMonth && matchesAmount
  })
})

const initFilterDatepicker = () => {
  nextTick(() => {
    const input = document.getElementById('filter-date')
    if (input) {
      filterDatepickerInstance.value = flatpickr(input, {
        dateFormat: 'Y-m-d',
        theme: 'dark',
        disableMobile: true,
        allowInput: true,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            filterDate.value = selectedDates[0].toISOString().split('T')[0]
          } else {
            filterDate.value = ''
          }
        },
        locale: {
          firstDayOfWeek: 1,
          weekdays: {
            shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
            longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
          },
          months: {
            shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          }
        }
      })
    }
  })
}

const initDatepicker = () => {
  nextTick(() => {
    const dateInput = document.getElementById('date')
    if (dateInput) {
      datepickerInstance.value = flatpickr(dateInput, {
        dateFormat: 'Y-m-d',
        theme: 'dark',
        disableMobile: true,
        allowInput: true,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            date.value = selectedDates[0].toISOString().split('T')[0]
          }
        },
        locale: {
          firstDayOfWeek: 1,
          weekdays: {
            shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
            longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
          },
          months: {
            shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          }
        }
      })
    }
  })
}

const addExpense = async () => {
  // Validar campos obligatorios
  if (!amount.value) {
    errorMessage.value = 'El campo Monto es requerido';
    showErrorAlert.value = true;
    setTimeout(() => showErrorAlert.value = false, 3000);
    return;
  }
  
  if (!description.value) {
    errorMessage.value = 'El campo Descripción es requerido';
    showErrorAlert.value = true;
    setTimeout(() => showErrorAlert.value = false, 3000);
    return;
  }
  
  if (!categoryId.value) {
    errorMessage.value = 'Debes seleccionar una categoría';
    showErrorAlert.value = true;
    setTimeout(() => showErrorAlert.value = false, 3000);
    return;
  }
  
  if (!date.value) {
    errorMessage.value = 'Debes seleccionar una fecha';
    showErrorAlert.value = true;
    setTimeout(() => showErrorAlert.value = false, 3000);
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    amount: parseFloat(amount.value),
    description: description.value,
    category_id: categoryId.value,
    date: date.value
  });

  if (error) {
    errorMessage.value = 'Error al registrar el gasto: ' + error.message;
    showErrorAlert.value = true;
    setTimeout(() => showErrorAlert.value = false, 3000);
    return;
  }

  // Mostrar alerta de éxito
  showSuccessAlert.value = true;
  setTimeout(() => showSuccessAlert.value = false, 3000);
  
  // Limpiar formulario
  amount.value = '';
  description.value = '';
  categoryId.value = '';
  date.value = '';
  if (datepickerInstance.value) {
    datepickerInstance.value.clear();
  }
  await fetchProfileAndExpenses();
};

const validateNumberInput = (event) => {
  // Permite solo números, un punto decimal o coma
  let value = event.target.value;
  value = value.replace(/[^0-9.,]/g, ''); // Elimina todo excepto números, puntos y comas
  
  // Reemplaza comas por puntos para consistencia
  value = value.replace(/,/g, '.');
  
  // Si hay más de un punto, elimina los adicionales
  const decimalParts = value.split('.');
  if (decimalParts.length > 2) {
    value = decimalParts[0] + '.' + decimalParts.slice(1).join('');
  }
  
  // Actualiza el valor del input
  event.target.value = value;
  amount.value = value;
};

const filteredExpensesList = computed(() => {
  return expenses.value.filter(e => {
    if (!filterDate.value) return true

    // Convierte ambas fechas a YYYY-MM-DD en horario local
    const expenseDate = new Date(e.date).toLocaleDateString('sv-SE') // formato YYYY-MM-DD
    return expenseDate === filterDate.value
  })
})

const expensesByMonth = computed(() => {
  const months = {}
  expenses.value.forEach(expense => {
    const date = new Date(expense.date)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!months[monthYear]) months[monthYear] = 0
    months[monthYear] += expense.amount
  })
  return Object.entries(months).map(([month, total]) => ({
    month,
    total: parseFloat(total.toFixed(2))
  })).sort((a, b) => a.month.localeCompare(b.month))
})

const expensesByCategory = computed(() => {
  const categoriesMap = {}
  expenses.value.forEach(expense => {
    const categoryName = expense.categories?.name || 'Sin categoría'
    if (!categoriesMap[categoryName]) categoriesMap[categoryName] = 0
    categoriesMap[categoryName] += expense.amount
  })
  return Object.entries(categoriesMap).map(([name, total]) => ({
    name,
    total: parseFloat(total.toFixed(2))
  })).sort((a, b) => b.total - a.total)
})

watch(loading, (val) => {
  if (!val) {
    initDatepicker()
    initFilterDatepicker()
  }
  
})

onMounted(() => {
  fetchProfileAndExpenses()
  initDatepicker()
  initFilterDatepicker()
})
</script>


<template>
  <Layout>
     <!-- Alert de éxito -->
  <transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="showSuccessAlert" class="fixed top-4 right-4 z-50">
      <div class="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-medium">¡Gasto registrado correctamente!</span>
      </div>
    </div>
  </transition>

  <!-- Alert de error -->
  <transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="showErrorAlert" class="fixed top-4 right-4 z-50">
      <div class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-medium">{{ errorMessage }}</span>
      </div>
    </div>
  </transition>
    <div class="space-y-2">
      <!-- Sección superior: Resumen y Formulario -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Resumen -->
        <div class="p-4 bg-gray-800 rounded-lg shadow h-full flex flex-col justify-center">
            <h2 class="text-lg font-semibold mb-4 text-white text-center">Resumen de Crédito</h2>
            
            <div class="space-y-3 flex flex-col items-center">
                <!-- Límite de crédito -->
                <div class="flex justify-between items-center w-full max-w-xs">
                <span class="text-sm text-gray-300">Límite de crédito:</span>
                <span class="text-sm font-medium text-white">${{ userProfile?.credit_limit?.toLocaleString() }}</span>
                </div>
                
                <!-- Total gastado -->
                <div class="flex justify-between items-center w-full max-w-xs">
                <span class="text-sm text-gray-300">Total gastado:</span>
                <span class="text-sm font-medium text-amber-400">${{ expenses.reduce((t, e) => t + e.amount, 0).toLocaleString() }}</span>
                </div>
                
                <!-- Disponible -->
                <div class="flex justify-between items-center w-full max-w-xs pt-2 border-t border-gray-700">
                <span class="text-sm text-gray-300">Disponible:</span>
                <span class="text-sm font-medium" :class="{
                    'text-green-400': userProfile?.credit_limit - expenses.reduce((t, e) => t + e.amount, 0) >= 0,
                    'text-red-500': userProfile?.credit_limit - expenses.reduce((t, e) => t + e.amount, 0) < 0
                }">
                    ${{ (userProfile?.credit_limit - expenses.reduce((t, e) => t + e.amount, 0)).toLocaleString() }}
                </span>
                </div>
            </div>
            </div>

        <!-- Formulario de gasto -->
        <form @submit.prevent="addExpense" class="bg-gray-800 rounded-lg shadow p-4 md:col-span-2">
            <h2 class="text-lg font-semibold mb-4 text-white">Agregar Gasto</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <!-- Monto -->
                <div>
                <label for="amount" class="block mb-2 text-sm font-medium text-white">Monto</label>
                <input
                    v-model="amount"
                    type="text"
                    id="amount"
                    placeholder="Monto"
                    class="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 placeholder-gray-400"
                    oninput="this.value = this.value.replace(/[^0-9.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, '')"
                />
                </div>

                <!-- Descripción -->
                <div>
                <label for="description" class="block mb-2 text-sm font-medium text-white">Descripción</label>
                <input
                    v-model="description"
                    type="text"
                    id="description"
                    placeholder="Descripción"
                    class="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 placeholder-gray-400"
                />
                </div>

                <!-- Categoría -->
                <div>
                <label for="category" class="block mb-2 text-sm font-medium text-white">Categoría</label>
                <select
                    v-model="categoryId"
                    id="category"
                    class="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                >
                    <option value="" disabled>Seleccionar categoría</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
                </div>

                <!-- Fecha con Flatpickr moderno -->
                <div>
                  <label for="date" class="block mb-2 text-sm font-medium text-white">Fecha</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <svg class="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                      </svg>
                    </div>
                    <input
                      id="date"
                      type="text"
                      placeholder="Selecciona fecha"
                      class="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full ps-10 p-2.5 placeholder-gray-400"
                    />
                  </div>
                </div>
            </div>

            <!-- Botón -->
            <button
                type="submit"
                class="mt-4 w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
                Guardar Gasto
            </button>
            </form>
      </div>

      <!-- Gráficos de análisis -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gráfico de gastos por mes -->
        <div class="bg-gray-800 rounded-lg shadow p-4">
          <h2 class="text-xl font-bold text-white mb-4">Gastos por Mes</h2>
          <div v-if="loading" class="text-gray-300">Cargando...</div>
          <div v-else-if="expensesByMonth.length === 0" class="text-gray-400">No hay datos para mostrar.</div>
          <div v-else class="h-64">
            <div class="relative h-full">
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-400">
                  <thead class="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr>
                      <th scope="col" class="px-6 py-3">Mes</th>
                      <th scope="col" class="px-6 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in expensesByMonth" :key="item.month" class="border-b border-gray-700">
                      <td class="px-6 py-4">{{ item.month }}</td>
                      <td class="px-6 py-4 text-right">${{ item.total.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráfico de gastos por categoría -->
        <div class="bg-gray-800 rounded-lg shadow p-4">
          <h2 class="text-xl font-bold text-white mb-4">Gastos por Categoría</h2>
          <div v-if="loading" class="text-gray-300">Cargando...</div>
          <div v-else-if="expensesByCategory.length === 0" class="text-gray-400">No hay datos para mostrar.</div>
          <div v-else class="h-64">
            <div class="relative h-full">
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-400">
                  <thead class="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr>
                      <th scope="col" class="px-6 py-3">Categoría</th>
                      <th scope="col" class="px-6 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in expensesByCategory" :key="item.name" class="border-b border-gray-700">
                      <td class="px-6 py-4">{{ item.name }}</td>
                      <td class="px-6 py-4 text-right">${{ item.total.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de gastos -->
        <div class="bg-gray-800 rounded-lg shadow p-4 space-y-4">
        <!-- Encabezado y Filtros -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 class="text-xl font-bold text-white">Historial de Gastos</h2>
            
            <!-- Filtro de Fecha con icono -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div class="relative w-full sm:w-48">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <input
                        id="filter-date"
                        type="text"
                        placeholder="Selecciona fecha"
                        class="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 placeholder-gray-400"
                    />
                </div>
            </div>
        </div>

        <!-- Contenido -->
        <div v-if="loading" class="flex justify-center py-8">
            <div class="text-gray-300 animate-pulse">Cargando gastos...</div>
        </div>
        
        <div v-else-if="filteredExpensesList.length === 0" class="flex flex-col items-center py-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-400">No hay gastos registrados</p>
        </div>
        
        <div v-else class="border border-gray-700 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-700 text-gray-300">
                <tr>
                    <th scope="col" class="px-4 py-3 text-left font-medium">Fecha</th>
                    <th scope="col" class="px-4 py-3 text-left font-medium">Categoría</th>
                    <th scope="col" class="px-4 py-3 text-left font-medium">Descripción</th>
                    <th scope="col" class="px-4 py-3 text-right font-medium">Monto</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                <tr v-for="g in filteredExpensesList" :key="g.id" class="hover:bg-gray-700/50 transition-colors">
                    <td class="px-4 py-3 whitespace-nowrap">{{ new Date(g.date).toLocaleDateString() }}</td>
                    <td class="px-4 py-3">
                    <span class="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium bg-indigo-600 text-gray-300">
                        {{ g.categories?.name || 'Sin categoría' }}
                    </span>
                    </td>
                    <td class="px-4 py-3 text-gray-300 max-w-xs truncate">{{ g.description }}</td>
                    <td class="px-4 py-3 text-right font-medium text-red-400">-${{ g.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>
        </div>
    </div>
  </Layout>
</template>