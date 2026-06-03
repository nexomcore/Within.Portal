import { CommonModule } from '@angular/common';
import { Component, WritableSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MarketFitService } from '../../core/market-fit.service';
import {
  categoryOptions,
  discoveryOptions,
  feelBarrierOptions,
  moveBarrierOptions,
  seekBarrierOptions,
  userExperienceOptions,
  userFeatureOptions,
  userProblemOptions,
  userProfileOptions,
  userStepTitles,
  wouldUseOptions,
} from '../../core/within-options';

@Component({
  selector: 'app-user-survey-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-survey-page.component.html',
})
export class UserSurveyPageComponent {
  protected readonly stepTitles = userStepTitles;
  protected readonly userProfileOptions = userProfileOptions;
  protected readonly categoryOptions = categoryOptions;
  protected readonly moveBarrierOptions = moveBarrierOptions;
  protected readonly feelBarrierOptions = feelBarrierOptions;
  protected readonly seekBarrierOptions = seekBarrierOptions;
  protected readonly userExperienceOptions = userExperienceOptions;
  protected readonly userProblemOptions = userProblemOptions;
  protected readonly userFeatureOptions = userFeatureOptions;
  protected readonly discoveryOptions = discoveryOptions;
  protected readonly wouldUseOptions = wouldUseOptions;

  protected readonly step = signal(0);
  protected readonly submitted = signal(false);
  protected readonly submissionMessage = signal('');
  protected readonly validationMessage = signal('');
  protected readonly invalidField = signal('');
  protected readonly name = signal('');
  protected readonly contact = signal('');
  protected readonly profile = signal('');
  protected readonly primaryCategory = signal('');
  protected readonly moveBarrier = signal('');
  protected readonly feelBarrier = signal('');
  protected readonly seekBarrier = signal('');
  protected readonly experiences = signal<string[]>([]);
  protected readonly problems = signal<string[]>([]);
  protected readonly wouldUse = signal('');
  protected readonly features = signal<string[]>([]);
  protected readonly discovery = signal<string[]>([]);
  protected readonly conversation = signal('');
  protected readonly wish = signal('');
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
      audience: 'user',
      name: this.name().trim(),
      contact: this.contact().trim(),
      profile: this.profile(),
      primaryCategory: this.primaryCategory(),
      moveBarrier: this.moveBarrier(),
      feelBarrier: this.feelBarrier(),
      seekBarrier: this.seekBarrier(),
      tried: this.experiences(),
      discovery: this.discovery(),
      stuckOn: this.problems(),
      wouldHelp: this.features(),
      wouldUse: this.wouldUse(),
      openToConversation: this.conversation(),
      wish: this.wish().trim(),
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
        return !this.profile() || !this.primaryCategory() ? 'Choose where you are right now and which area calls to you most.' : '';
      case 1:
        return !this.moveBarrier() || !this.feelBarrier() || !this.seekBarrier() ? 'Choose one barrier for Move, Feel, and Seek before continuing.' : '';
      case 2:
        return this.experiences().length ? '' : 'Pick at least one thing you have tried so far.';
      case 3:
        return this.problems().length ? '' : 'Pick at least one place where you get stuck.';
      case 4:
        if (!this.wouldUse()) return 'Choose whether you would use this kind of companion.';
        return this.features().length ? '' : 'Pick at least one thing that would actually help.';
      case 5:
        if (!this.discovery().length) return 'Pick at least one place where you usually look today.';
        if (!this.conversation()) return 'Choose whether you are open to a short conversation.';
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
