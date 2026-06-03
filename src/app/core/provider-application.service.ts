import { Injectable } from '@angular/core';
import { API_BASE } from './api.config';
import { ProviderApplication } from './within.models';

@Injectable({ providedIn: 'root' })
export class ProviderApplicationService {
  async submit(payload: Record<string, unknown>): Promise<{ savedRemote: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/provider-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);
      return { savedRemote: true, message: 'Application submitted. The Within team will review it before provider access opens.' };
    } catch {
      const key = 'within.providerApplications';
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as Record<string, unknown>[];
      existing.push({ ...payload, status: 'Submitted', submittedUtc: new Date().toISOString(), source: 'landing-page-local' });
      localStorage.setItem(key, JSON.stringify(existing));
      return { savedRemote: false, message: 'Could not reach the API, so this application was saved locally in this browser.' };
    }
  }
}

export type ProviderApplicationPayload = Omit<ProviderApplication, 'id' | 'status' | 'adminNotes' | 'reviewDecisionReason' | 'submittedUtc' | 'updatedUtc' | 'reviewedUtc' | 'approvedProviderId'>;
