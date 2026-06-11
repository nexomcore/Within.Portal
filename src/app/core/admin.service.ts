import { Injectable, signal } from '@angular/core';
import { ADMIN_REFRESH_TOKEN_KEY, ADMIN_TOKEN_KEY, API_BASE } from './api.config';
import {
  AdminCircle, AdminCircleGuideline, AdminCircleJoinRequest, AdminHabitTemplate, AdminStats, AdminSubmission, AdminUserRecord,
  CircleAdminMember, CircleInsights, CirclePostType, CommunityPostType, CommunityReport, CommunityReportStatus,
  CreateCirclePayload, CreateHabitTemplatePayload, EventItem,
  GuidelinePayload, GuidelineUpdatePayload,
  ProviderApplication, ProviderApplicationStatus,
  UpdateCirclePayload, UpdateHabitTemplatePayload, WithinRole,
} from './within.models';

const ADMIN_ROLE_KEY = 'within.admin.role';

@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly authed = signal(!!localStorage.getItem(ADMIN_TOKEN_KEY));
  readonly role = signal<WithinRole | null>((localStorage.getItem(ADMIN_ROLE_KEY) as WithinRole | null) ?? null);

  async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (response.status === 403) throw new Error('Admin or Circle Admin access required for this portal.');
    if (!response.ok) throw new Error('Login failed. Check the credentials and that the API is running.');

    const body = await response.json() as { accessToken: string; refreshToken: string; user: { displayName: string; role: WithinRole } };
    localStorage.setItem(ADMIN_TOKEN_KEY, body.accessToken);
    localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, body.refreshToken);
    localStorage.setItem(ADMIN_ROLE_KEY, body.user.role);
    this.authed.set(true);
    this.role.set(body.user.role);
    return body.user.displayName;
  }

  logout(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_ROLE_KEY);
    this.authed.set(false);
    this.role.set(null);
  }

  // ---- Circle Admin portal: circles owned by the signed-in circle admin ----
  getMyCircles(): Promise<AdminCircle[] | null> {
    return this.adminFetch<AdminCircle[]>('/circle-admin/circles');
  }

  createMyCircle(payload: CreateCirclePayload): Promise<AdminCircle | null> {
    return this.adminFetch<AdminCircle>('/circle-admin/circles', 'POST', payload);
  }

  updateMyCircle(id: string, payload: UpdateCirclePayload): Promise<AdminCircle | null> {
    return this.adminFetch<AdminCircle>(`/circle-admin/circles/${id}`, 'PUT', payload);
  }

  getCircleInsights(circleId: string): Promise<CircleInsights | null> {
    return this.adminFetch<CircleInsights>(`/circle-admin/circles/${circleId}/insights`);
  }

  getCircleMembers(circleId: string): Promise<CircleAdminMember[] | null> {
    return this.adminFetch<CircleAdminMember[]>(`/circles/${circleId}/members`);
  }

  getCircleJoinRequests(circleId: string): Promise<AdminCircleJoinRequest[] | null> {
    return this.adminFetch<AdminCircleJoinRequest[]>(`/circles/${circleId}/join-requests`);
  }

  approveOwnedCircleJoinRequest(circleId: string, requestId: string): Promise<void | null> {
    return this.adminFetch<void>(`/circles/${circleId}/join-requests/${requestId}/approve`, 'POST');
  }

  rejectOwnedCircleJoinRequest(circleId: string, requestId: string): Promise<void | null> {
    return this.adminFetch<void>(`/circles/${circleId}/join-requests/${requestId}/reject`, 'POST');
  }

  postCircleAnnouncement(circleId: string, body: string, isPinned: boolean): Promise<unknown> {
    return this.adminFetch(`/circles/${circleId}/announcements`, 'POST', { body, isPinned });
  }

  postCircleThread(circleId: string, payload: {
    threadType: CommunityPostType;
    title: string;
    body: string;
    postType?: CirclePostType;
    poll?: { question: string; options: string[] };
  }): Promise<unknown> {
    return this.adminFetch(`/circles/${circleId}/threads`, 'POST', payload);
  }

  getPublishedEvents(): Promise<EventItem[] | null> {
    return this.adminFetch<EventItem[]>('/events');
  }

  shareCircleEvent(circleId: string, eventId: string, optionalNote: string | null): Promise<unknown> {
    return this.adminFetch(`/circles/${circleId}/events`, 'POST', { eventId, optionalNote });
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

  updateUserRole(id: string, role: WithinRole): Promise<AdminUserRecord | null> {
    return this.adminFetch<AdminUserRecord>(`/admin/users/${id}/role`, 'PUT', { role });
  }

  setCircleAdmin(circleId: string, userId: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/circles/${circleId}/admin`, 'PUT', { userId });
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

  deleteUser(id: string): Promise<void> {
    return this.sendUserDelete(`/admin/users/${id}`, 'Could not delete this user.');
  }

  hardDeleteUser(id: string): Promise<void> {
    return this.sendUserDelete(`/admin/users/${id}/purge`, 'Could not purge this account.');
  }

  private async sendUserDelete(path: string, fallbackMessage: string): Promise<void> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      this.authed.set(false);
      throw new Error('Your admin session has expired. Sign in again.');
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      this.logout();
      throw new Error('Your admin session has expired. Sign in again.');
    }

    if (response.status === 204) return;

    let message = fallbackMessage;
    try {
      const body = await response.json() as { message?: string };
      message = body.message ?? message;
    } catch {
      message = (await response.text()) || message;
    }
    throw new Error(message);
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

  listCircleJoinRequests(): Promise<AdminCircleJoinRequest[] | null> {
    return this.adminFetch<AdminCircleJoinRequest[]>('/admin/circles/join-requests');
  }

  approveCircleJoinRequest(circleId: string, requestId: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/circles/${circleId}/join-requests/${requestId}/approve`, 'POST');
  }

  rejectCircleJoinRequest(circleId: string, requestId: string): Promise<void | null> {
    return this.adminFetch<void>(`/admin/circles/${circleId}/join-requests/${requestId}/reject`, 'POST');
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
