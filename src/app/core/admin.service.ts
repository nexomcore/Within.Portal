import { Injectable, signal } from '@angular/core';
import { ADMIN_REFRESH_TOKEN_KEY, ADMIN_TOKEN_KEY, API_BASE } from './api.config';
import {
  AdminCircle, AdminCircleGuideline, AdminHabitTemplate, AdminStats, AdminSubmission, AdminUserRecord,
  CommunityReport, CommunityReportStatus, CommunityTopic,
  CreateCirclePayload, CreateHabitTemplatePayload, CreateTopicPayload,
  GuidelinePayload, GuidelineUpdatePayload,
  ProviderApplication, ProviderApplicationStatus,
  UpdateCirclePayload, UpdateHabitTemplatePayload, UpdateTopicPayload,
} from './within.models';

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

  getCommunityReports(): Promise<CommunityReport[] | null> {
    return this.adminFetch<CommunityReport[]>('/admin/circles/reports');
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

  reviewCommunityReport(id: string, status: CommunityReportStatus): Promise<CommunityReport | null> {
    return this.adminFetch<CommunityReport>(`/admin/circles/reports/${id}/review`, 'POST', { status });
  }

  removeCommunityPost(id: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/circles/threads/${id}/remove`, 'POST');
  }

  removeCommunityComment(id: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/circles/comments/${id}/remove`, 'POST');
  }

  removeCircleEventShare(id: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/circles/events/${id}/remove`, 'POST');
  }

  // ---- Master data: community topics ----
  listTopics(): Promise<CommunityTopic[] | null> {
    return this.adminFetch<CommunityTopic[]>('/admin/community/topics');
  }

  createTopic(payload: CreateTopicPayload): Promise<CommunityTopic | null> {
    return this.adminFetch<CommunityTopic>('/admin/community/topics', 'POST', payload);
  }

  updateTopic(id: string, payload: UpdateTopicPayload): Promise<CommunityTopic | null> {
    return this.adminFetch<CommunityTopic>(`/admin/community/topics/${id}`, 'PUT', payload);
  }

  deactivateTopic(id: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/community/topics/${id}`, 'DELETE');
  }

  // ---- Master data: habit templates ----
  listHabitTemplates(): Promise<AdminHabitTemplate[] | null> {
    return this.adminFetch<AdminHabitTemplate[]>('/admin/habits/templates');
  }

  createHabitTemplate(payload: CreateHabitTemplatePayload): Promise<AdminHabitTemplate | null> {
    return this.adminFetch<AdminHabitTemplate>('/admin/habits/templates', 'POST', payload);
  }

  updateHabitTemplate(id: string, payload: UpdateHabitTemplatePayload): Promise<AdminHabitTemplate | null> {
    return this.adminFetch<AdminHabitTemplate>(`/admin/habits/templates/${id}`, 'PUT', payload);
  }

  deactivateHabitTemplate(id: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/habits/templates/${id}`, 'DELETE');
  }

  // ---- Master data: platform circles + guidelines ----
  listCircles(): Promise<AdminCircle[] | null> {
    return this.adminFetch<AdminCircle[]>('/admin/circles');
  }

  createCircle(payload: CreateCirclePayload): Promise<AdminCircle | null> {
    return this.adminFetch<AdminCircle>('/admin/circles', 'POST', payload);
  }

  updateCircle(id: string, payload: UpdateCirclePayload): Promise<AdminCircle | null> {
    return this.adminFetch<AdminCircle>(`/admin/circles/${id}`, 'PUT', payload);
  }

  archiveCircle(id: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/circles/${id}`, 'DELETE');
  }

  listGuidelines(circleId: string): Promise<AdminCircleGuideline[] | null> {
    return this.adminFetch<AdminCircleGuideline[]>(`/admin/circles/${circleId}/guidelines`);
  }

  createGuideline(circleId: string, payload: GuidelinePayload): Promise<AdminCircleGuideline | null> {
    return this.adminFetch<AdminCircleGuideline>(`/admin/circles/${circleId}/guidelines`, 'POST', payload);
  }

  updateGuideline(circleId: string, guidelineId: string, payload: GuidelineUpdatePayload): Promise<AdminCircleGuideline | null> {
    return this.adminFetch<AdminCircleGuideline>(`/admin/circles/${circleId}/guidelines/${guidelineId}`, 'PUT', payload);
  }

  deleteGuideline(circleId: string, guidelineId: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/circles/${circleId}/guidelines/${guidelineId}`, 'DELETE');
  }

  private async adminFetch<T>(path: string, method: 'GET' | 'DELETE' | 'POST' | 'PUT' = 'GET', body?: unknown): Promise<T | null> {
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
