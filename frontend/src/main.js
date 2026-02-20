import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);

// Initialize Pinia first
const pinia = createPinia();
app.use(pinia);

// Import router after Pinia is set up
import('./router').then(module => {
  app.use(module.default);
  app.mount('#app');
});
