import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { JobOffer, JobOfferRequest, JobOfferFilter, JobOfferStatus } from '../models/job-offer.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly api = `${environment.apiUrl}/api/jobs`;

  constructor(private http: HttpClient) {}

  list(filter: JobOfferFilter = {}) {
    let params = new HttpParams()
      .set('page', filter.page ?? 0)
      .set('size', filter.size ?? 20);

    if (filter.search) params = params.set('search', filter.search);
    if (filter.contractType) params = params.set('contractType', filter.contractType);
    if (filter.experienceLevel) params = params.set('experienceLevel', filter.experienceLevel);
    if (filter.remote !== undefined) params = params.set('remote', filter.remote);
    if (filter.location) params = params.set('location', filter.location);
    if (filter.salaryMin !== undefined) params = params.set('salaryMin', filter.salaryMin);
    if (filter.salaryMax !== undefined) params = params.set('salaryMax', filter.salaryMax);
    if (filter.sort) params = params.set('sort', filter.sort);

    return this.http.get<ApiResponse<PagedResponse<JobOffer>>>(this.api, { params });
  }

  getById(id: string) {
    return this.http.get<ApiResponse<JobOffer>>(`${this.api}/${id}`);
  }

  create(request: JobOfferRequest) {
    return this.http.post<ApiResponse<JobOffer>>(this.api, request);
  }

  update(id: string, request: JobOfferRequest) {
    return this.http.put<ApiResponse<JobOffer>>(`${this.api}/${id}`, request);
  }

  delete(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }

  changeStatus(id: string, status: JobOfferStatus) {
    return this.http.patch<ApiResponse<JobOffer>>(`${this.api}/${id}/status`, { status });
  }

  getSimilar(id: string) {
    return this.http.get<ApiResponse<JobOffer[]>>(`${this.api}/similar/${id}`);
  }
}
