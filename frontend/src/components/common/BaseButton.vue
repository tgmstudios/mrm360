<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      // Size variants
      size === 'sm' && 'px-3 py-2 text-sm',
      size === 'md' && 'px-4 py-2 text-sm',
      size === 'lg' && 'px-6 py-3 text-base',
      size === 'xl' && 'px-8 py-4 text-lg',
      // Color variants
      variant === 'primary' && [
        'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        'disabled:bg-indigo-400 disabled:cursor-not-allowed'
      ],
      variant === 'secondary' && [
        'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        'disabled:bg-gray-400 disabled:cursor-not-allowed'
      ],
      variant === 'success' && [
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        'disabled:bg-green-400 disabled:cursor-not-allowed'
      ],
      variant === 'danger' && [
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        'disabled:bg-red-400 disabled:cursor-not-allowed'
      ],
      variant === 'outline' && [
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
        'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'
      ],
      variant === 'ghost' && [
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        'disabled:text-gray-400 disabled:cursor-not-allowed'
      ]
    ]"
    @click="$emit('click', $event)"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    
    <!-- Icon -->
    <component
      v-if="icon && !loading"
      :is="icon"
      :class="[
        'mr-2 h-4 w-4',
        size === 'sm' && 'h-3 w-3',
        size === 'lg' && 'h-5 w-5',
        size === 'xl' && 'h-6 w-6'
      ]"
    />
    
    <!-- Content -->
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  icon?: any
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
