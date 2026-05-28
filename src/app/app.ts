import { CommonModule } from '@angular/common';
import { Component, HostListener, WritableSignal, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SurveyAudience = 'user' | 'provider';
type PageMode = 'landing' | 'user-survey' | 'provider-survey' | 'conversation-guide' | 'admin';
type AdminAudienceFilter = 'all' | 'user' | 'provider' | 'interest';

interface AdminSubmission {
  id: string;
  audience: string;
  name: string;
  contact: string;
  source: string;
  answers: Record<string, unknown>;
  createdUtc: string;
}

interface AdminStats {
  totalSubmissions: number;
  userSubmissions: number;
  providerSubmissions: number;
  totalUsers: number;
  providerUsers: number;
  adminUsers: number;
  latestSubmissionUtc: string | null;
}

interface AdminUserRecord {
  id: string;
  displayName: string;
  email: string;
  role: 'User' | 'Provider' | 'Admin';
  createdUtc: string;
}

interface AdminAnswerEntry {
  key: string;
  value: string;
  comment: string;
}

const ADMIN_TOKEN_KEY = 'within.admin.accessToken';
const API_BASE = (() => {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5177/api';
  }
  return 'https://app-within-api-np-001.azurewebsites.net/api';
})();

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Within');
  protected readonly pageMode = signal<PageMode>(this.getPageMode());
  protected readonly activeSurvey = signal<SurveyAudience>('user');
  protected readonly surveySubmitted = signal<SurveyAudience | null>(null);
  protected readonly userStep = signal(0);
  protected readonly providerStep = signal(0);
  protected readonly submissionMessage = signal('');
  protected readonly userValidationMessage = signal('');
  protected readonly providerValidationMessage = signal('');
  protected readonly interestValidationMessage = signal('');
  protected readonly invalidField = signal('');
  protected readonly waitlistName = signal('');
  protected readonly waitlistEmail = signal('');
  protected readonly waitlistRole = signal('Early user');

  protected readonly userProfile = signal('');
  protected readonly userExperiences = signal<string[]>([]);
  protected readonly userDiscovery = signal<string[]>([]);
  protected readonly userProblems = signal<string[]>([]);
  protected readonly userPrimaryCategory = signal('');
  protected readonly userMoveBarrier = signal('');
  protected readonly userFeelBarrier = signal('');
  protected readonly userSeekBarrier = signal('');
  protected readonly userWouldUse = signal('');
  protected readonly userFeatures = signal<string[]>([]);
  protected readonly userConversation = signal('');
  protected readonly userContact = signal('');
  protected readonly userWish = signal('');

  protected readonly providerType = signal('');
  protected readonly providerExperiences = signal<string[]>([]);
  protected readonly providerPromotion = signal<string[]>([]);
  protected readonly providerChallenges = signal<string[]>([]);
  protected readonly providerBookingTools = signal('');
  protected readonly providerWouldList = signal('');
  protected readonly providerValue = signal<string[]>([]);
  protected readonly providerPricing = signal('');
  protected readonly providerPilot = signal('');
  protected readonly providerFirstEvent = signal('');
  protected readonly providerBusinessName = signal('');
  protected readonly providerContact = signal('');
  protected readonly providerLink = signal('');
  protected readonly providerBlocker = signal('');

  protected readonly userComments = signal<Record<string, string>>({});
  protected readonly providerComments = signal<Record<string, string>>({});

  protected readonly interestName = signal('');
  protected readonly interestEmail = signal('');
  protected readonly interestRole = signal('');
  protected readonly interestNote = signal('');
  protected readonly interestSubmitted = signal(false);

  protected readonly adminEmail = signal('admin@within.local');
  protected readonly adminPassword = signal('');
  protected readonly adminMessage = signal('');
  protected readonly adminAuthed = signal(!!localStorage.getItem(ADMIN_TOKEN_KEY));
  protected readonly adminLoading = signal(false);
  protected readonly adminSubmissions = signal<AdminSubmission[]>([]);
  protected readonly adminStats = signal<AdminStats | null>(null);
  protected readonly adminUsers = signal<AdminUserRecord[]>([]);
  protected readonly adminFilter = signal<AdminAudienceFilter>('all');
  protected readonly adminSelectedId = signal<string | null>(null);
  protected readonly adminTab = signal<'submissions' | 'users'>('submissions');
  protected readonly adminFilteredSubmissions = computed(() => {
    const filter = this.adminFilter();
    const list = this.adminSubmissions();
    return filter === 'all' ? list : list.filter(item => item.audience === filter);
  });
  protected readonly adminSelectedSubmission = computed(() =>
    this.adminSubmissions().find(item => item.id === this.adminSelectedId()) ?? null
  );

  protected readonly interestRoleOptions = [
    'Curious — tell me more',
    'I attend wellbeing experiences',
    'I host or run sessions',
    'I work in wellness / community',
    'Just keep me posted',
  ];

  protected readonly pulses = [
    {
      tag: 'Move',
      headline: 'Your body. What gets in the way of moving the way you want to?',
    },
    {
      tag: 'Feel',
      headline: 'Your inner world. What actually helps you feel different — not just distracted?',
    },
    {
      tag: 'Seek',
      headline: 'Your meaning. What does growth look like when no one is watching?',
    },
  ];

  protected readonly principles = [
    {
      tag: 'Move',
      label: 'Body in motion.',
      description: 'The daily rhythm of being well — energy, movement, sleep, the simple practices that hold a life together.',
    },
    {
      tag: 'Feel',
      label: 'Inner balance.',
      description: 'Stress, mood, connection, reflection — the practices that quietly change how a day actually lands.',
    },
    {
      tag: 'Seek',
      label: 'Meaning and growth.',
      description: 'Purpose, presence, the deeper questions — and the patient work of becoming who you want to be.',
    },
  ];

  protected readonly approach = [
    {
      category: 'Listen',
      title: 'Two short surveys, one for each side.',
      detail: 'For people growing in their own way, and for the people who help them. Two minutes each, no fluff.',
    },
    {
      category: 'Shape',
      title: 'A small first cut, on purpose.',
      detail: 'Start with one city. Build something quiet and useful before adding anything else.',
    },
    {
      category: 'Honour',
      title: 'Shaped by the people who will use it.',
      detail: 'Your barriers and your wishes go straight into the first version. Nothing here is final until it earns a place.',
    },
  ];

  protected readonly providerPoints = [
    'Tell us how you currently meet the people you help — and where it falls down.',
    'Share what is actually hard about guiding people on their growth journey.',
    'Help shape a quieter place to be found by the right people.',
    'Be the first to know when the early pilot opens.',
  ];

  protected readonly surveyStats = [
    { value: '3 areas', label: 'body · mind · meaning' },
    { value: 'Perth', label: 'first city · early pilot' },
    { value: 'Open', label: 'we read every response' },
  ];

  protected readonly userStepTitles = [
    'About you',
    'Your three areas',
    'What you have tried',
    'Where you get stuck',
    'What would help',
    'Contact',
  ];

  protected readonly providerStepTitles = [
    'Provider type',
    'Offerings',
    'Promotion',
    'Challenges',
    'Platform fit',
    'Pilot contact',
  ];

  protected readonly userProfileOptions = [
    'I have a consistent daily practice',
    'I dabble — practice on and off',
    'I am just starting out',
    'I am curious but have not started yet',
    'I tried, lost momentum, and want to come back',
  ];

  protected readonly userExperienceOptions = [
    'Yoga / pilates / movement classes',
    'Gym, strength, or cardio training',
    'Walking, hiking, or outdoor sessions',
    'Meditation or mindfulness',
    'Breathwork',
    'Journaling or reflective writing',
    'Habit or routine tracking apps',
    'Therapy or counselling',
    'Coaching or mentoring',
    'Workshops or short courses',
    'Retreats',
    'Sound, energy, or somatic work',
    'Reading, podcasts, or online courses',
    'Community circles or meetups',
    'Religious or faith practice',
  ];

  protected readonly discoveryOptions = [
    'Instagram',
    'Facebook groups',
    'Meetup',
    'Google search',
    'Eventbrite',
    'Friends / word of mouth',
    'Books, podcasts, or YouTube',
    'Apps I already use',
    'Local studios or gyms',
    'WhatsApp groups',
    'I do not really know where to look',
  ];

  protected readonly userProblemOptions = [
    'I lose motivation when I am on my own',
    'Tools feel scattered across apps and accounts',
    'I cannot tell what is real and what is hype',
    'I do not know where to start',
    'I have no clear sense of progress',
    'Too much content, too little practice',
    'Hard to find people on the same path',
    'I feel judged or out of place in these spaces',
    'Pricing is opaque',
    'It feels overwhelming to commit',
  ];

  protected readonly categoryOptions = [
    'Move: my body, energy, movement',
    'Feel: my mood, stress, inner balance',
    'Seek: meaning, purpose, deeper growth',
    'A mix of all three',
  ];

  protected readonly wouldUseOptions = [
    'Yes, definitely',
    'Maybe, depends on what is in it',
    'Maybe, depends on price',
    'Not sure',
    'No',
  ];

  protected readonly userFeatureOptions = [
    'A calmer place to find practices and people',
    'Trusted teachers and guides in one place',
    'Daily reflection or journaling prompts',
    'A simple way to build small habits',
    'See how I am doing across body, mind, and meaning',
    'Beginner-friendly paths in each area',
    'Small community circles',
    'Local events and gatherings',
    'Retreats and deeper experiences',
    'Private notes only I can see',
    'A weekly nudge that is not noise',
    'Help finding what is right for me',
  ];

  protected readonly moveBarrierOptions = [
    'Time and energy after work',
    'Motivation when I am alone',
    'I do not know where to start',
    'I lose consistency',
    'It starts to feel like a chore',
    'Cost of classes or gyms',
    'Injury, illness, or physical limits',
    'Other',
  ];

  protected readonly feelBarrierOptions = [
    'I do not know where to start',
    'Stress spills into everything',
    'I do not feel safe opening up',
    'I do not get quiet time alone',
    'Therapy feels too clinical or pricey',
    'I cannot sit still long enough',
    'I do not know what actually works for me',
    'Other',
  ];

  protected readonly seekBarrierOptions = [
    'I do not know what I believe',
    'Spiritual spaces feel performative',
    'I get curious but lose momentum',
    'I do not know who to trust',
    'I cannot find people on the same path',
    'I feel I should already know',
    'Too much content, not enough practice',
    'Other',
  ];

  protected readonly providerTypeOptions = [
    'Yoga or movement teacher',
    'Meditation or mindfulness teacher',
    'Fitness trainer',
    'Breathwork facilitator',
    'Sound or somatic practitioner',
    'Therapist or counsellor',
    'Life or mindset coach',
    'Wellness or habits coach',
    'Retreat organiser',
    'Spiritual practitioner',
    'Community circle host',
    'Studio or business owner',
    'Other guide / practitioner',
  ];

  protected readonly providerExperienceOptions = [
    'Drop-in classes',
    'Workshops',
    '1:1 sessions',
    'Group sessions',
    'Ongoing programs or courses',
    'Coaching journeys',
    'Retreats',
    'Online sessions',
    'Community circles or meetups',
    'Corporate wellbeing sessions',
  ];

  protected readonly providerPromotionOptions = [
    'Instagram',
    'Facebook',
    'Facebook groups',
    'Meetup',
    'Eventbrite',
    'Google Business Profile',
    'Website',
    'Email list',
    'Word of mouth',
    'Paid ads',
    'Studio partnerships',
  ];

  protected readonly providerChallengeOptions = [
    'Getting discovered by the right people',
    'Filling sessions or programs consistently',
    'Building trust with someone before they commit',
    'Keeping people engaged across a journey, not just one session',
    'Managing bookings and payments',
    'Communicating with people between sessions',
    'Standing out from louder marketing',
    'Helping people see their own progress',
    'Admin work eating into the actual practice',
    'Promoting retreats or longer programs',
  ];

  protected readonly providerValueOptions = [
    'Reach people genuinely on a growth path',
    'Be found by the right people, not everyone',
    'Easy way to share what I offer',
    'Help people see their progress with me',
    'Support people between sessions',
    'A trusted, verified guide profile',
    'Reviews from people who actually showed up',
    'Payment and booking handled simply',
    'Promote retreats and longer programs',
    'Corporate or community partnerships',
    'A calmer place than social media to be found',
  ];

  protected readonly pricingOptions = [
    'Free listing with commission per booking',
    'Monthly subscription',
    'Free basic plan + paid premium features',
    'One-time event promotion fee',
    'Not sure',
    'I would only use it if free',
  ];

  constructor() {
    if (this.pageMode() === 'admin' && this.adminAuthed()) {
      void this.loadAdminData();
    }
  }

  @HostListener('window:popstate')
  protected onPopState(): void {
    this.pageMode.set(this.getPageMode());
    if (this.pageMode() === 'admin' && this.adminAuthed() && !this.adminSubmissions().length) {
      void this.loadAdminData();
    }
  }

  protected navigate(path: string): void {
    history.pushState(null, '', path);
    this.pageMode.set(this.getPageMode());
    this.activeSurvey.set(path.includes('provider') ? 'provider' : 'user');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected scrollToId(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  protected chooseSurvey(audience: SurveyAudience): void {
    this.activeSurvey.set(audience);
    this.surveySubmitted.set(null);
    this.submissionMessage.set('');
    this.userValidationMessage.set('');
    this.providerValidationMessage.set('');
    this.invalidField.set('');
    this.navigate(audience === 'provider' ? '/survey/provider' : '/survey/user');
  }

  protected currentStep(): number {
    return this.pageMode() === 'provider-survey' ? this.providerStep() : this.userStep();
  }

  protected totalSteps(): number {
    return this.pageMode() === 'provider-survey' ? this.providerStepTitles.length : this.userStepTitles.length;
  }

  protected currentStepTitle(): string {
    const step = this.currentStep();
    return this.pageMode() === 'provider-survey'
      ? this.providerStepTitles[step]
      : this.userStepTitles[step];
  }

  protected nextUserStep(): void {
    if (!this.validateUserStep()) {
      return;
    }

    this.userValidationMessage.set('');
    this.userStep.set(Math.min(this.userStep() + 1, this.userStepTitles.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected previousUserStep(): void {
    this.userValidationMessage.set('');
    this.invalidField.set('');
    this.userStep.set(Math.max(this.userStep() - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected nextProviderStep(): void {
    if (!this.validateProviderStep()) {
      return;
    }

    this.providerValidationMessage.set('');
    this.providerStep.set(Math.min(this.providerStep() + 1, this.providerStepTitles.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected previousProviderStep(): void {
    this.providerValidationMessage.set('');
    this.invalidField.set('');
    this.providerStep.set(Math.max(this.providerStep() - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected toggleUserExperience(value: string, event: Event): void {
    this.toggleSelection(this.userExperiences, value, event);
  }

  protected toggleUserDiscovery(value: string, event: Event): void {
    this.toggleSelection(this.userDiscovery, value, event);
  }

  protected toggleUserProblem(value: string, event: Event): void {
    this.toggleSelection(this.userProblems, value, event, 3);
  }

  protected toggleUserFeature(value: string, event: Event): void {
    this.toggleSelection(this.userFeatures, value, event, 5);
  }

  protected toggleProviderExperience(value: string, event: Event): void {
    this.toggleSelection(this.providerExperiences, value, event);
  }

  protected toggleProviderPromotion(value: string, event: Event): void {
    this.toggleSelection(this.providerPromotion, value, event);
  }

  protected toggleProviderChallenge(value: string, event: Event): void {
    this.toggleSelection(this.providerChallenges, value, event, 3);
  }

  protected toggleProviderValue(value: string, event: Event): void {
    this.toggleSelection(this.providerValue, value, event);
  }

  protected setUserComment(key: string, value: string): void {
    this.userComments.set({ ...this.userComments(), [key]: value });
  }

  protected setProviderComment(key: string, value: string): void {
    this.providerComments.set({ ...this.providerComments(), [key]: value });
  }

  protected userComment(key: string): string {
    return this.userComments()[key] ?? '';
  }

  protected providerComment(key: string): string {
    return this.providerComments()[key] ?? '';
  }

  protected fieldError(field: string): string {
    if (this.invalidField() !== field) {
      return '';
    }

    if (field === 'waitlistName' || field === 'providerName') {
      return 'Enter your name.';
    }

    if (field === 'userContact' || field === 'providerContact') {
      return 'Enter an email or phone number.';
    }

    return '';
  }

  protected async submitUserSurvey(): Promise<void> {
    if (!this.validateUserStep()) {
      return;
    }

    const payload = {
      audience: 'user',
      name: this.waitlistName().trim(),
      contact: this.userContact().trim(),
      profile: this.userProfile(),
      primaryCategory: this.userPrimaryCategory(),
      moveBarrier: this.userMoveBarrier(),
      feelBarrier: this.userFeelBarrier(),
      seekBarrier: this.userSeekBarrier(),
      tried: this.userExperiences(),
      discovery: this.userDiscovery(),
      stuckOn: this.userProblems(),
      wouldHelp: this.userFeatures(),
      wouldUse: this.userWouldUse(),
      openToConversation: this.userConversation(),
      wish: this.userWish().trim(),
      comments: this.userComments(),
    };
    await this.saveMarketFitSubmission(payload);
    this.waitlistEmail.set(this.userContact());
    this.waitlistRole.set('Early user');
    this.surveySubmitted.set('user');
  }

  protected async submitProviderSurvey(): Promise<void> {
    if (!this.validateProviderStep()) {
      return;
    }

    const payload = {
      audience: 'provider',
      name: this.waitlistName().trim(),
      contact: this.providerContact().trim(),
      providerType: this.providerType(),
      businessName: this.providerBusinessName().trim(),
      experiences: this.providerExperiences(),
      promotion: this.providerPromotion(),
      challenges: this.providerChallenges(),
      bookingTools: this.providerBookingTools(),
      wouldList: this.providerWouldList(),
      valueDrivers: this.providerValue(),
      pricing: this.providerPricing(),
      pilotInterest: this.providerPilot(),
      firstEventInterest: this.providerFirstEvent(),
      websiteOrSocial: this.providerLink().trim(),
      blocker: this.providerBlocker().trim(),
      comments: this.providerComments(),
    };
    await this.saveMarketFitSubmission(payload);
    this.waitlistEmail.set(this.providerContact());
    this.waitlistRole.set('Provider');
    this.surveySubmitted.set('provider');
  }

  protected async submitInterest(): Promise<void> {
    const email = this.interestEmail().trim();
    const name = this.interestName().trim();
    if (!email || !name || !this.interestRole()) {
      this.interestValidationMessage.set('Add your name, email, and choose the option that best describes you.');
      return;
    }

    this.interestValidationMessage.set('');
    const payload = {
      audience: 'interest',
      name,
      contact: email,
      role: this.interestRole(),
      note: this.interestNote().trim(),
    };
    await this.saveMarketFitSubmission(payload);
    this.interestSubmitted.set(true);
  }

  private getPageMode(): PageMode {
    const path = window.location.pathname;
    if (path === '/survey/user') return 'user-survey';
    if (path === '/survey/provider') return 'provider-survey';
    if (path === '/internal/conversation-guide') return 'conversation-guide';
    if (path === '/admin' || path.startsWith('/admin/')) return 'admin';
    return 'landing';
  }

  protected showAdmin(): void {
    this.navigate('/admin');
    if (this.adminAuthed()) {
      this.loadAdminData();
    }
  }

  protected async adminLogin(): Promise<void> {
    const email = this.adminEmail().trim();
    const password = this.adminPassword();
    if (!email || !password) {
      this.adminMessage.set('Enter email and password.');
      return;
    }

    this.adminLoading.set(true);
    this.adminMessage.set('Signing in...');

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 403) {
        this.adminMessage.set('That account is not an admin.');
        this.adminLoading.set(false);
        return;
      }

      if (!response.ok) {
        this.adminMessage.set('Login failed. Check the credentials and that the API is running.');
        this.adminLoading.set(false);
        return;
      }

      const body = await response.json() as { accessToken: string; refreshToken: string; user: { displayName: string } };
      localStorage.setItem(ADMIN_TOKEN_KEY, body.accessToken);
      localStorage.setItem('within.admin.refreshToken', body.refreshToken);
      this.adminAuthed.set(true);
      this.adminPassword.set('');
      this.adminMessage.set(`Signed in as ${body.user.displayName}.`);
      this.adminLoading.set(false);
      await this.loadAdminData();
    } catch {
      this.adminLoading.set(false);
      this.adminMessage.set(`Could not reach the API. Is it running on ${API_BASE}?`);
    }
  }

  protected adminLogout(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('within.admin.refreshToken');
    this.adminAuthed.set(false);
    this.adminSubmissions.set([]);
    this.adminStats.set(null);
    this.adminUsers.set([]);
    this.adminSelectedId.set(null);
    this.adminMessage.set('Signed out.');
  }

  protected async loadAdminData(): Promise<void> {
    this.adminLoading.set(true);
    this.adminMessage.set('');

    const [submissions, stats, users] = await Promise.all([
      this.adminFetch<AdminSubmission[]>('/admin/submissions'),
      this.adminFetch<AdminStats>('/admin/stats'),
      this.adminFetch<AdminUserRecord[]>('/admin/users'),
    ]);

    this.adminLoading.set(false);

    if (submissions === null || stats === null || users === null) {
      return;
    }

    this.adminSubmissions.set(submissions);
    this.adminStats.set(stats);
    this.adminUsers.set(users);
    if (!this.adminSelectedId() && submissions.length) {
      this.adminSelectedId.set(submissions[0].id);
    }
  }

  protected setAdminFilter(filter: AdminAudienceFilter): void {
    this.adminFilter.set(filter);
    const filtered = this.adminFilteredSubmissions();
    if (filtered.length && !filtered.some(item => item.id === this.adminSelectedId())) {
      this.adminSelectedId.set(filtered[0].id);
    }
  }

  protected setAdminTab(tab: 'submissions' | 'users'): void {
    this.adminTab.set(tab);
  }

  protected selectSubmission(id: string): void {
    this.adminSelectedId.set(id);
  }

  protected async deleteSubmission(id: string): Promise<void> {
    if (!confirm('Delete this submission? This cannot be undone.')) {
      return;
    }

    const ok = await this.adminFetch<void>(`/admin/submissions/${id}`, 'DELETE');
    if (ok === null) {
      return;
    }

    const remaining = this.adminSubmissions().filter(item => item.id !== id);
    this.adminSubmissions.set(remaining);
    if (this.adminSelectedId() === id) {
      this.adminSelectedId.set(remaining[0]?.id ?? null);
    }

    const stats = await this.adminFetch<AdminStats>('/admin/stats');
    if (stats) {
      this.adminStats.set(stats);
    }
  }

  protected answerEntries(submission: AdminSubmission | null): AdminAnswerEntry[] {
    if (!submission) return [];
    const comments = this.extractComments(submission.answers['comments']);
    return Object.entries(submission.answers)
      .filter(([key]) => !['audience', 'name', 'contact', 'source', 'createdUtc', 'comments'].includes(key))
      .map(([key, value]) => ({
        key: this.formatKey(key),
        value: this.formatValue(value),
        comment: comments[key] ?? '',
      }));
  }

  protected formatAudience(audience: string): string {
    if (audience === 'provider') return 'Provider';
    if (audience === 'interest') return 'Interest';
    return 'User';
  }

  private formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, char => char.toUpperCase())
      .trim();
  }

  private formatValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.length ? value.join(', ') : '-';
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== null && v !== undefined && v !== '');
      if (!entries.length) return '-';
      return entries.map(([k, v]) => `${this.formatKey(k)}: ${this.formatValue(v)}`).join(' — ');
    }
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  }

  private extractComments(value: unknown): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, comment]) => typeof comment === 'string' && comment.trim().length > 0)
        .map(([key, comment]) => [key, (comment as string).trim()])
    );
  }

  private async adminFetch<T>(path: string, method: 'GET' | 'DELETE' = 'GET'): Promise<T | null> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      this.adminAuthed.set(false);
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        this.adminLogout();
        this.adminMessage.set('Session expired. Please sign in again.');
        return null;
      }

      if (!response.ok) {
        this.adminMessage.set(`Request failed (${response.status}).`);
        return null;
      }

      if (response.status === 204 || method === 'DELETE') {
        return undefined as T;
      }

      return await response.json() as T;
    } catch {
      this.adminMessage.set(`Could not reach the API. Is it running on ${API_BASE}?`);
      return null;
    }
  }

  private toggleSelection(selection: WritableSignal<string[]>, value: string, event: Event, maxSelections?: number): void {
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

  private validateUserStep(): boolean {
    const message = this.getUserStepValidationMessage();
    this.userValidationMessage.set(message);
    if (message) {
      this.focusInvalidField();
    }
    return !message;
  }

  private getUserStepValidationMessage(): string {
    switch (this.userStep()) {
      case 0:
        return !this.userProfile() || !this.userPrimaryCategory()
          ? 'Choose where you are right now and which area calls to you most.'
          : '';
      case 1:
        return !this.userMoveBarrier() || !this.userFeelBarrier() || !this.userSeekBarrier()
          ? 'Choose one barrier for Move, Feel, and Seek before continuing.'
          : '';
      case 2:
        return this.userExperiences().length ? '' : 'Pick at least one thing you have tried so far.';
      case 3:
        return this.userProblems().length ? '' : 'Pick at least one place where you get stuck.';
      case 4:
        if (!this.userWouldUse()) {
          return 'Choose whether you would use this kind of companion.';
        }
        return this.userFeatures().length ? '' : 'Pick at least one thing that would actually help.';
      case 5:
        if (!this.userDiscovery().length) {
          return 'Pick at least one place where you usually look today.';
        }
        if (!this.userConversation()) {
          return 'Choose whether you are open to a short conversation.';
        }
        if (!this.waitlistName().trim()) {
          this.invalidField.set('waitlistName');
          return 'Add your name before submitting.';
        }
        if (!this.userContact().trim()) {
          this.invalidField.set('userContact');
          return 'Add your email or phone before submitting.';
        }
        this.invalidField.set('');
        return '';
      default:
        this.invalidField.set('');
        return '';
    }
  }

  private validateProviderStep(): boolean {
    const message = this.getProviderStepValidationMessage();
    this.providerValidationMessage.set(message);
    if (message) {
      this.focusInvalidField();
    }
    return !message;
  }

  private getProviderStepValidationMessage(): string {
    switch (this.providerStep()) {
      case 0:
        return !this.providerType() || !this.providerBookingTools()
          ? 'Choose what you do and whether you currently use booking or client tools.'
          : '';
      case 1:
        return this.providerExperiences().length ? '' : 'Pick at least one thing you offer.';
      case 2:
        return this.providerPromotion().length ? '' : 'Pick at least one way people find you today.';
      case 3:
        return this.providerChallenges().length ? '' : 'Pick at least one current challenge.';
      case 4:
        if (!this.providerWouldList()) {
          return 'Choose whether you would be open to this kind of platform.';
        }
        if (!this.providerValue().length) {
          return 'Pick at least one thing that would make it valuable.';
        }
        return this.providerPricing() ? '' : 'Choose the pricing model that feels closest.';
      case 5:
        if (!this.providerPilot() || !this.providerFirstEvent()) {
          return 'Choose your pilot interest and first-event interest.';
        }
        if (!this.waitlistName().trim()) {
          this.invalidField.set('providerName');
          return 'Add your name before submitting.';
        }
        if (!this.providerContact().trim()) {
          this.invalidField.set('providerContact');
          return 'Add your email or phone before submitting.';
        }
        this.invalidField.set('');
        return '';
      default:
        this.invalidField.set('');
        return '';
    }
  }

  private focusInvalidField(): void {
    const field = this.invalidField();
    if (!field) {
      return;
    }

    setTimeout(() => {
      const control = document.querySelector<HTMLElement>(`[data-field="${field}"]`);
      control?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      control?.focus();
    });
  }

  private async saveMarketFitSubmission(payload: Record<string, unknown>): Promise<void> {
    const key = 'within.marketFitSubmissions';
    const submission = {
      ...payload,
      createdUtc: new Date().toISOString(),
      source: 'landing-page',
    };

    try {
      const response = await fetch(`${API_BASE}/market-fit/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience: payload['audience'],
          name: payload['name'],
          contact: payload['contact'],
          source: 'landing-page',
          answers: payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      this.submissionMessage.set('Response submited successfully. Thank you!');
      return;
    } catch {
      this.submissionMessage.set('Error in saving submission. Saving locally instead.');
    }

    const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as Record<string, unknown>[];
    existing.push(submission);
    localStorage.setItem(key, JSON.stringify(existing));
  }
}
