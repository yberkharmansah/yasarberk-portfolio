// src/main.js
import { createApp } from 'vue'
import './style.css' // Kendi özel CSS'iniz için kalsın
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia';

// Bootstrap CSS ve JS'i import edin
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Popper.js dahil

// Font Awesome CSS'i import edin (eğer kullanmaya devam edecekseniz)
import '@fortawesome/fontawesome-free/css/all.min.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');