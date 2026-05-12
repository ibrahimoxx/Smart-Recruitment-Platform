export interface MatchScore {
  applicationId: string;
  score: number;
  reasoning: string;
  matchedSkills: string[];
  missingSkills: string[];
  computedAt: string;
}

export interface EmailDraft {
  applicationId: string;
  subject: string;
  body: string;
  tone: string;
  draftType: 'INTERVIEW_INVITE' | 'REJECTION' | 'ACCEPTANCE';
  generatedBy: string;
  createdAt: string;
}

export interface CvParsedData {
  candidateProfileId: string;
  summary?: string;
  skills: string[];
  experiences: CvExperience[];
  education: CvEducation[];
  parsedAt: string;
}

export interface CvExperience {
  title: string;
  company: string;
  duration?: string;
  description?: string;
}

export interface CvEducation {
  degree: string;
  institution: string;
  year?: string;
  field?: string;
}
