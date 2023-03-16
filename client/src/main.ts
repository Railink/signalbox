import { createApp } from 'vue'
import './assets/css/style.css'
import App from './App.vue'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import Home from './views/Home.vue';
import LightingVue from './views/Lighting.vue';
import SwitchesVue from './views/Switches.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/lighting',
            name: 'Lighting',
            component: LightingVue
        },
        {
            path: '/switches',
            name: 'Switches',
            component: SwitchesVue
        }
    ]
})

createApp(App).use(router).mount('#app')
