import './assets/main.css'
import 'highlight.js/styles/monokai.css'
import 'tippy.js/dist/tippy.css'
import VueTippy from 'vue-tippy'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(VueTippy)

app.mount('#app')
