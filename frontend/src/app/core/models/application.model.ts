export type ApplicationStatus = 'PENDING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobOfferId: string;
  jobOfferTitle: string;
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
  newStatus: ApplicationStatus;
}
