<template>
  <Teleport to="body">
    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <!-- Backdrop -->
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="handleBackdropClick"
      />
    </Transition>

    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <!-- Modal -->
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleBackdropClick"
      >
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            :class="[
              'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full',
              size === 'sm' && 'sm:max-w-lg',
              size === 'md' && 'sm:max-w-2xl',
              size === 'lg' && 'sm:max-w-4xl',
              size === 'xl' && 'sm:max-w-6xl',
              size === 'full' && 'sm:max-w-full sm:m-4'
            ]"
          >
            <!-- Header -->
            <div v-if="$slots.header || title" class="bg-gray-50 px-4 py-3 sm:px-6">
              <div class="flex items-center justify-between">
                <h3 v-if="title" class="text-lg font-medium leading-6 text-gray-900">
                  {{ title }}
                </h3>
                <slot name="header" />
                
                <button
                  v-if="showCloseButton"
                  @click="$emit('close')"
                  class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span class="sr-only">Close</span>
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-4 py-5 sm:p-6">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showCloseButton: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  close: []
}>()

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}
</script>
