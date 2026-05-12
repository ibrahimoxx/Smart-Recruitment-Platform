import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { RecruiterProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RecruiterService {
  private readonly api = `${environment.apiUrl}/api/recruiters`;

  constructor(private http: HttpClient) {}

  getMyProfile() {
    return this.http.get<ApiResponse<RecruiterProfile>>(`${this.api}/profile/me`);
  }

  createProfile(data: Partial<RecruiterProfile>) {
    return this.http.post<ApiResponse<RecruiterProfile>>(`${this.api}/profile`, data);
  }

  updateProfile(data: Partial<RecruiterProfile>) {
    return this.http.put<ApiResponse<RecruiterProfile>>(`${this.api}/profile`, data);
  }
}
