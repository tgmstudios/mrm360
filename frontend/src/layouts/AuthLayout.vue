<template>
  <div class="auth-layout bg-gray-900 min-h-screen">
    <h1 class="text-blue-400">CCSO MRM</h1>
    <h2 class="text-gray-100">{{ title }}</h2>
    <p v-if="subtitle" class="text-gray-400">{{ subtitle }}</p>
    
    <div class="content">
      <slot />
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
.auth-layout {
  padding: 20px;
  text-align: center;
}

.auth-layout h1 {
  font-size: 2rem;
  color: #60a5fa;
  margin-bottom: 1rem;
}

.auth-layout h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.auth-layout p {
  color: #9ca3af;
  margin-bottom: 2rem;
}

.content {
  max-width: 400px;
  margin: 0 auto;
}
</style>
