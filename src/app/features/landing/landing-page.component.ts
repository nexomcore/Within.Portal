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

  protected readonly pulses = [
    { tag: 'Move', headline: 'Your body. What gets in the way of moving the way you want to?' },
    { tag: 'Feel', headline: 'Your inner world. What actually helps you feel different - not just distracted?' },
    { tag: 'Seek', headline: 'Your meaning. What does growth look like when no one is watching?' },
  ];

  protected readonly principles = [
    { tag: 'Move', label: 'Body in motion.', description: 'Energy, movement, sleep, and the practices that hold a life together.' },
    { tag: 'Feel', label: 'Inner balance.', description: 'Stress, mood, connection, reflection, and the practices that change how a day lands.' },
    { tag: 'Seek', label: 'Meaning and growth.', description: 'Purpose, presence, deeper questions, and the patient work of becoming.' },
  ];

  protected readonly approach = [
    { category: 'Listen', title: 'Two short surveys, one for each side.', detail: 'For people growing in their own way, and for the people who help them.' },
    { category: 'Shape', title: 'A small first version, on purpose.', detail: 'Start with one city and build something useful before adding more.' },
    { category: 'Honour', title: 'Shaped by the people who will use it.', detail: 'Provider and user feedback goes directly into the first version.' },
  ];

  protected readonly providerPoints = [
    'Tell us how you currently meet the people you help.',
    'Share what is hard about guiding people on their growth journey.',
    'Help shape a quieter place to be found by the right people.',
    'Apply for provider review when you are ready to onboard.',
  ];

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
