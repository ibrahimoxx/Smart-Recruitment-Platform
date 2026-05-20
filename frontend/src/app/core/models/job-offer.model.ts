export type JobOfferStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type ContractType = 'CDI' | 'CDD' | 'PART_TIME' | 'INTERNSHIP' | 'FREELANCE';
export type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE';

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  remote: boolean;
  workMode: WorkMode;
  contractType: ContractType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  status: JobOfferStatus;
  closesAt?: string;
  recruiterFirstName: string;
  recruiterLastName: string;
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
  workMode: WorkMode;
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
  workMode?: WorkMode;
  remote?: boolean;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  recruiterId?: string;
  page?: number;
  size?: number;
  sort?: string;
}
