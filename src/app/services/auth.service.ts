import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import type { LoginRequest, TokenResponse } from '../models/auth.models';

export interface JwtPayload {
  sub: string;
  uid: string;
  roles: string[];
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  private setSession(token: TokenResponse): void {
    localStorage.setItem('accessToken', token.accessToken);
    localStorage.setItem('tokenType', token.tokenType);
    localStorage.setItem('expiresInSeconds', String(token.expiresInSeconds));
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private decodePayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const decoded = atob(parts[1]);
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  getUserId(): string | null {
    return this.decodePayload()?.uid ?? null;
  }

  getUserEmail(): string | null {
    return this.decodePayload()?.sub ?? null;
  }

  getUserName(): string {
    return this.getUserEmail()?.split('@')[0] || 'Usuario';
  }

  getUserRoles(): string[] {
    return this.decodePayload()?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresInSeconds');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
