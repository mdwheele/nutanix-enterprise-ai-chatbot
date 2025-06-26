import './assets/main.css'
import 'highlight.js/styles/monokai.css'
import 'tippy.js/dist/tippy.css'
import VueTippy from 'vue-tippy'
import { createRouter, createWebHistory } from 'vue-router'

import { createApp } from 'vue'
import App from './App.vue'
import Chat from "./views/Chat.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      name: 'new',
      path: '/:chat*',
      component: Chat
    }
  ]
})

const app = createApp(App)

app.use(VueTippy)
app.use(router)

app.mount('#app')
