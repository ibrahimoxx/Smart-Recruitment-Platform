export type UserRole = 'ADMIN' | 'RECRUITER' | 'CANDIDATE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  cvUrl?: string;
  cvFileName?: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  companyId?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  size?: string;
  location?: string;
  createdAt: string;
}
