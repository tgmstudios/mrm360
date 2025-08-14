<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

// Watch for route changes and initialize auth only when not on login page
watch(() => route.path, async (newPath) => {
  if (!newPath.includes('/auth/login')) {
    console.log('App - route changed, initializing auth for:', newPath)
    // Only initialize if not already authenticated
    if (!authStore.isAuthenticated) {
      await authStore.init()
    }
  } else {
    console.log('App - on login page, skipping auth init')
  }
}, { immediate: true })
</script>

<style>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
