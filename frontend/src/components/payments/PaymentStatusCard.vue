<template>
  <div class="payment-status-card">
    <div class="card-header">
      <h3 class="card-title">Payment Status</h3>
      <div class="status-badge" :class="statusClass">
        {{ isPaid ? 'Paid' : 'Unpaid' }}
      </div>
    </div>
    
    <div v-if="isPaid" class="payment-info">
      <div class="active-payments">
        <h4>Active Payments</h4>
        <div v-for="payment in activePayments" :key="payment.id" class="payment-item">
          <div class="payment-details">
            <span class="payment-type">{{ payment.paymentType }}</span>
            <span class="payment-amount">${{ payment.amount }}</span>
          </div>
          <div class="payment-expiry">
            Expires: {{ formatDate(payment.expiresAt) }}
          </div>
        </div>
      </div>
      
      <div v-if="nextExpiration" class="next-expiry">
        <strong>Next Expiration:</strong> {{ formatDate(nextExpiration) }}
      </div>
    </div>
    
    <div v-else class="no-payment">
      <p>No active payments found.</p>
      <div v-if="expiredPayments.length > 0" class="expired-payments">
        <h4>Recent Payments</h4>
        <div v-for="payment in expiredPayments.slice(0, 3)" :key="payment.id" class="payment-item expired">
          <div class="payment-details">
            <span class="payment-type">{{ payment.paymentType }}</span>
            <span class="payment-amount">${{ payment.amount }}</span>
          </div>
          <div class="payment-expiry">
            Expired: {{ formatDate(payment.expiresAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserPaymentStatus } from '@/types/api'

interface Props {
  paymentStatus: UserPaymentStatus
}

const props = defineProps<Props>()

const isPaid = computed(() => props.paymentStatus.isPaid)
const activePayments = computed(() => props.paymentStatus.activePayments)
const expiredPayments = computed(() => props.paymentStatus.expiredPayments)
const nextExpiration = computed(() => props.paymentStatus.nextExpiration)

const statusClass = computed(() => ({
  'status-paid': isPaid.value,
  'status-unpaid': !isPaid.value
}))

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.payment-status-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-paid {
  background-color: #dcfce7;
  color: #166534;
}

.status-unpaid {
  background-color: #fef2f2;
  color: #dc2626;
}

.payment-info {
  space-y: 1rem;
}

.active-payments h4,
.expired-payments h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.payment-item.expired {
  background-color: #fef2f2;
  opacity: 0.7;
}

.payment-details {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.payment-type {
  font-weight: 500;
  color: #374151;
}

.payment-amount {
  font-weight: 600;
  color: #059669;
}

.payment-expiry {
  font-size: 0.875rem;
  color: #6b7280;
}

.next-expiry {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fef3c7;
  border-radius: 6px;
  color: #92400e;
}

.no-payment {
  text-align: center;
  color: #6b7280;
}

.no-payment p {
  margin: 0 0 1rem 0;
}
</style>
