import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing-page.component').then(m => m.LandingPageComponent),
  },
  {
    path: 'survey',
    loadComponent: () => import('./features/surveys/survey-choice-page.component').then(m => m.SurveyChoicePageComponent),
  },
  {
    path: 'survey/user',
    loadComponent: () => import('./features/surveys/user-survey-page.component').then(m => m.UserSurveyPageComponent),
  },
  {
    path: 'survey/provider',
    loadComponent: () => import('./features/surveys/provider-survey-page.component').then(m => m.ProviderSurveyPageComponent),
  },
  {
    path: 'providers/onboard',
    loadComponent: () => import('./features/provider-onboarding/provider-onboarding-page.component').then(m => m.ProviderOnboardingPageComponent),
  },
  {
    path: 'providers/login',
    loadComponent: () => import('./features/provider-portal/provider-login-page.component').then(m => m.ProviderLoginPageComponent),
  },
  {
    path: 'providers/dashboard',
    loadComponent: () => import('./features/provider-portal/provider-dashboard-page.component').then(m => m.ProviderDashboardPageComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-page.component').then(m => m.AdminPageComponent),
  },
  {
    path: 'internal/conversation-guide',
    loadComponent: () => import('./features/conversation-guide/conversation-guide-page.component').then(m => m.ConversationGuidePageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
