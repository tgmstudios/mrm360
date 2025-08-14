<template>
  <div class="auth-layout">
    <h1>MRM360</h1>
    <h2>{{ title }}</h2>
    <p v-if="subtitle">{{ subtitle }}</p>
    
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
  color: #4f46e5;
  margin-bottom: 1rem;
}

.auth-layout h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.auth-layout p {
  color: #666;
  margin-bottom: 2rem;
}

.content {
  max-width: 400px;
  margin: 0 auto;
}
</style>
