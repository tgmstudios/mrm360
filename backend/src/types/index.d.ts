import { Role, TeamType, TeamSubtype, TeamRole, EventCategory, AttendanceType, RSVPStatus } from '@prisma/client';

// User types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  paidStatus: boolean;
  qrCode?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  paidStatus?: boolean;
  role?: Role;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  paidStatus?: boolean;
  role?: Role;
}

// Group types
export interface GroupProfile {
  id: string;
  name: string;
  description?: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  externalId?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  externalId?: string;
}

// Team types
export interface TeamProfile {
  id: string;
  name: string;
  description?: string;
  type: TeamType;
  subtype?: TeamSubtype;
  parentTeamId?: string;
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  type: TeamType;
  subtype?: TeamSubtype;
  parentTeamId?: string;
  groupId?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  type?: TeamType;
  subtype?: TeamSubtype;
  parentTeamId?: string;
  groupId?: string;
}

// Event types
export interface EventProfile {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  category: EventCategory;
  linkedTeamId?: string;
  attendanceType: AttendanceType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  category: EventCategory;
  linkedTeamId?: string;
  attendanceType?: AttendanceType;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  category?: EventCategory;
  linkedTeamId?: string;
  attendanceType?: AttendanceType;
}

// RSVP types
export interface RSVPProfile {
  id: string;
  userId: string;
  eventId: string;
  status: RSVPStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRSVPRequest {
  eventId: string;
  status: RSVPStatus;
}

export interface UpdateRSVPRequest {
  status: RSVPStatus;
}

// Check-in types
export interface CheckInProfile {
  id: string;
  userId: string;
  eventId: string;
  qrCode: string;
  checkedInAt: Date;
}

export interface CheckInRequest {
  eventId: string;
  qrCode: string;
}

// Authentication types
export interface AuthenticatedUser {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: Role;
  groups: string[];
}

export interface AuthSession {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query types
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  paidStatus?: boolean;
  groupId?: string;
}

export interface TeamQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: TeamType;
  groupId?: string;
}

export interface EventQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: EventCategory;
  startDate?: string;
  endDate?: string;
  teamId?: string;
}

// Task types
export interface TaskJob {
  id: string;
  type: string;
  data: any;
  priority?: number;
  delay?: number;
}

export interface EmailTask {
  to: string;
  subject: string;
  body: string;
  template?: string;
}

export interface QRCodeTask {
  userId: string;
  size?: number;
}

export interface SyncGroupsTask {
  force?: boolean;
}

// Permission types
export interface Ability {
  action: string;
  subject: string;
  conditions?: any;
}

export interface PermissionCheck {
  action: string;
  subject: string;
  subjectId?: string;
}
