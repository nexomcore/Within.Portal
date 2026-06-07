import { Injectable, signal } from '@angular/core';
import { API_BASE, PROVIDER_REFRESH_TOKEN_KEY, PROVIDER_TOKEN_KEY } from './api.config';
import { AuthResponse, EventItem, Provider, UpsertEventPayload } from './within.models';

@Injectable({ providedIn: 'root' })
export class ProviderPortalService {
  readonly authed = signal(!!localStorage.getItem(PROVIDER_TOKEN_KEY));

  async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!response.ok) throw new Error('Login failed. Check the provider credentials and API connection.');

    const body = await response.json() as AuthResponse;
    if (body.user.role !== 'Provider') {
      this.logout();
      throw new Error('Provider access required. Use an approved provider account.');
    }

    localStorage.setItem(PROVIDER_TOKEN_KEY, body.accessToken);
    localStorage.setItem(PROVIDER_REFRESH_TOKEN_KEY, body.refreshToken);
    this.authed.set(true);
    return body.user.displayName;
  }

  logout(): void {
    localStorage.removeItem(PROVIDER_TOKEN_KEY);
    localStorage.removeItem(PROVIDER_REFRESH_TOKEN_KEY);
    this.authed.set(false);
  }

  getProvider(): Promise<Provider | null> {
    return this.providerFetch<Provider>('/providers/me');
  }

  getEvents(): Promise<EventItem[] | null> {
    return this.providerFetch<EventItem[]>('/providers/me/events');
  }

  createEvent(payload: UpsertEventPayload): Promise<EventItem | null> {
    return this.providerFetch<EventItem>('/events', 'POST', payload);
  }

  updateEvent(id: string, payload: UpsertEventPayload): Promise<EventItem | null> {
    return this.providerFetch<EventItem>(`/events/${id}`, 'PUT', payload);
  }

  private async providerFetch<T>(path: string, method: 'GET' | 'POST' | 'PUT' = 'GET', body?: UpsertEventPayload): Promise<T | null> {
    const token = localStorage.getItem(PROVIDER_TOKEN_KEY);
    if (!token) {
      this.authed.set(false);
      return null;
    }

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

    if (!response.ok) {
      let message = 'Provider request failed.';
      try {
        const parsed = await response.json() as { message?: string };
        message = parsed.message ?? message;
      } catch {
        message = await response.text() || message;
      }
      throw new Error(message);
    }

    return await response.json() as T;
  }
}
