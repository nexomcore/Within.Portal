import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProviderPortalService } from '../../core/provider-portal.service';
import { EventItem, Provider, SignupType, UpsertEventPayload, WithinLens } from '../../core/within.models';
import { lensOptions } from '../../core/within-options';

@Component({
  selector: 'app-provider-dashboard-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './provider-dashboard-page.component.html',
})
export class ProviderDashboardPageComponent {
  private readonly providerPortal = inject(ProviderPortalService);
  private readonly router = inject(Router);

  protected readonly lensOptions = lensOptions;
  protected readonly signupTypes: SignupType[] = ['Internal', 'External'];
  protected readonly provider = signal<Provider | null>(null);
  protected readonly events = signal<EventItem[]>([]);
  protected readonly selectedEventId = signal<string | null>(null);
  protected readonly message = signal('');
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly authed = this.providerPortal.authed;

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly lens = signal<WithinLens>('Move');
  protected readonly locationName = signal('');
  protected readonly isOnline = signal(false);
  protected readonly startLocal = signal(defaultDateTimeLocal(24));
  protected readonly endLocal = signal(defaultDateTimeLocal(26));
  protected readonly priceAmount = signal(0);
  protected readonly currency = signal('AUD');
  protected readonly capacity = signal(20);
  protected readonly signupType = signal<SignupType>('Internal');
  protected readonly externalBookingUrl = signal('');
  protected readonly imageUrl = signal('');
  protected readonly tagsText = signal('');

  protected readonly selectedEvent = computed(() =>
    this.events().find(item => item.id === this.selectedEventId()) ?? null
  );
  protected readonly publishedCount = computed(() =>
    this.events().filter(item => item.status === 'Published').length
  );
  protected readonly draftCount = computed(() =>
    this.events().filter(item => item.status === 'Draft').length
  );
  protected readonly totalCapacity = computed(() =>
    this.events().reduce((total, item) => total + item.capacity, 0)
  );

  constructor() {
    if (!this.authed()) {
      void this.router.navigateByUrl('/providers/login');
      return;
    }

    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.message.set('');
    try {
      const [provider, events] = await Promise.all([
        this.providerPortal.getProvider(),
        this.providerPortal.getEvents(),
      ]);

      if (!provider || !events) {
        this.message.set('Provider session expired. Sign in again.');
        await this.router.navigateByUrl('/providers/login');
        return;
      }

      this.provider.set(provider);
      this.events.set(events);
      if (!this.lens()) this.lens.set(provider.lens);
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not load provider dashboard.');
    } finally {
      this.loading.set(false);
    }
  }

  protected logout(): void {
    this.providerPortal.logout();
    void this.router.navigateByUrl('/providers/login');
  }

  protected editEvent(event: EventItem): void {
    this.selectedEventId.set(event.id);
    this.title.set(event.title);
    this.description.set(event.description);
    this.lens.set(event.lens);
    this.locationName.set(event.locationName);
    this.isOnline.set(event.isOnline);
    this.startLocal.set(toDateTimeLocal(event.startUtc));
    this.endLocal.set(toDateTimeLocal(event.endUtc));
    this.priceAmount.set(event.priceAmount);
    this.currency.set(event.currency);
    this.capacity.set(event.capacity);
    this.signupType.set(event.signupType);
    this.externalBookingUrl.set(event.externalBookingUrl ?? '');
    this.imageUrl.set(event.imageUrl ?? '');
    this.tagsText.set(event.tags.join(', '));
    this.message.set(`Editing ${event.title}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected newEvent(): void {
    this.selectedEventId.set(null);
    this.title.set('');
    this.description.set('');
    this.lens.set(this.provider()?.lens ?? 'Move');
    this.locationName.set('');
    this.isOnline.set(false);
    this.startLocal.set(defaultDateTimeLocal(24));
    this.endLocal.set(defaultDateTimeLocal(26));
    this.priceAmount.set(0);
    this.currency.set('AUD');
    this.capacity.set(20);
    this.signupType.set('Internal');
    this.externalBookingUrl.set('');
    this.imageUrl.set('');
    this.tagsText.set('');
    this.message.set('Ready for a new event.');
  }

  protected async saveEvent(): Promise<void> {
    const payload = this.buildPayload();
    if (!payload) return;

    this.saving.set(true);
    try {
      const eventId = this.selectedEventId();
      const saved = eventId
        ? await this.providerPortal.updateEvent(eventId, payload)
        : await this.providerPortal.createEvent(payload);

      if (!saved) {
        this.message.set('Could not save event. Sign in again and retry.');
        return;
      }

      await this.load();
      this.selectedEventId.set(saved.id);
      this.message.set(eventId ? 'Event updated.' : 'Event created.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not save event.');
    } finally {
      this.saving.set(false);
    }
  }

  protected eventTime(event: EventItem): string {
    return `${new Date(event.startUtc).toLocaleString()} - ${new Date(event.endUtc).toLocaleTimeString()}`;
  }

  private buildPayload(): UpsertEventPayload | null {
    if (!this.title().trim() || !this.description().trim() || !this.locationName().trim()) {
      this.message.set('Add title, description, and location.');
      return null;
    }

    const start = new Date(this.startLocal());
    const end = new Date(this.endLocal());
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      this.message.set('Choose a valid start and end time.');
      return null;
    }

    if (this.priceAmount() < 0) {
      this.message.set('Price cannot be negative.');
      return null;
    }

    if (this.capacity() <= 0) {
      this.message.set('Capacity must be greater than zero.');
      return null;
    }

    if (this.signupType() === 'External' && !isHttpUrl(this.externalBookingUrl())) {
      this.message.set('External events require a valid booking URL.');
      return null;
    }

    return {
      title: this.title().trim(),
      description: this.description().trim(),
      lens: this.lens(),
      locationName: this.locationName().trim(),
      isOnline: this.isOnline(),
      startUtc: start.toISOString(),
      endUtc: end.toISOString(),
      priceAmount: Number(this.priceAmount()),
      currency: this.currency().trim() || 'AUD',
      capacity: Number(this.capacity()),
      signupType: this.signupType(),
      externalBookingUrl: this.externalBookingUrl().trim() || null,
      imageUrl: this.imageUrl().trim() || null,
      tags: this.tagsText().split(',').map(tag => tag.trim()).filter(Boolean),
    };
  }
}

function defaultDateTimeLocal(hoursFromNow: number): string {
  const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  return toDateTimeLocal(date.toISOString());
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
