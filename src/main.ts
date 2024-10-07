import { createApp } from 'vue';
import {VueQueryPlugin } from '@tanstack/vue-query';
import './style.css';
import App from './App.vue';
import vuetify from './plugins/vuetify';

const app = createApp(App);

app.use(VueQueryPlugin).use(vuetify).mount('#app');
