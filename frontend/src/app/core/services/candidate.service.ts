import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CandidateProfile } from '../models/user.model';

export interface CvUploadResponse {
  objectKey: string;
  originalFilename: string;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private readonly api = `${environment.apiUrl}/api/candidate-profiles`;

  constructor(private http: HttpClient) {}

  getMyProfile() {
    return this.http.get<ApiResponse<CandidateProfile>>(`${this.api}/me`);
  }

  createProfile(data: Partial<CandidateProfile>) {
    return this.http.put<ApiResponse<CandidateProfile>>(`${this.api}/me`, data);
  }

  updateProfile(data: Partial<CandidateProfile>) {
    return this.http.put<ApiResponse<CandidateProfile>>(`${this.api}/me`, data);
  }

  uploadCv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<CvUploadResponse>>(`${this.api}/me/cv`, formData);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<CandidateProfile>>(`${this.api}/${id}`);
  }
}
