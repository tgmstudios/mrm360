// Payment types
export interface Payment {
  id: string
  userId: string
  amount: number
  paymentType: 'SEMESTER' | 'YEARLY'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentMethod?: string
  transactionId?: string
  paidAt?: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

export interface PaymentStats {
  totalPayments: number
  activePayments: number
  expiredPayments: number
  totalRevenue: number
  paymentsByType: {
    SEMESTER: number
    YEARLY: number
  }
}

export interface UserPaymentStatus {
  isPaid: boolean
  activePayments: Payment[]
  expiredPayments: Payment[]
  nextExpiration?: string
}

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
  qrCode?: string
  role?: string
  createdAt: string
  updatedAt: string
  authentikGroups: string[]
  teams: Team[]
  userTeams?: UserTeam[] // Backend returns this structure
  events: Event[]
  discordAccount?: DiscordAccount
  interests?: UserInterest[]
  payments?: Payment[]
}

export interface UserCreate {
  email: string
  firstName: string
  lastName: string
  displayName: string
  role?: 'ADMIN' | 'EXEC_BOARD' | 'MEMBER'
  paidStatus?: boolean
  authentikGroups: string[]
}

export interface UserUpdate {
  firstName?: string
  lastName?: string
  displayName?: string
  isPaid?: boolean // Maps to paidStatus in backend
  authentikGroups?: string[]
}

// Team types
export interface Team {
  id: string
  name: string
  description?: string
  type: 'COMPETITION' | 'DEVELOPMENT'
  subtype?: 'BLUE' | 'RED' | 'CTF'
  parentTeamId?: string
  parentTeam?: Team
  subteams: Team[]
  groupId?: string
  group?: Group
  userTeams: UserTeam[]
  events: Event[]
  createdAt: string
  updatedAt: string
}

export enum TeamType {
  COMPETITION = 'COMPETITION',
  DEVELOPMENT = 'DEVELOPMENT'
}

export enum TeamSubtype {
  BLUE = 'BLUE',
  RED = 'RED',
  CTF = 'CTF'
}

export interface UserTeam {
  id: string
  userId: string
  teamId: string
  role: 'LEADER' | 'MEMBER'
  joinedAt: string
  user: User
}

export interface TeamCreate {
  name: string
  description?: string
  type: 'COMPETITION' | 'DEVELOPMENT'
  subtype?: 'BLUE' | 'RED' | 'CTF'
  parentTeamId?: string
  groupId?: string
  members: { userId: string; role: 'MEMBER' | 'LEADER' }[]
  provisioningOptions?: TeamProvisioningOptions
}

export interface TeamUpdate {
  name?: string
  description?: string
  type?: 'COMPETITION' | 'DEVELOPMENT'
  subtype?: 'BLUE' | 'RED' | 'CTF'
  parentTeamId?: string
  groupId?: string
  members?: { userId: string; role: 'MEMBER' | 'LEADER' }[]
  provisioningOptions?: TeamProvisioningOptions
}

// Team Provisioning types
export interface TeamProvisioningOptions {
  // Always enabled services (not configurable)
  authentik: boolean // Always true
  nextcloudGroup: boolean // Always true
  
  // Optional services
  wikijs: boolean
  nextcloudFolder: boolean
  nextcloudCalendar: boolean
  nextcloudDeck: boolean
  github: boolean
  discord: boolean
}

export interface TeamProvisioningStatus {
  success: boolean
  teamId: string
  action: 'create' | 'update' | 'delete'
  options?: TeamProvisioningOptions
  results: {
    authentik?: IntegrationResult
    wikijs?: IntegrationResult
    nextcloud?: IntegrationResult
    github?: IntegrationResult
    discord?: IntegrationResult
  }
  errors: string[]
  warnings: string[]
}

export interface IntegrationResult {
  success: boolean
  message: string
  data?: any
  error?: string
  duration: number
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
  parentTaskId?: string
  stepIndex?: number
  startedAt?: string
  finishedAt?: string
  createdAt: string
  updatedAt: string
  subtasks: Task[]
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
  isActive?: boolean
  authentikId?: string
  authentikPk?: string
  createdAt?: string
  authentikGroups: string[]
  abilities: Ability[]
  discordAccount?: DiscordAccount
  interests?: UserInterest[]
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

// Onboarding types
export interface DiscordAccount {
  id: string
  userId: string
  discordId: string
  username: string
  discriminator?: string
  avatar?: string
  linkedAt: string
}

export interface UserInterest {
  id: string
  userId: string
  interest: InterestType
  createdAt: string
}

export enum InterestType {
  OFFENSE = 'OFFENSE',
  DEFENSE = 'DEFENSE',
  CTF = 'CTF',
  GAMING = 'GAMING'
}

export enum ClassRank {
  FIRST_YEAR = 'FIRST_YEAR',
  SECOND_YEAR = 'SECOND_YEAR',
  THIRD_YEAR = 'THIRD_YEAR',
  FOURTH_YEAR = 'FOURTH_YEAR',
  ALUMNI_OTHER = 'ALUMNI_OTHER'
}

export interface OnboardingData {
  classRank: ClassRank
  interests: InterestType[]
  subscribeNewsletter: boolean
}
