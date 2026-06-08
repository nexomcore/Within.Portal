import { Injectable, signal } from '@angular/core';
import { API_BASE, PROVIDER_REFRESH_TOKEN_KEY, PROVIDER_TOKEN_KEY } from './api.config';
import { AuthResponse, EventItem, Provider, ProviderEventEngagement, ProviderService, UpsertEventPayload, UpsertProviderPayload, UpsertProviderServicePayload } from './within.models';

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

  getServices(): Promise<ProviderService[] | null> {
    return this.providerFetch<ProviderService[]>('/providers/me/services');
  }

  getEventEngagement(id: string): Promise<ProviderEventEngagement | null> {
    return this.providerFetch<ProviderEventEngagement>(`/providers/me/events/${id}/engagement`);
  }

  createEvent(payload: UpsertEventPayload): Promise<EventItem | null> {
    return this.providerFetch<EventItem>('/events', 'POST', payload);
  }

  updateEvent(id: string, payload: UpsertEventPayload): Promise<EventItem | null> {
    return this.providerFetch<EventItem>(`/events/${id}`, 'PUT', payload);
  }

  updateProvider(payload: UpsertProviderPayload): Promise<Provider | null> {
    return this.providerFetch<Provider>('/providers/me', 'PUT', payload);
  }

  createService(providerId: string, payload: UpsertProviderServicePayload): Promise<ProviderService | null> {
    return this.providerFetch<ProviderService>(`/providers/${providerId}/services`, 'POST', payload);
  }

  updateService(serviceId: string, payload: UpsertProviderServicePayload): Promise<ProviderService | null> {
    return this.providerFetch<ProviderService>(`/provider-services/${serviceId}`, 'PUT', payload);
  }

  deleteService(serviceId: string): Promise<void | null> {
    return this.providerFetch<void>(`/provider-services/${serviceId}`, 'DELETE');
  }

  private async providerFetch<T>(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: unknown): Promise<T | null> {
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
        const text = await response.text();
        const parsed = text ? JSON.parse(text) as { message?: string } : null;
        message = parsed?.message ?? message;
      } catch {
        message = response.statusText || message;
      }
      throw new Error(message);
    }

    return response.status === 204 ? null : await response.json() as T;
  }
}
