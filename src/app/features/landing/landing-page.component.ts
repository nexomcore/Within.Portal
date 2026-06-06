import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MarketFitService } from '../../core/market-fit.service';
import { interestRoleOptions } from '../../core/within-options';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
  protected readonly interestRoleOptions = interestRoleOptions;
  protected readonly interestName = signal('');
  protected readonly interestEmail = signal('');
  protected readonly interestRole = signal('');
  protected readonly interestNote = signal('');
  protected readonly interestSubmitted = signal(false);
  protected readonly interestValidationMessage = signal('');
  protected readonly submissionMessage = signal('');

  constructor(private readonly marketFit: MarketFitService) {}

  protected scrollToId(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected async submitInterest(): Promise<void> {
    const email = this.interestEmail().trim();
    const name = this.interestName().trim();
    if (!email || !name || !this.interestRole()) {
      this.interestValidationMessage.set('Add your name, email, and choose the option that best describes you.');
      return;
    }

    this.interestValidationMessage.set('');
    const result = await this.marketFit.saveSubmission({
      audience: 'interest',
      name,
      contact: email,
      role: this.interestRole(),
      note: this.interestNote().trim(),
    });
    this.submissionMessage.set(result.message);
    this.interestSubmitted.set(true);
  }
}
