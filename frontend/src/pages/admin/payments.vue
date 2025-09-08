<template>
  <div class="payments-admin">
    <div class="page-header">
      <h1>Payment Management</h1>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
          <i class="icon-refresh" :class="{ 'spinning': loading }"></i>
          Refresh
        </button>
        <button @click="checkExpiredPayments" class="btn btn-primary">
          Check Expired Payments
        </button>
      </div>
    </div>

    <!-- Payment Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats?.totalPayments || 0 }}</div>
        <div class="stat-label">Total Payments</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats?.activePayments || 0 }}</div>
        <div class="stat-label">Active Payments</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats?.expiredPayments || 0 }}</div>
        <div class="stat-label">Expired Payments</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${{ stats?.totalRevenue || 0 }}</div>
        <div class="stat-label">Total Revenue</div>
      </div>
    </div>

    <!-- Payment Type Breakdown -->
    <div class="payment-breakdown">
      <h3>Payment Type Breakdown</h3>
      <div class="breakdown-grid">
        <div class="breakdown-item">
          <span class="type-label">Semester</span>
          <span class="type-count">{{ stats?.paymentsByType?.SEMESTER || 0 }}</span>
        </div>
        <div class="breakdown-item">
          <span class="type-label">Yearly</span>
          <span class="type-count">{{ stats?.paymentsByType?.YEARLY || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="payments-table">
      <h3>Recent Payments</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Paid At</th>
              <th>Expires At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td>
                <div class="user-info">
                  <div class="user-name">{{ payment.user?.firstName }} {{ payment.user?.lastName }}</div>
                  <div class="user-email">{{ payment.user?.email }}</div>
                </div>
              </td>
              <td class="amount">${{ payment.amount }}</td>
              <td>
                <span class="payment-type-badge" :class="payment.paymentType.toLowerCase()">
                  {{ payment.paymentType }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="payment.status.toLowerCase()">
                  {{ payment.status }}
                </span>
              </td>
              <td>{{ formatDate(payment.paidAt) }}</td>
              <td>{{ formatDate(payment.expiresAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    v-if="payment.status === 'PENDING' && can('update', 'Payment')"
                    @click="completePayment(payment.id)"
                    class="btn btn-sm btn-success"
                  >
                    Complete
                  </button>
                  <button 
                    v-if="payment.status === 'PENDING' && can('update', 'Payment')"
                    @click="failPayment(payment.id)"
                    class="btn btn-sm btn-danger"
                  >
                    Fail
                  </button>
                  <button 
                    v-if="payment.status !== 'COMPLETED' && can('delete', 'Payment')"
                    @click="deletePayment(payment.id)"
                    class="btn btn-sm btn-outline-danger"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PaymentService } from '@/services/paymentService'
import { usePermissions } from '@/composables/usePermissions'
import type { Payment, PaymentStats } from '@/types/api'

const paymentService = new PaymentService()
const { can } = usePermissions()

const loading = ref(false)
const payments = ref<Payment[]>([])
const stats = ref<PaymentStats | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const [paymentsResponse, statsResponse] = await Promise.all([
      paymentService.getPayments(),
      paymentService.getPaymentStats()
    ])
    
    payments.value = paymentsResponse.payments
    stats.value = statsResponse.stats
  } catch (error) {
    console.error('Failed to load payment data:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const checkExpiredPayments = async () => {
  try {
    const result = await paymentService.checkExpiredPayments(false)
    console.log('Expired payments check:', result)
    
    // Refresh data after checking
    await loadData()
  } catch (error) {
    console.error('Failed to check expired payments:', error)
  }
}

const completePayment = async (paymentId: string) => {
  try {
    await paymentService.updatePayment(paymentId, { status: 'COMPLETED' })
    await loadData()
  } catch (error) {
    console.error('Failed to complete payment:', error)
  }
}

const failPayment = async (paymentId: string) => {
  try {
    await paymentService.updatePayment(paymentId, { status: 'FAILED' })
    await loadData()
  } catch (error) {
    console.error('Failed to fail payment:', error)
  }
}

const deletePayment = async (paymentId: string) => {
  if (!confirm('Are you sure you want to delete this payment?')) {
    return
  }
  
  try {
    await paymentService.deletePayment(paymentId)
    await loadData()
  } catch (error) {
    console.error('Failed to delete payment:', error)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.payments-admin {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.payment-breakdown {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.payment-breakdown h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.type-label {
  font-weight: 500;
  color: #374151;
}

.type-count {
  font-weight: 600;
  color: #059669;
}

.payments-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.payments-table h3 {
  margin: 0;
  padding: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #111827;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.amount {
  font-weight: 600;
  color: #059669;
}

.payment-type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.payment-type-badge.semester {
  background: #dbeafe;
  color: #1e40af;
}

.payment-type-badge.yearly {
  background: #dcfce7;
  color: #166534;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.completed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.failed {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.refunded {
  background: #f3f4f6;
  color: #374151;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-outline-danger {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}
</style>
