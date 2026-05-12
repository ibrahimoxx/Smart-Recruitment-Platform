import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Company } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api = `${environment.apiUrl}/api/companies`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<ApiResponse<PagedResponse<Company>>>(this.api);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Company>>(`${this.api}/${id}`);
  }

  create(data: Partial<Company>) {
    return this.http.post<ApiResponse<Company>>(this.api, data);
  }

  update(id: string, data: Partial<Company>) {
    return this.http.put<ApiResponse<Company>>(`${this.api}/${id}`, data);
  }
}
