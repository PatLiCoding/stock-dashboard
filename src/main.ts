/**
 * @file main.ts
 * Application entry point initializing the Vue instance, Pinia store, router, and mounting to the DOM.
 */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/** Root Vue application instance. */
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
