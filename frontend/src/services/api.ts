import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  UserCreate,
  UserUpdate,
  Team,
  TeamCreate,
  TeamUpdate,
  Event,
  EventCreate,
  EventUpdate,
  Group,
  Task,
  DashboardStats,
  UserFilters,
  EventFilters,
  TeamFilters,
  TeamProvisioningStatus
} from '@/types/api'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: window.ENV.VITE_API_BASE_URL,
      timeout: 10000,
      withCredentials: true, // Include cookies in requests
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - add JWT token to requests
    this.api.interceptors.request.use(
      (config) => {
        // Get token from localStorage directly to avoid timing issues with Pinia
        const token = localStorage.getItem('accessToken')
        console.log('API request interceptor - token from localStorage:', token ? 'exists' : 'missing')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('Authorization header set for:', config.url)
        } else {
          console.log('No token found for request to:', config.url)
          // If no token and this is not an auth endpoint, this might indicate an auth issue
          if (!config.url?.includes('/auth/')) {
            console.warn('No token found for non-auth request:', config.url)
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        console.log('API response error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message
        });
        
        // Don't automatically logout on 401 - let the calling code handle it
        // This prevents the immediate logout issue you're experiencing
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints - these now use custom JWT endpoints
  async login(username: string, password: string): Promise<ApiResponse<any>> {
    // This is now handled by the auth store directly
    throw new Error('Use authStore.login() instead')
  }

  async logout(): Promise<void> {
    // This is now handled by the auth store directly
    throw new Error('Use authStore.logout() instead')
  }

  // User endpoints
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const response = await this.api.get('/users', { params: filters })
    return response.data
  }

  async getUser(id: string): Promise<User> {
    const response = await this.api.get(`/users/${id}`)
    return response.data.data
  }

  async createUser(userData: UserCreate): Promise<User> {
    const response = await this.api.post('/users', userData)
    return response.data.data
  }

  async updateUser(id: string, userData: UserUpdate): Promise<User> {
    const response = await this.api.put(`/users/${id}`, userData)
    return response.data.data
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`)
  }

  // Team endpoints
  async getTeams(filters?: TeamFilters): Promise<PaginatedResponse<Team>> {
    const response = await this.api.get('/teams', { params: filters })
    return response.data
  }

  async getTeam(id: string): Promise<Team> {
    const response = await this.api.get(`/teams/${id}`)
    return response.data
  }

  async createTeam(teamData: TeamCreate): Promise<Team> {
    const response = await this.api.post('/teams', teamData)
    return response.data
  }

  async updateTeam(id: string, teamData: TeamUpdate): Promise<Team> {
    const response = await this.api.put(`/teams/${id}`, teamData)
    return response.data
  }

  async deleteTeam(id: string): Promise<void> {
    try {
      await this.api.delete(`/teams/${id}`)
    } catch (error: any) {
      const serverMessage = error?.response?.data?.error
      const message = serverMessage || error?.message || 'Failed to delete team'
      throw new Error(message)
    }
  }

  // Team Provisioning Status
  async getTeamProvisioningStatus(teamId: string): Promise<TeamProvisioningStatus | null> {
    try {
      const response = await this.api.get(`/teams/${teamId}/provisioning-status`)
      return response.data
    } catch (error) {
      // If endpoint doesn't exist yet, return null
      return null
    }
  }

  // Event endpoints
  async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    const response = await this.api.get('/events', { params: filters })
    return response.data
  }

  async getEvent(id: string): Promise<Event> {
    const response = await this.api.get(`/events/${id}`)
    return response.data.data
  }

  async getEventByCheckInCode(checkInCode: string): Promise<Event> {
    const response = await this.api.get(`/events/checkin/${checkInCode}`)
    return response.data.data
  }

  async createEvent(eventData: EventCreate): Promise<Event> {
    const response = await this.api.post('/events', eventData)
    return response.data.data
  }

  async updateEvent(id: string, eventData: EventUpdate): Promise<Event> {
    const response = await this.api.put(`/events/${id}`, eventData)
    return response.data.data
  }

  async deleteEvent(id: string): Promise<void> {
    await this.api.delete(`/events/${id}`)
  }

  async rsvpToEvent(eventId: string, attending: boolean): Promise<{ success: boolean; message: string; status: string }> {
    const response = await this.api.post(`/events/${eventId}/rsvp`, { attending })
    return response.data
  }

  async checkInUser(eventId: string, userId: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const response = await this.api.post(`/events/${eventId}/checkin`, { userId })
      return response.data
    } catch (error: any) {
      // If the server returns an error response, extract the message
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || error.response.data.error || 'Check-in failed'
        }
      }
      // For network errors or other issues
      throw error
    }
  }

  async checkInWithQR(eventId: string, qrCode: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const response = await this.api.post(`/events/${eventId}/checkin`, { qrCode })
      return response.data
    } catch (error: any) {
      // If the server returns an error response, extract the message
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || error.response.data.error || 'Check-in failed'
        }
      }
      // For network errors or other issues
      throw error
    }
  }

  // Group endpoints
  async getGroups(): Promise<PaginatedResponse<Group>> {
    const response = await this.api.get('/groups')
    return response.data
  }

  async getGroup(id: string): Promise<Group> {
    const response = await this.api.get(`/groups/${id}`)
    return response.data.data
  }

  // Task endpoints
  async getTasks(params?: { page?: number; limit?: number; entityType?: string; entityId?: string }): Promise<PaginatedResponse<Task>> {
    const response = await this.api.get('/tasks', { params })
    return response.data
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.api.get(`/tasks/${id}`)
    return response.data.data
  }

  async enqueueTask(taskName: 'email' | 'qr-code' | 'sync-groups' | 'provision-team' | 'provision-event', data: any): Promise<{ success: boolean; jobId: string; backgroundTaskId?: string; message?: string }> {
    const response = await this.api.post('/tasks/enqueue', { type: taskName, data })
    return response.data
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get('/dashboard/stats')
    return response.data.data
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.api.get('/health')
    return response.data
  }

  // Wiretap endpoints
  async getWiretapWorkshops(): Promise<{ success: boolean; data: any[] }> {
    const response = await this.api.get('/wiretap/workshops')
    return response.data
  }

  // Event Teams endpoints
  async getEventTeams(eventId: string): Promise<{ success: boolean; data: any[] }> {
    const response = await this.api.get(`/events/${eventId}/teams`)
    return response.data
  }

  async createEventTeams(eventId: string, membersPerTeam: number = 4, wiretapWorkshopId?: string, assignmentType: string = 'manual'): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await this.api.post(`/events/${eventId}/teams`, {
      wiretapWorkshopId,
      membersPerTeam,
      assignmentType
    })
    return response.data
  }

  async enableEventTeams(eventId: string): Promise<{ success: boolean; message: string; data: any }> {
    const response = await this.api.post(`/events/${eventId}/teams/enable`)
    return response.data
  }

  async addTeamMember(eventId: string, teamId: string, email: string): Promise<{ success: boolean; data: any; message: string }> {
    const response = await this.api.post(`/events/${eventId}/teams/${teamId}/members`, {
      email
    })
    return response.data
  }

  async removeTeamMember(eventId: string, teamId: string, email: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.delete(`/events/${eventId}/teams/${teamId}/members`, {
      data: { email }
    })
    return response.data
  }

  async deleteEventTeam(eventId: string, teamId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.delete(`/events/${eventId}/teams/${teamId}`)
    return response.data
  }

  async syncEventTeams(eventId: string, syncType: string, membersPerTeam: number = 4): Promise<{ success: boolean; message: string; taskId: string }> {
    const response = await this.api.post(`/events/${eventId}/teams/sync`, {
      syncType,
      membersPerTeam
    })
    return response.data
  }

  // User search
  async searchUsers(query: string, limit: number = 10): Promise<{ success: boolean; data: any[] }> {
    const response = await this.api.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService
