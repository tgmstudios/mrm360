<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" @click="closeModal"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-100">
                Record Payment for {{ user?.displayName }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-400">
                  Select the payment type and amount for this user.
                </p>
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <div class="mt-6 space-y-4">
            <!-- Payment Type Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Payment Type
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="paymentData.paymentType = 'SEMESTER'"
                  :class="[
                    'p-4 rounded-lg border-2 transition-all duration-200',
                    paymentData.paymentType === 'SEMESTER'
                      ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  ]"
                >
                  <div class="text-center">
                    <div class="text-lg font-semibold">Semester</div>
                    <div class="text-sm text-gray-400">4 months</div>
                    <div class="text-sm font-medium mt-1">${{ semesterAmount }}</div>
                  </div>
                </button>
                <button
                  @click="paymentData.paymentType = 'YEARLY'"
                  :class="[
                    'p-4 rounded-lg border-2 transition-all duration-200',
                    paymentData.paymentType === 'YEARLY'
                      ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  ]"
                >
                  <div class="text-center">
                    <div class="text-lg font-semibold">Yearly</div>
                    <div class="text-sm text-gray-400">12 months</div>
                    <div class="text-sm font-medium mt-1">${{ yearlyAmount }}</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Custom Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-400 sm:text-sm">$</span>
                </div>
                <input
                  v-model.number="paymentData.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full pl-7 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <!-- Payment Method -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                v-model="paymentData.paymentMethod"
                class="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="venmo">Venmo</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Transaction ID -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Transaction ID (Optional)
              </label>
              <input
                v-model="paymentData.transactionId"
                type="text"
                class="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter transaction ID if applicable"
              />
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="createPayment"
            :disabled="!isFormValid || isCreating"
            :class="[
              'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200',
              isFormValid && !isCreating
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-500 cursor-not-allowed'
            ]"
          >
            <span v-if="isCreating" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Payment...
            </span>
            <span v-else>Create Payment</span>
          </button>
          <button
            @click="closeModal"
            :disabled="isCreating"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PaymentService } from '@/services/paymentService'
import { useToast } from 'vue-toastification'
import type { User } from '@/types/api'

interface Props {
  isOpen: boolean
  user: User | null
}

interface Emits {
  (e: 'close'): void
  (e: 'payment-created'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const paymentService = new PaymentService()
const toast = useToast()

// Payment form data
const paymentData = ref({
  paymentType: 'SEMESTER' as 'SEMESTER' | 'YEARLY',
  amount: 50,
  paymentMethod: '',
  transactionId: ''
})

const isCreating = ref(false)

// Default amounts (can be configured)
const semesterAmount = 20
const yearlyAmount = 30

// Computed
const isFormValid = computed(() => {
  return paymentData.value.paymentType && 
         paymentData.value.amount > 0 && 
         paymentData.value.paymentMethod
})

// Watch for payment type changes to update amount
watch(() => paymentData.value.paymentType, (newType) => {
  if (newType === 'SEMESTER') {
    paymentData.value.amount = semesterAmount
  } else if (newType === 'YEARLY') {
    paymentData.value.amount = yearlyAmount
  }
})

// Methods
const closeModal = () => {
  if (isCreating.value) return
  emit('close')
}

const createPayment = async () => {
  if (!props.user?.id || !isFormValid.value) return

  isCreating.value = true
  let paymentCreated = false

  try {
    // Create the payment
    console.log('Creating payment for user:', props.user.id, 'with data:', paymentData.value)
    const createResponse = await paymentService.createPayment({
      userId: props.user.id,
      amount: paymentData.value.amount,
      paymentType: paymentData.value.paymentType,
      paymentMethod: paymentData.value.paymentMethod,
      transactionId: paymentData.value.transactionId || undefined
    })
    console.log('Payment created:', createResponse)
    paymentCreated = true

    // Try to complete the payment immediately
    try {
      console.log('Completing payment:', createResponse.payment.id)
      const completeResponse = await paymentService.updatePayment(createResponse.payment.id, { 
        status: 'COMPLETED',
        transactionId: paymentData.value.transactionId || undefined
      })
      console.log('Payment completed:', completeResponse)
      toast.success(`Payment of $${paymentData.value.amount} recorded and completed for ${props.user.displayName}`)
    } catch (completionError) {
      console.error('Failed to complete payment:', completionError)
      toast.warning(`Payment of $${paymentData.value.amount} recorded but may need manual completion`)
    }

  } catch (error) {
    console.error('Failed to create payment:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    })
    toast.error(`Failed to create payment: ${error.response?.data?.error || error.message}`)
  } finally {
    isCreating.value = false
    
    // Always close modal and refresh if payment was created
    if (paymentCreated) {
      emit('payment-created')
      // Use setTimeout to ensure isCreating is false before closing
      setTimeout(() => {
        emit('close')
      }, 0)
    }
  }
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    paymentData.value = {
      paymentType: 'SEMESTER',
      amount: semesterAmount,
      paymentMethod: '',
      transactionId: ''
    }
  }
})
</script>
