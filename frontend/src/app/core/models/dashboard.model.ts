import { JobOfferStatus } from './job-offer.model';
import { ApplicationStatus } from './application.model';

export interface AdminDashboard {
  totalUsers: number;
  candidateCount: number;
  recruiterCount: number;
  totalJobOffers: number;
  jobsByStatus: Record<JobOfferStatus, number>;
  totalApplications: number;
  applicationsByStatus: Record<ApplicationStatus, number>;
  newApplicationsLast7Days: number;
  avgMatchScore: number;
}

export interface TopJob {
  jobTitle: string;
  applicationCount: number;
}

export interface RecruiterDashboard {
  myJobsTotal: number;
  myJobsByStatus: Record<JobOfferStatus, number>;
  myApplicationsTotal: number;
  myApplicationsByStatus: Record<ApplicationStatus, number>;
  avgMatchScore: number;
  topJobsByApplicationCount: TopJob[];
}
