import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'flowbite'; 
import flatpickr from 'flatpickr'
// import { Flowbite } from 'flowbite-vue' 
import './assets/main.css'

const app = createApp(App)

app.use(router)
app.mount('#app')
