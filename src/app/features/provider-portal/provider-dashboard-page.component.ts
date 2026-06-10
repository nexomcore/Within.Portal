import { CommonModule } from '@angular/common';
import { Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProviderPortalService } from '../../core/provider-portal.service';
import { EventAgeRestriction, EventExperienceLevel, EventIntensity, EventItem, Option, Provider, ProviderEventEngagement, ProviderEventParticipant, ProviderPriceType, ProviderService, ProviderServiceDeliveryMode, SignupType, UpsertEventPayload, UpsertProviderPayload, UpsertProviderServicePayload, WithinLens } from '../../core/within.models';
import { lensOptions, providerPriceTypeOptions, providerServiceDeliveryModeOptions } from '../../core/within-options';

type ProviderSection = 'overview' | 'events' | 'services' | 'profile';

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
  protected readonly priceTypeOptions = providerPriceTypeOptions;
  protected readonly serviceDeliveryModeOptions = providerServiceDeliveryModeOptions;
  protected readonly bringItemOptions = [
    option('yoga_mat', 'Yoga mat'),
    option('water_bottle', 'Water bottle'),
    option('towel', 'Towel'),
    option('comfortable_shoes', 'Comfortable shoes'),
    option('sunscreen', 'Sunscreen'),
    option('hat', 'Hat'),
    option('journal_notebook', 'Journal/notebook'),
    option('pen', 'Pen'),
    option('meditation_cushion', 'Meditation cushion'),
    option('blanket', 'Blanket'),
    option('change_of_clothes', 'Change of clothes'),
    option('snacks_lunch', 'Snacks/lunch'),
    option('id_card', 'ID card'),
    option('mobile_ticket', 'Mobile ticket'),
    option('other', 'Other'),
  ];
  protected readonly facilityOptions = [
    option('toilets', 'Toilets'),
    option('drinking_water', 'Drinking water'),
    option('parking', 'Parking'),
    option('accessible_parking', 'Accessible parking'),
    option('change_rooms', 'Change rooms'),
    option('showers', 'Showers'),
    option('lockers', 'Lockers'),
    option('wifi', 'WiFi'),
    option('first_aid', 'First aid'),
    option('cafe', 'Cafe'),
    option('charging_stations', 'Charging stations'),
    option('air_conditioning', 'Air conditioning'),
    option('prayer_quiet_room', 'Prayer/quiet room'),
    option('child_friendly_area', 'Child-friendly area'),
  ];
  protected readonly accessibilityOptions = [
    option('wheelchair_accessible', 'Wheelchair accessible'),
    option('ramp_access', 'Ramp access'),
    option('accessible_toilets', 'Accessible toilets'),
    option('lift_elevator_access', 'Lift/elevator access'),
    option('accessible_parking', 'Accessible parking'),
    option('seating_available', 'Seating available'),
    option('hearing_assistance_available', 'Hearing assistance available'),
    option('sign_language_support', 'Sign language support'),
    option('companion_carer_welcome', 'Companion/carer welcome'),
    option('mobility_assistance_available', 'Mobility assistance available'),
  ];
  protected readonly intensityOptions: Option<EventIntensity>[] = [
    option('low', 'Low'),
    option('medium', 'Medium'),
    option('high', 'High'),
  ];
  protected readonly experienceLevelOptions: Option<EventExperienceLevel>[] = [
    option('beginner_friendly', 'Beginner friendly'),
    option('some_experience_recommended', 'Some experience recommended'),
    option('experienced_participants_only', 'Experienced participants only'),
  ];
  protected readonly atmosphereOptions = [
    option('first_timer_friendly', 'First timer friendly'),
    option('introvert_friendly', 'Introvert friendly'),
    option('quiet_environment', 'Quiet environment'),
    option('social_community_focused', 'Social/community focused'),
    option('family_friendly', 'Family friendly'),
    option('outdoor_event', 'Outdoor event'),
    option('indoor_event', 'Indoor event'),
    option('spiritual', 'Spiritual'),
    option('reflective', 'Reflective'),
    option('high_energy', 'High energy'),
    option('lgbtq_friendly', 'LGBTQ+ friendly'),
    option('women_only', 'Women only'),
    option('men_only', 'Men only'),
  ];
  protected readonly dietaryOptionsList = [
    option('vegan', 'Vegan'),
    option('vegetarian', 'Vegetarian'),
    option('gluten_free', 'Gluten-free'),
    option('dairy_free', 'Dairy-free'),
    option('nut_free', 'Nut-free'),
    option('halal', 'Halal'),
    option('other', 'Other'),
  ];
  protected readonly ageRestrictionOptions: Option<EventAgeRestriction>[] = [
    option('all_ages', 'All ages'),
    option('13_plus', '13+'),
    option('16_plus', '16+'),
    option('18_plus', '18+'),
    option('seniors_focused', 'Seniors focused'),
    option('family_kids_friendly', 'Family/kids friendly'),
  ];
  protected readonly provider = signal<Provider | null>(null);
  protected readonly services = signal<ProviderService[]>([]);
  protected readonly events = signal<EventItem[]>([]);
  protected readonly selectedEventId = signal<string | null>(null);
  protected readonly selectedServiceId = signal<string | null>(null);
  protected readonly engagement = signal<ProviderEventEngagement | null>(null);
  protected readonly engagementLoading = signal(false);
  protected readonly message = signal('');
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly authed = this.providerPortal.authed;

  // ---- Dashboard navigation ----
  protected readonly section = signal<ProviderSection>('overview');
  protected readonly navOpen = signal(false);
  protected readonly navItems: { id: ProviderSection; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'events', label: 'Events', icon: 'event' },
    { id: 'services', label: 'Services', icon: 'spa' },
    { id: 'profile', label: 'Profile', icon: 'storefront' },
  ];
  protected readonly sectionMeta: Record<ProviderSection, { title: string; sub: string }> = {
    overview: { title: 'Dashboard', sub: 'Your provider workspace at a glance' },
    events: { title: 'Events', sub: 'Create, publish and monitor your events' },
    services: { title: 'Services', sub: 'Manage your service catalogue' },
    profile: { title: 'Profile', sub: 'How members discover your practice' },
  };
  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });
  protected readonly recentEvents = computed(() => this.events().slice(0, 5));

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
  protected readonly providerServiceId = signal('');
  protected readonly externalBookingUrl = signal('');
  protected readonly imageUrl = signal('');
  protected readonly tagsText = signal('');
  protected readonly bringItems = signal<string[]>([]);
  protected readonly bringNotes = signal('');
  protected readonly facilities = signal<string[]>([]);
  protected readonly accessibilityFeatures = signal<string[]>([]);
  protected readonly physicalIntensity = signal<EventIntensity | ''>('');
  protected readonly socialInteractionLevel = signal<EventIntensity | ''>('');
  protected readonly experienceLevel = signal<EventExperienceLevel | ''>('');
  protected readonly atmosphereTags = signal<string[]>([]);
  protected readonly foodProvided = signal(false);
  protected readonly drinksProvided = signal(false);
  protected readonly dietaryOptions = signal<string[]>([]);
  protected readonly foodNotes = signal('');
  protected readonly ageRestriction = signal<EventAgeRestriction | ''>('');
  protected readonly safetyNotes = signal('');
  protected readonly profileName = signal('');
  protected readonly profileBio = signal('');
  protected readonly profileLocation = signal('');
  protected readonly profileCategoriesText = signal('');
  protected readonly profileWebsite = signal('');
  protected readonly profileInstagram = signal('');
  protected readonly profileOnlineAvailable = signal(false);
  protected readonly profileInPersonAvailable = signal(true);
  protected readonly serviceName = signal('');
  protected readonly serviceDescription = signal('');
  protected readonly serviceLens = signal<WithinLens>('Move');
  protected readonly serviceCategory = signal('');
  protected readonly serviceDuration = signal<number | null>(60);
  protected readonly servicePriceAmount = signal<number | null>(null);
  protected readonly servicePriceType = signal<ProviderPriceType>('ContactProvider');
  protected readonly serviceDeliveryMode = signal<ProviderServiceDeliveryMode>('InPerson');
  protected readonly serviceLocation = signal('');

  protected readonly selectedEvent = computed(() =>
    this.events().find(item => item.id === this.selectedEventId()) ?? null
  );
  protected readonly selectedService = computed(() =>
    this.services().find(item => item.id === this.selectedServiceId()) ?? null
  );
  protected readonly publishedCount = computed(() =>
    this.events().filter(item => item.status === 'Published').length
  );
  protected readonly draftCount = computed(() =>
    this.events().filter(item => item.status === 'Draft').length
  );
  protected readonly totalGoing = computed(() =>
    this.events().reduce((total, item) => total + item.goingCount, 0)
  );
  protected readonly activeServices = computed(() =>
    this.services().filter(item => item.isActive)
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
      const [provider, events, services] = await Promise.all([
        this.providerPortal.getProvider(),
        this.providerPortal.getEvents(),
        this.providerPortal.getServices(),
      ]);

      if (!provider || !events || !services) {
        this.message.set('Provider session expired. Sign in again.');
        await this.router.navigateByUrl('/providers/login');
        return;
      }

      this.provider.set(provider);
      this.events.set(events);
      this.services.set(services);
      this.populateProfile(provider);
      if (this.selectedEventId() && !events.some(event => event.id === this.selectedEventId())) {
        this.selectedEventId.set(null);
        this.engagement.set(null);
      }
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

  protected setSection(section: ProviderSection): void {
    this.section.set(section);
    this.navOpen.set(false);
  }

  protected goCreateEvent(): void {
    this.newEvent();
    this.setSection('events');
  }

  protected goAddService(): void {
    this.newService();
    this.setSection('services');
  }

  protected async editEvent(event: EventItem): Promise<void> {
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
    this.providerServiceId.set(event.providerServiceId ?? '');
    this.externalBookingUrl.set(event.externalBookingUrl ?? '');
    this.imageUrl.set(event.imageUrl ?? '');
    this.tagsText.set(event.tags.join(', '));
    this.bringItems.set(event.bringItems ?? []);
    this.bringNotes.set(event.bringNotes ?? '');
    this.facilities.set(event.facilities ?? []);
    this.accessibilityFeatures.set(event.accessibilityFeatures ?? []);
    this.physicalIntensity.set(event.physicalIntensity ?? '');
    this.socialInteractionLevel.set(event.socialInteractionLevel ?? '');
    this.experienceLevel.set(event.experienceLevel ?? '');
    this.atmosphereTags.set(event.atmosphereTags ?? []);
    this.foodProvided.set(event.foodProvided ?? false);
    this.drinksProvided.set(event.drinksProvided ?? false);
    this.dietaryOptions.set(event.dietaryOptions ?? []);
    this.foodNotes.set(event.foodNotes ?? '');
    this.ageRestriction.set(event.ageRestriction ?? '');
    this.safetyNotes.set(event.safetyNotes ?? '');
    this.message.set(`Editing ${event.title}.`);
    await this.loadEngagement(event.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected newEvent(): void {
    this.selectedEventId.set(null);
    this.engagement.set(null);
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
    this.providerServiceId.set('');
    this.externalBookingUrl.set('');
    this.imageUrl.set('');
    this.tagsText.set('');
    this.bringItems.set([]);
    this.bringNotes.set('');
    this.facilities.set([]);
    this.accessibilityFeatures.set([]);
    this.physicalIntensity.set('');
    this.socialInteractionLevel.set('');
    this.experienceLevel.set('');
    this.atmosphereTags.set([]);
    this.foodProvided.set(false);
    this.drinksProvided.set(false);
    this.dietaryOptions.set([]);
    this.foodNotes.set('');
    this.ageRestriction.set('');
    this.safetyNotes.set('');
    this.message.set('Ready for a new event.');
  }

  protected toggle(selection: WritableSignal<string[]>, value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = selection();
    selection.set(checked ? Array.from(new Set([...current, value])) : current.filter(item => item !== value));
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
      await this.loadEngagement(saved.id);
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

  protected editService(service: ProviderService): void {
    this.selectedServiceId.set(service.id);
    this.serviceName.set(service.name);
    this.serviceDescription.set(service.description);
    this.serviceLens.set(service.lens);
    this.serviceCategory.set(service.category);
    this.serviceDuration.set(service.durationMinutes);
    this.servicePriceAmount.set(service.priceAmount);
    this.servicePriceType.set(service.priceType);
    this.serviceDeliveryMode.set(service.deliveryMode);
    this.serviceLocation.set(service.location ?? '');
    this.message.set(`Editing service: ${service.name}.`);
  }

  protected newService(): void {
    this.selectedServiceId.set(null);
    this.serviceName.set('');
    this.serviceDescription.set('');
    this.serviceLens.set(this.provider()?.lens ?? 'Move');
    this.serviceCategory.set('');
    this.serviceDuration.set(60);
    this.servicePriceAmount.set(null);
    this.servicePriceType.set('ContactProvider');
    this.serviceDeliveryMode.set('InPerson');
    this.serviceLocation.set('');
  }

  protected async saveService(): Promise<void> {
    const provider = this.provider();
    if (!provider) return;
    const payload = this.buildServicePayload();
    if (!payload) return;
    this.saving.set(true);
    try {
      const serviceId = this.selectedServiceId();
      const saved = serviceId
        ? await this.providerPortal.updateService(serviceId, payload)
        : await this.providerPortal.createService(provider.id, payload);
      if (!saved) {
        this.message.set('Could not save service. Sign in again and retry.');
        return;
      }
      await this.load();
      this.selectedServiceId.set(saved.id);
      this.message.set(serviceId ? 'Service updated.' : 'Service added.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not save service.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async deleteService(service: ProviderService): Promise<void> {
    this.saving.set(true);
    try {
      await this.providerPortal.deleteService(service.id);
      if (this.selectedServiceId() === service.id) this.newService();
      await this.load();
      this.message.set('Service removed.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not remove service.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async saveProfile(): Promise<void> {
    const provider = this.provider();
    if (!provider) return;
    const payload: UpsertProviderPayload = {
      name: this.profileName().trim(),
      bio: this.profileBio().trim(),
      lens: provider.lens,
      location: this.profileLocation().trim(),
      websiteUrl: this.profileWebsite().trim() || null,
      instagramUrl: this.profileInstagram().trim() || null,
      providerType: provider.providerType,
      legalName: provider.legalName,
      categories: this.profileCategoriesText().split(',').map(item => item.trim()).filter(Boolean),
      profileImageUrl: provider.profileImageUrl,
      coverImageUrl: provider.coverImageUrl,
      suburb: provider.suburb,
      city: provider.city,
      state: provider.state,
      country: provider.country,
      phone: provider.phone,
      email: provider.email,
      showEmailPublicly: provider.showEmailPublicly,
      showPhonePublicly: provider.showPhonePublicly,
      showWebsitePublicly: provider.showWebsitePublicly,
      practitionerTitle: provider.practitionerTitle,
      yearsExperience: provider.yearsExperience,
      qualifications: provider.qualifications,
      servicesOffered: provider.servicesOffered,
      languages: provider.languages,
      onlineAvailable: this.profileOnlineAvailable(),
      inPersonAvailable: this.profileInPersonAvailable(),
      businessType: provider.businessType,
      abn: provider.abn,
      facilities: provider.facilities,
      accessibilityFeatures: provider.accessibilityFeatures,
      teamMembers: provider.teamMembers,
      openingHours: provider.openingHours,
      isActive: provider.isActive,
    };
    if (!payload.name || !payload.bio || !payload.location) {
      this.message.set('Profile name, bio, and location are required.');
      return;
    }
    this.saving.set(true);
    try {
      const saved = await this.providerPortal.updateProvider(payload);
      if (!saved) {
        this.message.set('Could not save profile. Sign in again and retry.');
        return;
      }
      this.provider.set(saved);
      this.populateProfile(saved);
      this.message.set('Profile updated.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not save profile.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async loadEngagement(eventId = this.selectedEventId()): Promise<void> {
    if (!eventId) {
      this.engagement.set(null);
      return;
    }

    this.engagementLoading.set(true);
    try {
      this.engagement.set(await this.providerPortal.getEventEngagement(eventId));
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not load event responses.');
    } finally {
      this.engagementLoading.set(false);
    }
  }

  protected attendeeTime(participant: ProviderEventParticipant): string {
    return new Date(participant.updatedUtc).toLocaleString();
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
      providerServiceId: this.providerServiceId() || null,
      externalBookingUrl: this.externalBookingUrl().trim() || null,
      imageUrl: this.imageUrl().trim() || null,
      tags: this.tagsText().split(',').map(tag => tag.trim()).filter(Boolean),
      bringItems: this.bringItems(),
      bringNotes: this.bringNotes().trim() || null,
      facilities: this.facilities(),
      accessibilityFeatures: this.accessibilityFeatures(),
      physicalIntensity: this.physicalIntensity() || null,
      socialInteractionLevel: this.socialInteractionLevel() || null,
      experienceLevel: this.experienceLevel() || null,
      atmosphereTags: this.atmosphereTags(),
      foodProvided: this.foodProvided(),
      drinksProvided: this.drinksProvided(),
      dietaryOptions: this.dietaryOptions(),
      foodNotes: this.foodNotes().trim() || null,
      ageRestriction: this.ageRestriction() || null,
      safetyNotes: this.safetyNotes().trim() || null,
    };
  }

  private buildServicePayload(): UpsertProviderServicePayload | null {
    if (!this.serviceName().trim() || !this.serviceDescription().trim() || !this.serviceCategory().trim()) {
      this.message.set('Add service name, description, and category.');
      return null;
    }
    if (this.servicePriceAmount() !== null && Number(this.servicePriceAmount()) < 0) {
      this.message.set('Service price cannot be negative.');
      return null;
    }
    return {
      name: this.serviceName().trim(),
      description: this.serviceDescription().trim(),
      lens: this.serviceLens(),
      category: this.serviceCategory().trim(),
      durationMinutes: this.serviceDuration() ? Number(this.serviceDuration()) : null,
      priceAmount: this.servicePriceAmount() === null ? null : Number(this.servicePriceAmount()),
      priceType: this.servicePriceType(),
      deliveryMode: this.serviceDeliveryMode(),
      location: this.serviceLocation().trim() || null,
      isActive: true,
    };
  }

  private populateProfile(provider: Provider): void {
    this.profileName.set(provider.name);
    this.profileBio.set(provider.bio);
    this.profileLocation.set(provider.location);
    this.profileCategoriesText.set(provider.categories.join(', '));
    this.profileWebsite.set(provider.websiteUrl ?? '');
    this.profileInstagram.set(provider.instagramUrl ?? '');
    this.profileOnlineAvailable.set(provider.onlineAvailable);
    this.profileInPersonAvailable.set(provider.inPersonAvailable);
  }
}

function option<T extends string>(value: T, label: string): Option<T> {
  return { value, label };
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
