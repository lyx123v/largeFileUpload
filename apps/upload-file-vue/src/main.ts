import { createApp } from 'vue';
import './style.css';

import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router';
import indexDB from './utils/storage';
await indexDB.init(); // 在入口函数初始化

import App from './App.vue';

const app = createApp(App);
app.use(ElementPlus);
app.use(createPinia());
app.use(router);

app.mount('#app');
