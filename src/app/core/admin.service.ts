import { Injectable, signal } from '@angular/core';
import { ADMIN_REFRESH_TOKEN_KEY, ADMIN_TOKEN_KEY, API_BASE } from './api.config';
import { AdminStats, AdminSubmission, AdminUserRecord, ProviderApplication, ProviderApplicationStatus } from './within.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly authed = signal(!!localStorage.getItem(ADMIN_TOKEN_KEY));

  async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (response.status === 403) throw new Error('That account is not an admin.');
    if (!response.ok) throw new Error('Login failed. Check the credentials and that the API is running.');

    const body = await response.json() as { accessToken: string; refreshToken: string; user: { displayName: string } };
    localStorage.setItem(ADMIN_TOKEN_KEY, body.accessToken);
    localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, body.refreshToken);
    this.authed.set(true);
    return body.user.displayName;
  }

  logout(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    this.authed.set(false);
  }

  getSubmissions(): Promise<AdminSubmission[] | null> {
    return this.adminFetch<AdminSubmission[]>('/admin/submissions');
  }

  getStats(): Promise<AdminStats | null> {
    return this.adminFetch<AdminStats>('/admin/stats');
  }

  getUsers(): Promise<AdminUserRecord[] | null> {
    return this.adminFetch<AdminUserRecord[]>('/admin/users');
  }

  getProviderApplications(): Promise<ProviderApplication[] | null> {
    return this.adminFetch<ProviderApplication[]>('/admin/provider-applications');
  }

  deleteSubmission(id: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/submissions/${id}`, 'DELETE');
  }

  deleteProvider(id: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/providers/${id}`, 'DELETE');
  }

  updateProviderApplicationStatus(id: string, status: ProviderApplicationStatus, reason: string): Promise<ProviderApplication | null> {
    return this.adminPostProviderStatus(id, status, reason);
  }

  updateProviderApplicationNotes(id: string, adminNotes: string): Promise<ProviderApplication | null> {
    return this.adminFetch<ProviderApplication>(`/admin/provider-applications/${id}/notes`, 'POST', { adminNotes });
  }

  private async adminFetch<T>(path: string, method: 'GET' | 'DELETE' | 'POST' = 'GET', body?: Record<string, unknown>): Promise<T | null> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      this.authed.set(false);
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (response.status === 401 || response.status === 403) {
        this.logout();
        return null;
      }

      if (!response.ok) return null;
      if (response.status === 204 || method === 'DELETE') return undefined as T;
      return await response.json() as T;
    } catch {
      return null;
    }
  }

  private async adminPostProviderStatus(id: string, status: ProviderApplicationStatus, reason: string): Promise<ProviderApplication | null> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      this.authed.set(false);
      return null;
    }

    const response = await fetch(`${API_BASE}/admin/provider-applications/${id}/status`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, reason }),
    });

    if (response.status === 401 || response.status === 403) {
      this.logout();
      return null;
    }

    if (!response.ok) {
      let message = 'Could not update provider application.';
      try {
        const body = await response.json() as { message?: string };
        message = body.message ?? message;
      } catch {
        message = await response.text() || message;
      }
      throw new Error(message);
    }

    return await response.json() as ProviderApplication;
  }
}
