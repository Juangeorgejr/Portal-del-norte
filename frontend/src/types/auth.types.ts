export type RoleType = 'ROLE_ADMIN' | 'ROLE_EMPLEADO' | 'ROLE_CLIENTE';

export interface User {
  id: number;
  email: string;
  roles: RoleType[];
  guestProfile?: GuestProfile;
}

export interface GuestProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}
