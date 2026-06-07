import { CommonModule } from '@angular/common';
import { Component, WritableSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProviderApplicationService } from '../../core/provider-application.service';
import { ProviderCategory, WithinLens } from '../../core/within.models';
import {
  deliveryModeOptions,
  lensOptions,
  onboardingServiceOptions,
  onboardingStepTitles,
  providerCategoryOptions,
  serviceAreaOptions,
} from '../../core/within-options';

@Component({
  selector: 'app-provider-onboarding-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './provider-onboarding-page.component.html',
})
export class ProviderOnboardingPageComponent {
  protected readonly stepTitles = onboardingStepTitles;
  protected readonly providerCategoryOptions = providerCategoryOptions;
  protected readonly lensOptions = lensOptions;
  protected readonly deliveryModeOptions = deliveryModeOptions;
  protected readonly serviceAreaOptions = serviceAreaOptions;
  protected readonly onboardingServiceOptions = onboardingServiceOptions;

  protected readonly step = signal(0);
  protected readonly submitted = signal(false);
  protected readonly validationMessage = signal('');
  protected readonly submissionMessage = signal('');
  protected readonly invalidField = signal('');
  protected readonly contactName = signal('');
  protected readonly contactEmail = signal('');
  protected readonly contactPhone = signal('');
  protected readonly preferredContact = signal('');
  protected readonly providerName = signal('');
  protected readonly category = signal<ProviderCategory | ''>('');
  protected readonly businessType = signal('');
  protected readonly abn = signal('');
  protected readonly website = signal('');
  protected readonly instagram = signal('');
  protected readonly otherSocial = signal('');
  protected readonly location = signal('');
  protected readonly deliveryModes = signal<string[]>([]);
  protected readonly venueNames = signal('');
  protected readonly primaryLens = signal<WithinLens | ''>('');
  protected readonly serviceAreas = signal<string[]>([]);
  protected readonly servicesOffered = signal<string[]>([]);
  protected readonly yearsPracticing = signal('');
  protected readonly typicalAudience = signal('');
  protected readonly bio = signal('');
  protected readonly joinReason = signal('');
  protected readonly certifications = signal('');
  protected readonly insuranceStatus = signal('');
  protected readonly workingWithChildren = signal('');
  protected readonly firstAid = signal('');
  protected readonly memberships = signal('');
  protected readonly credentialLinks = signal('');
  protected readonly hasEventsReady = signal('');
  protected readonly expectedFirstEvent = signal('');
  protected readonly bookingTools = signal('');
  protected readonly adminNotes = signal('');
  protected readonly declaration = signal(false);

  constructor(private readonly providerApplications: ProviderApplicationService) {}

  protected next(): void {
    if (!this.validate()) return;
    this.validationMessage.set('');
    this.step.set(Math.min(this.step() + 1, this.stepTitles.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected previous(): void {
    this.validationMessage.set('');
    this.invalidField.set('');
    this.step.set(Math.max(this.step() - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected toggle(selection: WritableSignal<string[]>, value: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const current = selection();
    selection.set(checkbox.checked ? [...current, value] : current.filter(item => item !== value));
  }

  protected fieldError(field: string): string {
    if (this.invalidField() !== field) return '';
    return field === 'contactName' ? 'Enter the primary contact name.' : 'Enter an email address.';
  }

  protected async submit(): Promise<void> {
    if (!this.validate()) return;
    const result = await this.providerApplications.submit({
      providerCategory: this.category(),
      primaryLens: this.primaryLens(),
      serviceAreas: this.serviceAreas(),
      contactName: this.contactName().trim(),
      contactEmail: this.contactEmail().trim(),
      contactPhone: this.contactPhone().trim(),
      preferredContactMethod: this.preferredContact().trim(),
      providerName: this.providerName().trim(),
      businessType: this.businessType().trim(),
      abn: this.abn().trim() || null,
      websiteUrl: this.website().trim() || null,
      instagramUrl: this.instagram().trim() || null,
      otherSocialUrl: this.otherSocial().trim() || null,
      location: this.location().trim(),
      deliveryModes: this.deliveryModes(),
      venueNames: this.venueNames().trim() || null,
      servicesOffered: this.servicesOffered(),
      yearsPracticing: this.yearsPracticing().trim(),
      typicalAudience: this.typicalAudience().trim(),
      bio: this.bio().trim(),
      joinReason: this.joinReason().trim(),
      certifications: this.certifications().trim(),
      insuranceStatus: this.insuranceStatus().trim(),
      workingWithChildrenCheck: this.workingWithChildren().trim(),
      firstAidCpr: this.firstAid().trim(),
      professionalMemberships: this.memberships().trim() || null,
      credentialLinks: this.credentialLinks().trim() || null,
      hasEventsReady: this.hasEventsReady(),
      expectedFirstEvent: this.expectedFirstEvent().trim(),
      bookingTools: this.bookingTools().trim(),
      adminFacingNotes: this.adminNotes().trim() || null,
      declarationAccepted: this.declaration(),
    });
    this.submissionMessage.set(result.message);
    this.submitted.set(true);
  }

  private validate(): boolean {
    const message = this.validationForStep();
    this.validationMessage.set(message);
    return !message;
  }

  private validationForStep(): string {
    switch (this.step()) {
      case 0:
        if (!this.contactName().trim()) {
          this.invalidField.set('contactName');
          return 'Add the primary contact name.';
        }
        if (!this.contactEmail().trim()) {
          this.invalidField.set('contactEmail');
          return 'Add the primary contact email.';
        }
        if (!this.preferredContact()) return 'Choose a preferred contact method.';
        this.invalidField.set('');
        return '';
      case 1:
        return !this.providerName().trim() || !this.category() || !this.businessType().trim() ? 'Add the provider name, category, and business type.' : '';
      case 2:
        if (!this.location().trim() || !this.primaryLens()) return 'Add the location and primary lens.';
        return !this.deliveryModes().length || !this.serviceAreas().length || !this.servicesOffered().length ? 'Choose delivery, service areas, and services offered.' : '';
      case 3:
        return !this.yearsPracticing().trim() || !this.typicalAudience().trim() || !this.bio().trim() || !this.joinReason().trim() ? 'Complete experience, audience, bio, and why Within is a fit.' : '';
      case 4:
        return !this.certifications().trim() || !this.insuranceStatus().trim() || !this.workingWithChildren().trim() || !this.firstAid().trim() ? 'Add credentials, insurance status, working-with-children status, and first-aid/CPR status.' : '';
      case 5:
        if (!this.hasEventsReady() || !this.expectedFirstEvent().trim() || !this.bookingTools().trim()) return 'Complete event readiness and booking tool details.';
        return this.declaration() ? '' : 'Accept the declaration before submitting.';
      default:
        return '';
    }
  }
}
