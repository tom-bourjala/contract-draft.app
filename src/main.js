import { createApp } from 'vue'
import { anu } from 'anu-vue'
import {createRouter, createWebHistory} from 'vue-router'

import './assets/main.css'
import './assets/markdown.css'
import './assets/json.css'

// UnoCSS import
import 'uno.css'

// anu styles
import 'anu-vue/dist/style.css'

// default theme styles
import '@anu-vue/preset-theme-default/dist/style.css'

//Routes
import App from './components/App.vue'
import Docs from './components/Docs.vue'
import ContractDrafter from "./components/ContractDrafter.vue";

const routes = [
    { path: '/', component: ContractDrafter },
    { path: '/docs', component: Docs },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App)
    .use(router)
    .use(anu)
    .mount('#app')
