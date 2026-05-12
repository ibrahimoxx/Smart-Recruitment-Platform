import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Application, ApplicationRequest, ApplicationStatusRequest } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = `${environment.apiUrl}/api/applications`;
  private readonly jobsApi = `${environment.apiUrl}/api/jobs`;

  constructor(private http: HttpClient) {}

  apply(request: ApplicationRequest) {
    return this.http.post<ApiResponse<Application>>(this.api, request);
  }

  myApplications(page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PagedResponse<Application>>>(this.api, { params });
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Application>>(`${this.api}/${id}`);
  }

  getByJob(jobId: string, page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PagedResponse<Application>>>(
      `${this.jobsApi}/${jobId}/applications`,
      { params }
    );
  }

  changeStatus(id: string, request: ApplicationStatusRequest) {
    return this.http.patch<ApiResponse<Application>>(`${this.api}/${id}/status`, request);
  }

  withdraw(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }
}
