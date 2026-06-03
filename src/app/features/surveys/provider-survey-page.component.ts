import { CommonModule } from '@angular/common';
import { Component, WritableSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MarketFitService } from '../../core/market-fit.service';
import {
  pricingOptions,
  providerChallengeOptions,
  providerExperienceOptions,
  providerPromotionOptions,
  providerStepTitles,
  providerTypeOptions,
  providerValueOptions,
} from '../../core/within-options';

@Component({
  selector: 'app-provider-survey-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './provider-survey-page.component.html',
})
export class ProviderSurveyPageComponent {
  protected readonly stepTitles = providerStepTitles;
  protected readonly providerTypeOptions = providerTypeOptions;
  protected readonly providerExperienceOptions = providerExperienceOptions;
  protected readonly providerPromotionOptions = providerPromotionOptions;
  protected readonly providerChallengeOptions = providerChallengeOptions;
  protected readonly providerValueOptions = providerValueOptions;
  protected readonly pricingOptions = pricingOptions;

  protected readonly step = signal(0);
  protected readonly submitted = signal(false);
  protected readonly submissionMessage = signal('');
  protected readonly validationMessage = signal('');
  protected readonly invalidField = signal('');
  protected readonly name = signal('');
  protected readonly contact = signal('');
  protected readonly providerType = signal('');
  protected readonly experiences = signal<string[]>([]);
  protected readonly promotion = signal<string[]>([]);
  protected readonly challenges = signal<string[]>([]);
  protected readonly bookingTools = signal('');
  protected readonly wouldList = signal('');
  protected readonly valueDrivers = signal<string[]>([]);
  protected readonly pricing = signal('');
  protected readonly pilot = signal('');
  protected readonly firstEvent = signal('');
  protected readonly businessName = signal('');
  protected readonly link = signal('');
  protected readonly blocker = signal('');
  protected readonly comments = signal<Record<string, string>>({});

  constructor(private readonly marketFit: MarketFitService, private readonly router: Router) {}

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

  protected toggle(selection: WritableSignal<string[]>, value: string, event: Event, maxSelections?: number): void {
    const checkbox = event.target as HTMLInputElement;
    const current = selection();
    if (checkbox.checked) {
      if (maxSelections && current.length >= maxSelections) {
        checkbox.checked = false;
        return;
      }
      selection.set([...current, value]);
      return;
    }
    selection.set(current.filter(item => item !== value));
  }

  protected setComment(key: string, value: string): void {
    this.comments.set({ ...this.comments(), [key]: value });
  }

  protected comment(key: string): string {
    return this.comments()[key] ?? '';
  }

  protected fieldError(field: string): string {
    if (this.invalidField() !== field) return '';
    return field === 'name' ? 'Enter your name.' : 'Enter an email or phone number.';
  }

  protected async submit(): Promise<void> {
    if (!this.validate()) return;
    const result = await this.marketFit.saveSubmission({
      audience: 'provider',
      name: this.name().trim(),
      contact: this.contact().trim(),
      providerType: this.providerType(),
      businessName: this.businessName().trim(),
      experiences: this.experiences(),
      promotion: this.promotion(),
      challenges: this.challenges(),
      bookingTools: this.bookingTools(),
      wouldList: this.wouldList(),
      valueDrivers: this.valueDrivers(),
      pricing: this.pricing(),
      pilotInterest: this.pilot(),
      firstEventInterest: this.firstEvent(),
      websiteOrSocial: this.link().trim(),
      blocker: this.blocker().trim(),
      comments: this.comments(),
    });
    this.submissionMessage.set(result.message);
    this.submitted.set(true);
    if (result.savedRemote) setTimeout(() => void this.router.navigateByUrl('/'), 15000);
  }

  private validate(): boolean {
    const message = this.validationForStep();
    this.validationMessage.set(message);
    return !message;
  }

  private validationForStep(): string {
    switch (this.step()) {
      case 0:
        return !this.providerType() || !this.bookingTools() ? 'Choose what you do and whether you currently use booking or client tools.' : '';
      case 1:
        return this.experiences().length ? '' : 'Pick at least one thing you offer.';
      case 2:
        return this.promotion().length ? '' : 'Pick at least one way people find you today.';
      case 3:
        return this.challenges().length ? '' : 'Pick at least one current challenge.';
      case 4:
        if (!this.wouldList()) return 'Choose whether you would be open to this kind of platform.';
        if (!this.valueDrivers().length) return 'Pick at least one thing that would make it valuable.';
        return this.pricing() ? '' : 'Choose the pricing model that feels closest.';
      case 5:
        if (!this.pilot() || !this.firstEvent()) return 'Choose your pilot interest and first-event interest.';
        if (!this.name().trim()) {
          this.invalidField.set('name');
          return 'Add your name before submitting.';
        }
        if (!this.contact().trim()) {
          this.invalidField.set('contact');
          return 'Add your email or phone before submitting.';
        }
        this.invalidField.set('');
        return '';
      default:
        return '';
    }
  }
}
