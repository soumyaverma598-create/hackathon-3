export type UserRole = 'admin' | 'applicant' | 'scrutiny' | 'mom';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  isActive: boolean;
}

export interface AdminCreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  isActive: boolean;
  password: string;
}

export interface AdminUpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  designation?: string;
  isActive?: boolean;
  password?: string;
}
