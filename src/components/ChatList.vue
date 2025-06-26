<script setup>
import useChats from "@/composables/useChats"
import { Icon } from "@iconify/vue"
import { useRouter } from "vue-router"

const { chats, remove } = useChats()
const router = useRouter()

function del(id) {
  router.push({ path: '/' })
  remove(id)
}
</script>

<template>
  <div v-if="Object.values(chats).length > 0">
    <h3 class="ml-2 mb-2 mt-8 text-zinc-400 font-bold">Chats</h3> 

    <div>
      <router-link :to="{ path: `/c/${id}`}" v-for="([id, messages]) in Object.entries(chats)" class="group flex justify-between truncate text-left w-full text-white hover:bg-zinc-800 rounded-lg py-2 px-2">
        <span>{{ messages[1].content }}</span>
        <button @click.stop.prevent="del(id)">
          <Icon icon="heroicons:trash" class="size-6 group-hover:text-zinc-500 text-transparent" />
        </button>
      </router-link>
    </div>
  </div>
</template>