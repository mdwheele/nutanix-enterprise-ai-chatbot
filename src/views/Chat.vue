<script setup>
import { ref, nextTick, onMounted, watchEffect, watch, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import MarkdownItHighlightjs from 'markdown-it-highlightjs'
import { Icon } from "@iconify/vue"
import axios from 'axios'
import ModelSelect from "@/components/ModelSelect.vue"
import RoleSelect from "@/components/RoleSelect.vue"
import LanguageSelect from "@/components/LanguageSelect.vue"
import { useLocalStorage } from '@vueuse/core'
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router"
import useChats from "@/composables/useChats"

const route = useRoute()
const router = useRouter()
const { chats, create, get, has } = useChats()

const markdown = new MarkdownIt()
  .use(MarkdownItHighlightjs)

function render(string) {
  return markdown.render(string)
}

const roles = [
  { name: 'Person', emoji: '💁', prompt: 'You are clearly a person' },
  { name: 'Pirate', emoji: '🏴‍☠️', prompt: 'You respond as if you are the worlds best pirate' },
  { name: 'Dog', emoji: '🐶', prompt: 'You respond as if you are a dog' },
  { name: 'Cat', emoji: '🐱', prompt: 'You respond as if you are a cat' }
]
const selectedRole = useLocalStorage('nai-chat-role', roles[0])

const translations = [
  { name: 'English', flag: '🇬🇧' },
  { name: 'French', flag: '🇫🇷', },
  { name: 'German', flag: '🇩🇪', },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'Serbian', flag: '🇷🇸' }
]
const selectedTranslation = useLocalStorage('nai-chat-translation', translations[0])

const message = ref('')
const messages = ref([])

const systemPrompt = computed(() => {
  return {
    role: 'system',
    content: `
${selectedRole.value.prompt}. 
You are a helpful assistant. If you don't know something, ask questions. Respond only in Markdown format.
${selectedTranslation.value.name !== 'English' ? `Provide translation services between English and ${selectedTranslation.value.name}.` : ''}
    `
  }
})

watch (systemPrompt, (message) => {
  messages.value[0] = systemPrompt.value
}, { immediate: true })

const models = ref([])
const selectedModel = useLocalStorage('nai-chat-model', null)

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.chat !== from.params.chat) {
    messages.value = get(to.params.chat[1]) || [systemPrompt.value]
  }
})

onMounted(async () => {
  const response = await axios.get('/models')
  models.value = response.data.data.map(model => model.id)

  if (models.value.includes(selectedModel.value)) {
    selectedModel.value ??= models.value[0]
  } else {
    selectedModel.value = models.value[0]
  }

  if (route.params.chat.length > 0 && has(route.params.chat[1])) {
    messages.value = get(route.params.chat[1])
  }
})

const loading = ref(false)
const chatContainer = ref(null)

async function send () {
  if (!message.value.trim()) return

  messages.value.push({
    role: 'user',
    content: message.value
  })

  if (route.params.chat.length === 0) {
    const id = create(messages.value)

    router.push({ path: `/c/${id}` })
  }

  loading.value = true

  scrollToBottom()

  const response = await axios.post('/completions', {
    model: selectedModel.value,
    messages: messages.value
  }, {
    responseType: 'stream',
    headers: {
      'Accept': 'text/event-stream',
    },
    adapter: 'fetch'
  })

  message.value = ''
  messages.value.push({
    role: 'assistant',
    content: ''
  })

  const stream = response.data

  const reader = stream.pipeThrough(new TextDecoderStream()).getReader()
  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      loading.value = false
      break
    }

    try {
      const event = JSON.parse(value.replace('data: ', ''))
      if (event.choices[0].delta.content) {
        messages.value[messages.value.length - 1].content += event.choices[0].delta.content
      }
      scrollToBottom()
    } catch (error) {
      //
    }
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

async function scrollToBottom() {
  await nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}
</script>

<template>
  <div v-if="messages.length > 1" class="w-[900px] flex-1 text-zinc-50 overflow-scroll mb-12 space-y-8" ref="chatContainer">
    <template v-for="(message, idx) in messages" :key="idx">
      <div v-if="message.role === 'user'" class="rounded-3xl p-4 w-96 bg-zinc-800 justify-self-end text-lg">
        {{ message.content }}
      </div>
      <div v-else-if="message.role === 'assistant'" class="prose prose-zinc prose-invert" v-html="render(message.content)" />
    </template>
  </div>
  <h1 v-else class="mb-12 text-3xl text-zinc-100 font-bold">How can Nutanix Enterprise AI help you today?</h1>
  <div class="bg-zinc-800 p-5 pt-4 pb-3 rounded-3xl w-[900px]">
    <div class="flex items-center space-x-6 mb-2">
      <input 
        tabindex="0"
        class="flex-1 bg-transparent focus:outline-none text-zinc-100 text-lg"
        type="text" 
        placeholder="Ask anything"
        v-model="message"
        @keydown="handleKeydown" 
        :disabled="loading"
      />
      <button class="rounded-full p-3 bg-zinc-700 text-white" @click="send">
        <Icon icon="heroicons:arrow-up" class="size-5" />
      </button>
    </div>
    <div class="flex items-center gap-6">
      <LanguageSelect :languages="translations" v-model="selectedTranslation" />
      <RoleSelect :roles="roles" v-model="selectedRole" />
      <ModelSelect :models="models" v-model="selectedModel" />
    </div>
  </div>
</template>