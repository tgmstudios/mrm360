// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  avatar?: string
  isActive: boolean
  isPaid: boolean
  paidUntil?: string
  createdAt: string
  updatedAt: string
  authentikGroups: string[]
  teams: Team[]
  events: Event[]
}

export interface UserCreate {
  email: string
  firstName: string
  lastName: string
  displayName: string
  authentikGroups: string[]
}

export interface UserUpdate {
  firstName?: string
  lastName?: string
  displayName?: string
  isActive?: boolean
  isPaid?: boolean
  paidUntil?: string
  authentikGroups?: string[]
}

// Team types
export interface Team {
  id: string
  name: string
  description?: string
  type: TeamType
  parentTeamId?: string
  parentTeam?: Team
  subTeams: Team[]
  members: User[]
  events: Event[]
  createdAt: string
  updatedAt: string
}

export enum TeamType {
  EXECUTIVE = 'EXECUTIVE',
  COMMITTEE = 'COMMITTEE',
  WORKING_GROUP = 'WORKING_GROUP',
  PROJECT = 'PROJECT'
}

export interface TeamCreate {
  name: string
  description?: string
  type: TeamType
  parentTeamId?: string
  memberIds: string[]
}

export interface TeamUpdate {
  name?: string
  description?: string
  type?: TeamType
  parentTeamId?: string
  memberIds?: string[]
}

// Event types
export interface Event {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  category: 'MEETING' | 'COMPETITION' | 'WORKSHOP' | 'SOCIAL' | 'TRAINING'
  linkedTeamId?: string
  linkedTeam?: Team
  attendanceType: 'STRICT' | 'SOFT'
  rsvps: Array<{
    id: string
    userId: string
    status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'MAYBE'
    user: User
    createdAt: string
    updatedAt: string
  }>
  checkIns: Array<{
    id: string
    userId: string
    qrCode: string
    user: User
    checkedInAt: string
  }>
  createdAt: string
  updatedAt: string
}

export interface EventCreate {
  title: string
  description?: string
  startTime: string
  endTime: string
  category: 'MEETING' | 'COMPETITION' | 'WORKSHOP' | 'SOCIAL' | 'TRAINING'
  linkedTeamId?: string
  attendanceType: 'STRICT' | 'SOFT'
}

export interface EventUpdate {
  title?: string
  description?: string
  startTime?: string
  endTime?: string
  category?: 'MEETING' | 'COMPETITION' | 'WORKSHOP' | 'SOCIAL' | 'TRAINING'
  linkedTeamId?: string
  attendanceType?: 'STRICT' | 'SOFT'
}

// Group types (from Authentik)
export interface Group {
  id: string
  name: string
  description?: string
  members: User[]
  createdAt: string
  updatedAt: string
}

// Task types
export interface BackgroundSubtask {
  id: string
  taskId: string
  name: string
  status: TaskStatus
  progress: number
  stepIndex: number
  result?: any
  error?: string
  startedAt?: string
  finishedAt?: string
}

export interface Task {
  id: string
  name: string
  description?: string
  status: TaskStatus
  progress: number
  result?: any
  error?: string
  entityType?: string
  entityId?: string
  startedAt?: string
  finishedAt?: string
  createdAt: string
  updatedAt: string
  subtasks: BackgroundSubtask[]
}

export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  avatar?: string
  username?: string
  role?: string
  paidStatus?: boolean
  authentikGroups: string[]
  abilities: Ability[]
}

export interface Ability {
  action: string
  subject: string
  conditions?: Record<string, any>
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard types
export interface DashboardStats {
  totalMembers: number
  totalTeams: number
  upcomingEvents: number
  paidMembers: number
  unpaidMembers: number
  activeEvents: number
}

// Search and filter types
export interface SearchFilters {
  query?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserFilters extends SearchFilters {
  isActive?: boolean
  isPaid?: boolean
  teamId?: string
  groupId?: string
}

export interface EventFilters extends SearchFilters {
  startDate?: string
  endDate?: string
  linkedTeamId?: string
  category?: 'MEETING' | 'COMPETITION' | 'WORKSHOP' | 'SOCIAL' | 'TRAINING'
}

export interface TeamFilters extends SearchFilters {
  type?: TeamType
  parentTeamId?: string
}
