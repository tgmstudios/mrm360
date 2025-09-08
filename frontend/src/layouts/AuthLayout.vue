<template>
  <div class="auth-layout bg-gray-900 min-h-screen flex flex-col justify-center">
    <div class="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">CCSO MRM</h1>
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-100 mb-2">{{ title }}</h2>
        <p v-if="subtitle" class="text-sm sm:text-base text-gray-400">{{ subtitle }}</p>
      </div>
      
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Welcome back',
  subtitle: 'Use your MRM360 credentials to access your account'
})
</script>

<style scoped>
.content {
  width: 100%;
}
</style>
