import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-survey-choice-page',
  imports: [RouterLink],
  template: `
    <main class="survey-shell survey-choice-shell">
      <header class="survey-topbar">
        <a class="brand" routerLink="/"><img src="/within-logo.png" alt="" /><span>Within</span></a>
      </header>
      <section class="survey-choice-page" aria-labelledby="survey-choice-title">
        <div class="survey-choice-heading">
          <span class="section-eyebrow">Start survey</span>
          <h1 id="survey-choice-title">Which survey is right for you?</h1>
          <p>Choose the path that best describes you. Each survey takes about two minutes.</p>
        </div>
        <div class="role-grid survey-choice-grid">
          <a class="role-card user-card" routerLink="/survey/user">
            <span class="role-eyebrow">For people growing</span>
            <strong>I am a user.</strong>
            <p>I want to share what gets in the way of my wellbeing across body, mind, and meaning.</p>
            <span class="role-cta">Start user survey →</span>
          </a>
          <a class="role-card provider-card" routerLink="/survey/provider">
            <span class="role-eyebrow">For guides & practitioners</span>
            <strong>I am a provider.</strong>
            <p>I host, teach, coach, guide, or support others and want to share what would help my work.</p>
            <span class="role-cta">Start provider survey →</span>
          </a>
        </div>
      </section>
    </main>
  `,
})
export class SurveyChoicePageComponent {}
