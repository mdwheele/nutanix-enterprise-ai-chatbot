<script setup>
import { Icon } from "@iconify/vue"
import ChatList from "@/components/ChatList.vue"

</script>

<template>
  <div class="h-screen flex antialiased bg-zinc-900">
    <div class="w-64 px-4 py-12 bg-zinc-950 text-zinc-50">
      <router-link to="/" class="flex items-center gap-2 w-full hover:bg-zinc-800 rounded-lg py-2 px-3 font-semibold">
        <Icon icon="heroicons:pencil-square" class="size-6" />
        <span>New Chat</span>
      </router-link>

      <ChatList />
    </div>
    <div class="flex-1 py-12 flex flex-col items-center justify-center">
      <router-view />
    </div>
  </div>
</template>
