import { useStorage } from "@vueuse/core"
import { computed } from 'vue'

const chats = useStorage('nai-chats', {})

export default function useChats() {
  return {
    has(id) {
      return chats.value[id] !== undefined
    },
    get(id) {
      return chats.value[id]
    },
    create(messages) {
      const id = self.crypto.randomUUID()
      chats.value[id] = messages

      return id
    },
    remove(id) {
      delete chats.value[id]
    },
    chats
  }
}
