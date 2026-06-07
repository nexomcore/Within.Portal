import { Injectable } from '@angular/core';
import { API_BASE } from './api.config';

@Injectable({ providedIn: 'root' })
export class MarketFitService {
  async saveSubmission(payload: Record<string, unknown>): Promise<{ savedRemote: boolean; message: string }> {
    const submission = {
      ...payload,
      createdUtc: new Date().toISOString(),
      source: 'landing-page',
    };

    try {
      const response = await fetch(`${API_BASE}/market-fit/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience: payload['audience'],
          name: payload['name'],
          contact: payload['contact'],
          source: 'landing-page',
          answers: payload,
        }),
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);
      return { savedRemote: true, message: 'Response submitted successfully. Thank you!' };
    } catch {
      const key = 'within.marketFitSubmissions';
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as Record<string, unknown>[];
      existing.push(submission);
      localStorage.setItem(key, JSON.stringify(existing));
      return { savedRemote: false, message: 'Error in saving submission. Saving locally instead.' };
    }
  }
}
