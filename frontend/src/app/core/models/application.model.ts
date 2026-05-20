export type ApplicationStatus = 'PENDING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: string;
  candidateId: string;
  candidateFirstName: string;
  candidateLastName: string;
  jobOfferId: string;
  jobTitle: string;
  companyName?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  appliedAt: string;
  reviewedAt?: string;
  matchScore?: number;
}

export interface ApplicationRequest {
  jobOfferId: string;
  coverLetter?: string;
}

export interface ApplicationStatusRequest {
  status: ApplicationStatus;
}
