import { createApp } from 'vue';
import './style.css';

import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router';

import App from './App.vue';

const app = createApp(App);
app.use(ElementPlus);
app.use(createPinia());
app.use(router);

app.mount('#app');
