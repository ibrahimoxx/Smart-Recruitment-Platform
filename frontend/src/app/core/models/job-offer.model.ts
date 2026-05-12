export type JobOfferStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type ContractType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
export type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  remote: boolean;
  contractType: ContractType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  status: JobOfferStatus;
  closesAt?: string;
  recruiterName: string;
  companyName?: string;
  companyId?: string;
  applicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobOfferRequest {
  title: string;
  description: string;
  requirements: string;
  location: string;
  remote: boolean;
  contractType: ContractType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  closesAt?: string;
}

export interface JobOfferFilter {
  search?: string;
  contractType?: ContractType;
  experienceLevel?: ExperienceLevel;
  remote?: boolean;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  size?: number;
  sort?: string;
}
