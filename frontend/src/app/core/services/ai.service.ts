import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { MatchScore, EmailDraft, CvParsedData } from '../models/ai.model';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly api = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getMatchScore(applicationId: string) {
    return this.http.get<ApiResponse<MatchScore>>(
      `${this.api}/applications/${applicationId}/score`
    );
  }

  getEmailDraft(applicationId: string) {
    return this.http.get<ApiResponse<EmailDraft>>(
      `${this.api}/applications/${applicationId}/email-draft`
    );
  }

  getCvData(candidateId: string) {
    return this.http.get<ApiResponse<CvParsedData>>(
      `${this.api}/candidates/${candidateId}/cv-data`
    );
  }
}
