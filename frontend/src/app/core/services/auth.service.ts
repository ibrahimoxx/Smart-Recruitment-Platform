import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/api/auth`;

  private _currentUser = signal<User | null>(this.loadUserFromToken());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());
  readonly userRole = computed(() => this._currentUser()?.role ?? null);

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router,
  ) {}

  login(request: LoginRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/login`, request).pipe(
      tap(res => {
        this.tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
        this._currentUser.set(this.decodeUser(res.data.accessToken));
      })
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/register`, request).pipe(
      tap(res => {
        this.tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
        this._currentUser.set(this.decodeUser(res.data.accessToken));
      })
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private loadUserFromToken(): User | null {
    const token = localStorage.getItem('aurora_access_token');
    if (!token) return null;
    return this.decodeUser(token);
  }

  private decodeUser(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId ?? payload.sub,
        email: payload.email ?? payload.sub,
        firstName: payload.firstName ?? '',
        lastName: payload.lastName ?? '',
        role: payload.role ?? payload.roles?.[0]?.replace('ROLE_', '') ?? 'CANDIDATE',
        createdAt: '',
      };
    } catch {
      return null;
    }
  }
}
