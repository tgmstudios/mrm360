<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-100 mb-4">
        Your Profile
      </h1>
      <p class="text-lg text-gray-300 max-w-2xl mx-auto">
        Manage your account settings, interests, and preferences
      </p>
    </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Profile Info & QR Code -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Profile Card -->
          <div class="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
            <div class="text-center">
              <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl font-bold text-white">
                  {{ getUserInitials(user) }}
                </span>
              </div>
              <h2 class="text-xl font-semibold text-gray-100 mb-2">
                {{ user?.displayName || `${user?.firstName} ${user?.lastName}` }}
              </h2>
              <p class="text-gray-400 mb-4">{{ user?.email }}</p>
              <div class="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <span class="px-3 py-1 bg-gray-700 rounded-full">
                  {{ formatRole(user?.role) }}
                </span>
                <span class="px-3 py-1 bg-gray-700 rounded-full">
                  Member since {{ formatDate(user?.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- QR Code Card -->
          <div class="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-100 mb-4">
              Attendance QR Code
            </h3>
            <div class="text-center">
              <div class="bg-white p-4 rounded-lg border-2 border-gray-600 inline-block mb-4">
                <QRCodeVue3
                  v-if="qrCodeValue"
                  :value="qrCodeValue"
                  :size="200"
                  level="M"
                  render-as="svg"
                />
                <div v-else class="w-[200px] h-[200px] flex items-center justify-center text-gray-400">
                  Loading QR code...
                </div>
              </div>
              <p class="text-sm text-gray-400 mb-4">
                Scan this code to check in at events
              </p>
              <div class="flex space-x-2">
                <button
                  @click="downloadQRCode"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Settings -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Discord Integration -->
          <div class="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-100 mb-4">
              Discord Integration
            </h3>
            
            <div v-if="discordAccount" class="space-y-4">
              <div class="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <img src="@/assets/logos/discord.svg" alt="Discord" class="w-6 h-6" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-100">{{ discordAccount.username }}</p>
                  <p class="text-sm text-gray-400">Linked {{ formatDate(discordAccount.linkedAt) }}</p>
                </div>
                <button
                  @click="unlinkDiscord"
                  :disabled="isUnlinkingDiscord"
                  class="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                  <svg v-if="isUnlinkingDiscord" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span v-else>Unlink</span>
                </button>
              </div>
            </div>
            
            <div v-else class="text-center p-6 bg-gray-700 rounded-lg">
              <div class="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="@/assets/logos/discord.svg" alt="Discord" class="w-8 h-8" />
              </div>
              <h4 class="text-lg font-medium text-gray-100 mb-2">No Discord Account Linked</h4>
              <p class="text-sm text-gray-400 mb-4">
                Link your Discord account to access our community channels and get role assignments
              </p>
              <div class="flex justify-center">
                <button
                  @click="linkDiscord"
                  :disabled="isLinkingDiscord"
                  class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <svg v-if="isLinkingDiscord" class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ isLinkingDiscord ? 'Connecting...' : 'Link Discord Account' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Interests Selection -->
          <div class="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-100 mb-4">
              Your Interests
            </h3>
            <p class="text-sm text-gray-400 mb-6">
              Update your interests to help us assign you to the right teams and channels
            </p>
            
            <!-- Class Rank Selection -->
            <div class="mb-6">
              <h4 class="text-md font-medium text-gray-100 mb-3">
                What's your relationship with Penn State?
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <label 
                  v-for="rank in classRanks" 
                  :key="rank.value"
                  class="relative flex cursor-pointer rounded-lg border border-gray-600 bg-gray-700 p-3 shadow-sm focus:outline-none hover:border-blue-500"
                  :class="{ 'border-blue-500 ring-2 ring-blue-500': selectedClassRank === rank.value }"
                >
                  <input
                    type="radio"
                    name="classRank"
                    :value="rank.value"
                    v-model="selectedClassRank"
                    class="sr-only"
                  />
                  <div class="flex flex-1">
                    <div class="flex flex-col">
                      <span class="block text-sm font-medium text-gray-100">{{ rank.label }}</span>
                      <span class="mt-1 flex items-center text-xs text-gray-400">{{ rank.description }}</span>
                    </div>
                  </div>
                  <div class="ml-3 flex h-4 w-4 items-center justify-center">
                    <div 
                      class="h-3 w-3 rounded-full border-2"
                      :class="selectedClassRank === rank.value ? 'border-blue-500 bg-blue-500' : 'border-gray-500'"
                    >
                      <div v-if="selectedClassRank === rank.value" class="h-1.5 w-1.5 rounded-full bg-white mx-auto mt-0.5"></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Club Interests Selection -->
            <div class="mb-6">
              <h4 class="text-md font-medium text-gray-100 mb-3">
                What interests you most about cybersecurity?
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label 
                  v-for="interest in clubInterests" 
                  :key="interest.value"
                  class="relative flex cursor-pointer rounded-lg border border-gray-600 bg-gray-700 p-3 shadow-sm focus:outline-none hover:border-green-500"
                  :class="{ 'border-green-500 ring-2 ring-green-500': selectedInterests.includes(interest.value) }"
                >
                  <input
                    type="checkbox"
                    :value="interest.value"
                    v-model="selectedInterests"
                    class="sr-only"
                  />
                  <div class="flex flex-1">
                    <div class="flex flex-col">
                      <div class="flex items-center space-x-2">
                        <span class="text-base">{{ interest.emoji }}</span>
                        <span class="block text-sm font-medium text-gray-100">{{ interest.label }}</span>
                      </div>
                      <span class="mt-1 flex items-center text-xs text-gray-400">{{ interest.description }}</span>
                    </div>
                  </div>
                  <div class="ml-3 flex h-4 w-4 items-center justify-center">
                    <div 
                      class="h-3 w-3 rounded border-2 flex items-center justify-center"
                      :class="selectedInterests.includes(interest.value) ? 'border-green-500 bg-green-500' : 'border-gray-500'"
                    >
                      <svg v-if="selectedInterests.includes(interest.value)" class="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div class="flex justify-center">
              <button
                @click="updateInterests"
                :disabled="isUpdatingInterests || !hasInterestsChanged"
                class="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg v-if="isUpdatingInterests" class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isUpdatingInterests ? 'Updating...' : 'Update Interests' }}</span>
              </button>
            </div>
          </div>

          <!-- Newsletter Subscription -->
          <div class="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
            <h3 class="text-lg font-semibold text-gray-100 mb-4">
              Newsletter Preferences
            </h3>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <input
                  id="newsletter"
                  type="checkbox"
                  v-model="subscribeNewsletter"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded mt-1 bg-gray-700"
                />
                <div>
                  <label for="newsletter" class="text-sm font-medium text-gray-100">
                    Subscribe to our newsletter
                  </label>
                  <p class="text-sm text-gray-400 mt-1">
                    Get updates about upcoming events, competitions, workshops, and club news delivered to your email.
                  </p>
                </div>
              </div>
              
              <div class="flex justify-center">
                <button
                  @click="updateNewsletterPreference"
                  :disabled="isUpdatingNewsletter || !hasNewsletterChanged"
                  class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
                >
                  <svg v-if="isUpdatingNewsletter" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ isUpdatingNewsletter ? 'Updating...' : 'Update Preference' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import QRCodeVue3 from 'qrcode-vue3'
import type { User } from '@/types/api'

const authStore = useAuthStore()

// State
const user = ref<User | null>(null)
const discordAccount = ref<any>(null)
const selectedClassRank = ref('')
const selectedInterests = ref<string[]>([])
const subscribeNewsletter = ref(false)
const originalInterests = ref<string[]>([])
const originalNewsletter = ref(false)

// Loading states
const isLinkingDiscord = ref(false)
const isUnlinkingDiscord = ref(false)
const isUpdatingInterests = ref(false)
const isUpdatingNewsletter = ref(false)

// Data
const classRanks = [
  { value: 'FIRST_YEAR', label: '1st Year', description: 'First year student' },
  { value: 'SECOND_YEAR', label: '2nd Year', description: 'Second year student' },
  { value: 'THIRD_YEAR', label: '3rd Year', description: 'Third year student' },
  { value: 'FOURTH_YEAR', label: '4th Year', description: 'Fourth year student' },
  { value: 'ALUMNI_OTHER', label: 'Alumni/Other', description: 'Alumni, industry professionals, etc.' }
]

const clubInterests = [
  { 
    value: 'OFFENSE', 
    emoji: '⚔️', 
    label: 'Offense (CPTC)', 
    description: 'Offensive security and penetration testing' 
  },
  { 
    value: 'DEFENSE', 
    emoji: '🛡️', 
    label: 'Defense (CCDC)', 
    description: 'Defensive security and security monitoring' 
  },
  { 
    value: 'CTF', 
    emoji: '🏳️', 
    label: 'CTF', 
    description: 'Capture the flag competitions and platforms' 
  },
  { 
    value: 'GAMING', 
    emoji: '🎮', 
    label: 'Gaming', 
    description: 'Gaming and social activities' 
  }
]

// Computed
const qrCodeValue = computed(() => {
  if (!user.value) return ''
  // Use the actual QR code from the database if available
  if (user.value.qrCode) {
    console.log('Using QR code from database:', user.value.qrCode)
    return user.value.qrCode
  }
  // Fallback to JSON format for backward compatibility
  const fallbackValue = JSON.stringify({
    userId: user.value.id,
    email: user.value.email,
    timestamp: new Date().toISOString()
  })
  console.log('Using fallback QR code value:', fallbackValue)
  return fallbackValue
})

const hasInterestsChanged = computed(() => {
  return selectedClassRank.value !== user.value?.role ||
         JSON.stringify(selectedInterests.value.sort()) !== JSON.stringify(originalInterests.value.sort())
})

const hasNewsletterChanged = computed(() => {
  return subscribeNewsletter.value !== originalNewsletter.value
})

// Methods
const getUserInitials = (user: User | null) => {
  if (!user?.firstName || !user?.lastName) return '?'
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

const formatRole = (role: string | undefined) => {
  if (!role) return 'Member'
  return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  })
}

const downloadQRCode = async () => {
  if (!qrCodeValue.value) {
    console.error('No QR code value available')
    return
  }

  try {
    // Find the QR code SVG element - use a more specific selector
    const qrCodeContainer = document.querySelector('.bg-white.p-4.rounded-lg.border-2.border-gray-600.inline-block.mb-4')
    console.log('QR code container found:', qrCodeContainer)
    
    if (!qrCodeContainer) {
      console.error('QR code container not found')
      return
    }
    
    const svgElement = qrCodeContainer.querySelector('svg')
    console.log('SVG element found:', svgElement)
    
    if (!svgElement) {
      console.error('QR code SVG not found')
      // Try alternative approach - generate QR code directly
      await generateAndDownloadQRCode()
      return
    }

    // Create a canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Could not get canvas context')
      return
    }

    // Set canvas size (make it larger for better quality)
    canvas.width = 800
    canvas.height = 800

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    // Create image from SVG
    const img = new Image()
    img.onload = () => {
      // Draw white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw the QR code
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = `qr-code-${user.value?.firstName || 'user'}-${Date.now()}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(downloadUrl)
        }
      }, 'image/png')
      
      // Clean up
      URL.revokeObjectURL(url)
    }
    
    img.src = url

  } catch (error) {
    console.error('Error downloading QR code:', error)
    alert('Failed to download QR code. Please try again.')
  }
}

const generateAndDownloadQRCode = async () => {
  try {
    // Import qrcode library to generate actual QR code
    const QRCode = await import('qrcode')
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrCodeValue.value, {
      width: 800,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Create download link
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qr-code-${user.value?.firstName || 'user'}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

  } catch (error) {
    console.error('Error generating QR code:', error)
    alert('Failed to generate QR code. Please try again.')
  }
}



const linkDiscord = () => {
  isLinkingDiscord.value = true
  
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI
  
  if (!clientId || !redirectUri) {
    console.error('Discord OAuth2 configuration missing')
    isLinkingDiscord.value = false
    return
  }

  // Generate state parameter for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  // Store state in sessionStorage with profile context
  sessionStorage.setItem('discord_oauth_state', state)
  sessionStorage.setItem('discord_oauth_context', 'profile')
  
  // Build Discord OAuth2 URL
  const authUrl = new URL('https://discord.com/api/oauth2/authorize')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'identify')
  authUrl.searchParams.set('state', state)
  
  // Redirect to Discord OAuth2
  window.location.href = authUrl.toString()
}

const unlinkDiscord = async () => {
  if (!discordAccount.value) return
  
  isUnlinkingDiscord.value = true
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/unlink-discord`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    if (response.ok) {
      discordAccount.value = null
      await loadUserData()
    } else {
      console.error('Failed to unlink Discord account')
    }
  } catch (error) {
    console.error('Error unlinking Discord account:', error)
  } finally {
    isUnlinkingDiscord.value = false
  }
}

const updateInterests = async () => {
  if (!user.value || !hasInterestsChanged.value) return
  
  isUpdatingInterests.value = true
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/update-interests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify({
        classRank: selectedClassRank.value,
        interests: selectedInterests.value
      })
    })
    
    if (response.ok) {
      await loadUserData()
      originalInterests.value = [...selectedInterests.value]
    } else {
      console.error('Failed to update interests')
    }
  } catch (error) {
    console.error('Error updating interests:', error)
  } finally {
    isUpdatingInterests.value = false
  }
}

const updateNewsletterPreference = async () => {
  if (!user.value || !hasNewsletterChanged.value) return
  
  isUpdatingNewsletter.value = true
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/newsletter-preference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify({
        subscribe: subscribeNewsletter.value
      })
    })
    
    if (response.ok) {
      originalNewsletter.value = subscribeNewsletter.value
    } else {
      console.error('Failed to update newsletter preference')
    }
  } catch (error) {
    console.error('Error updating newsletter preference:', error)
  } finally {
    isUpdatingNewsletter.value = false
  }
}

const loadUserData = async () => {
  try {
    // Load user data
    const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    if (userResponse.ok) {
      const userData = await userResponse.json()
      
      // Map backend fields to frontend User interface
      user.value = {
        ...userData.user,
        isPaid: userData.user.paidStatus, // Map paidStatus to isPaid
        isActive: true, // Default to true since backend doesn't have this field
        authentikGroups: [], // Default empty array since backend doesn't return this
        teams: [], // Default empty array since backend doesn't return this
        events: [] // Default empty array since backend doesn't return this
      }
      
      // Use classRank from the new table, fallback to role if not set
      selectedClassRank.value = userData.user.classRank || userData.user.role
      selectedInterests.value = userData.user.interests || []
      originalInterests.value = [...selectedInterests.value]
    }
    
    // Load Discord status
    const discordResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/discord-status`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    if (discordResponse.ok) {
      const discordData = await discordResponse.json()
      discordAccount.value = discordData.discordAccount
    }
    
    // Load newsletter preference
    const newsletterResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/newsletter-status`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    if (newsletterResponse.ok) {
      const newsletterData = await newsletterResponse.json()
      subscribeNewsletter.value = newsletterData.subscribed
      originalNewsletter.value = newsletterData.subscribed
    }
    
  } catch (error) {
    console.error('Error loading user data:', error)
  }
}

// Load user data on mount
onMounted(async () => {
  await loadUserData()
})
</script>
