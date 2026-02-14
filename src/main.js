import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'

createApp(App).mount('#app')

if (import.meta.env?.DEV) {
  fetch('/meta.json')
    .then((r) => (r.ok ? null : Promise.reject(new Error(`${r.status}`))))
    .catch(() => console.warn('[dev] meta.json not found or failed to load (404 is OK in dev)'))
}
