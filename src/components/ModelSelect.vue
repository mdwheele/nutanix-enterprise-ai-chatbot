<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { Icon } from "@iconify/vue"

const props = defineProps({
  modelValue: String,
  models: Array
})

const modelValue = defineModel()
</script>

<template>
  <div>
    <Menu as="div" class="relative inline-block text-left">
      <div>
        <MenuButton
          class="inline-flex w-full items-center justify-center rounded-md text-sm font-medium text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        >
          {{ modelValue || 'Model' }}
          <Icon icon="heroicons:chevron-down"
            class="-mr-1 ml-2 size-4 text-zinc-100 hover:text-zinc-100"
            aria-hidden="true"
          />
        </MenuButton>
      </div>

      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="absolute left-16 bottom-6 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-zinc-600 shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          <div class="px-1 py-1">
            <MenuItem v-for="model in models" :key="model" v-slot="{ active }">
              <button
                :class="[
                  active ? 'bg-violet-500 text-white' : 'text-zinc-100',
                  'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                ]"
                @click="modelValue = model"
              >
                {{ model }}
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>
  </div>
</template>
