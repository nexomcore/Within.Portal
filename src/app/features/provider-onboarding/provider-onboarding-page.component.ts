import { CommonModule } from '@angular/common';
import { Component, WritableSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProviderApplicationService } from '../../core/provider-application.service';
import { ProviderType, WithinLens } from '../../core/within.models';
import {
  lensOptions,
  onboardingServiceOptions,
  onboardingStepTitles,
  providerServiceDeliveryModeOptions,
  serviceAreaOptions,
  unifiedProviderTypeOptions,
} from '../../core/within-options';

@Component({
  selector: 'app-provider-onboarding-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './provider-onboarding-page.component.html',
})
export class ProviderOnboardingPageComponent {
  protected readonly stepTitles = onboardingStepTitles;
  protected readonly providerTypeOptions = unifiedProviderTypeOptions;
  protected readonly lensOptions = lensOptions;
  protected readonly deliveryModeOptions = providerServiceDeliveryModeOptions;
  protected readonly serviceAreaOptions = serviceAreaOptions;
  protected readonly onboardingServiceOptions = onboardingServiceOptions;

  protected readonly step = signal(0);
  protected readonly submitted = signal(false);
  protected readonly validationMessage = signal('');
  protected readonly submissionMessage = signal('');
  protected readonly providerType = signal<ProviderType | ''>('');
  protected readonly providerName = signal('');
  protected readonly primaryLens = signal<WithinLens | ''>('');
  protected readonly serviceAreas = signal<string[]>([]);
  protected readonly servicesOffered = signal<string[]>([]);
  protected readonly location = signal('');
  protected readonly bio = signal('');
  protected readonly practitionerTitle = signal('');
  protected readonly yearsPracticing = signal('');
  protected readonly certifications = signal('');
  protected readonly businessType = signal('');
  protected readonly abn = signal('');
  protected readonly facilities = signal('');
  protected readonly accessibilityFeatures = signal('');
  protected readonly deliveryModes = signal<string[]>([]);
  protected readonly contactName = signal('');
  protected readonly contactEmail = signal('');
  protected readonly contactPhone = signal('');
  protected readonly preferredContact = signal('Email');
  protected readonly website = signal('');
  protected readonly instagram = signal('');
  protected readonly declaration = signal(false);

  constructor(private readonly providerApplications: ProviderApplicationService) {}

  protected next(): void {
    if (!this.validate()) return;
    this.step.set(Math.min(this.step() + 1, this.stepTitles.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected previous(): void {
    this.validationMessage.set('');
    this.step.set(Math.max(this.step() - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected toggle(selection: WritableSignal<string[]>, value: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const current = selection();
    selection.set(checkbox.checked ? Array.from(new Set([...current, value])) : current.filter(item => item !== value));
  }

  protected isIndividual(): boolean {
    return this.providerType() === 'Individual';
  }

  protected async submit(): Promise<void> {
    if (!this.validate()) return;
    const isIndividual = this.isIndividual();
    const result = await this.providerApplications.submit({
      providerType: this.providerType(),
      providerCategory: isIndividual ? 'IndividualPractitioner' : 'BusinessStudio',
      primaryLens: this.primaryLens(),
      serviceAreas: this.serviceAreas(),
      contactName: this.contactName().trim(),
      contactEmail: this.contactEmail().trim(),
      contactPhone: this.contactPhone().trim(),
      preferredContactMethod: this.preferredContact().trim(),
      providerName: this.providerName().trim(),
      businessType: isIndividual ? this.practitionerTitle().trim() : this.businessType().trim(),
      abn: isIndividual ? null : this.abn().trim() || null,
      websiteUrl: this.website().trim() || null,
      instagramUrl: this.instagram().trim() || null,
      otherSocialUrl: null,
      location: this.location().trim(),
      deliveryModes: this.deliveryModes(),
      venueNames: isIndividual ? null : this.facilities().trim() || null,
      servicesOffered: this.servicesOffered(),
      yearsPracticing: this.yearsPracticing().trim(),
      typicalAudience: '',
      bio: this.bio().trim(),
      joinReason: '',
      certifications: this.certifications().trim(),
      insuranceStatus: '',
      workingWithChildrenCheck: '',
      firstAidCpr: '',
      professionalMemberships: null,
      credentialLinks: null,
      hasEventsReady: '',
      expectedFirstEvent: '',
      bookingTools: '',
      adminFacingNotes: isIndividual ? null : this.accessibilityFeatures().trim() || null,
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
        return this.providerType() ? '' : 'Choose what best describes you.';
      case 1:
        if (!this.providerName().trim() || !this.primaryLens() || !this.location().trim()) return 'Add display name, category group, and location.';
        return this.bio().trim() ? '' : this.isIndividual() ? 'Add a short About me description.' : 'Add a short About the business description.';
      case 2:
        if (this.isIndividual()) return this.practitionerTitle().trim() ? '' : 'Add your practitioner title.';
        return this.businessType().trim() ? '' : 'Add the business type.';
      case 3:
        if (!this.servicesOffered().length) return 'Add at least one service.';
        return this.deliveryModes().length ? '' : 'Choose at least one delivery mode.';
      case 4:
        if (!this.contactName().trim() || !this.contactEmail().trim()) return 'Add contact name and email.';
        return this.declaration() ? '' : 'Confirm the declaration before submitting.';
      default:
        return '';
    }
  }
}
