<script setup>
import { ref, nextTick, onMounted, watchEffect, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import MarkdownItHighlightjs from 'markdown-it-highlightjs'
import { Icon } from "@iconify/vue"
import axios from 'axios'
import ModelSelect from "./components/ModelSelect.vue"
import RoleSelect from "./components/RoleSelect.vue"
import LanguageSelect from "./components/LanguageSelect.vue"

const markdown = new MarkdownIt()
  .use(MarkdownItHighlightjs)

function render(string) {
  return markdown.render(string)
}

const roles = [
  { name: 'Person', emoji: '💁', prompt: null },
  { name: 'Pirate', emoji: '🏴‍☠️', prompt: 'You respond as if you are the worlds best pirate' },
  { name: 'Dog', emoji: '🐶', prompt: 'You respond as if you are a dog' },
  { name: 'Cat', emoji: '🐱', prompt: 'You respond as if you are a cat' }
]
const selectedRole = ref(roles[0])

const translations = [
  { name: 'English', flag: '🇬🇧' },
  { name: 'French', flag: '🇫🇷', },
  { name: 'German', flag: '🇩🇪', },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'Serbian', flag: '🇷🇸' }
]
const selectedTranslation = ref(translations[0])

const message = ref('')
const messages = ref([{ role: "system", content: "You are a helpful assistant." }])

watch([selectedRole, selectedTranslation], ([role, translation]) => {
  const systemPrompt = messages.value[0]

  systemPrompt.content = `You are a helpful assistant. ${role.prompt}. Provide translation services on separate lines between English and ${translation.name}.`
})

const models = ref([])
const selectedModel = ref(null)

onMounted(async () => {
  const response = await axios.get('/models')
  models.value = response.data.data.map(model => model.id)
  selectedModel.value = models.value[0] || 'mistral7b'
})

const loading = ref(false)
const chatContainer = ref(null)

async function send () {
  if (!message.value.trim()) return

  messages.value.push({
    role: 'user',
    content: message.value
  })

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
      messages.value[messages.value.length - 1].content += event.choices[0].delta.content
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
  <div class="h-screen antialiased flex flex-col items-center justify-center bg-zinc-900 py-12">
    <div v-if="messages.length > 1" class="w-[900px] flex-1 text-zinc-50 overflow-scroll mb-12 space-y-8" ref="chatContainer">
      <template v-for="(message, idx) in messages" :key="idx">
        <div v-if="message.role === 'user'" class="rounded-3xl p-4 w-96 bg-zinc-800 justify-self-end text-lg">
          {{ message.content }}
        </div>
        <div v-else-if="message.role === 'assistant'" class="prose prose-lg prose-zinc prose-invert" v-html="render(message.content)" />
      </template>
    </div>
    <h1 v-else class="mb-12 text-3xl text-zinc-100 font-bold">How can Nutanix Enterprise AI help you today?</h1>
    <div class="bg-zinc-800 p-5 pt-4 pb-3 rounded-3xl w-[900px]">
      <div class="flex items-center space-x-6 mb-2">
        <input 
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
  </div>
</template>
