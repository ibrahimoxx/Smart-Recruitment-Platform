import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AdminDashboard, RecruiterDashboard } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = `${environment.apiUrl}/api/dashboard`;

  constructor(private http: HttpClient) {}

  getAdminDashboard() {
    return this.http.get<ApiResponse<AdminDashboard>>(`${this.api}/admin`);
  }

  getRecruiterDashboard() {
    return this.http.get<ApiResponse<RecruiterDashboard>>(`${this.api}/recruiter`);
  }
}
