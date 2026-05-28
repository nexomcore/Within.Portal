import { CommonModule } from '@angular/common';
import { Component, HostListener, WritableSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SurveyAudience = 'user' | 'provider';
type PageMode = 'landing' | 'user-survey' | 'provider-survey' | 'conversation-guide';

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
  protected readonly waitlistName = signal('');
  protected readonly waitlistEmail = signal('');
  protected readonly waitlistRole = signal('Early user');

  protected readonly userProfile = signal('I attend occasionally');
  protected readonly userExperiences = signal<string[]>([]);
  protected readonly userDiscovery = signal<string[]>([]);
  protected readonly userProblems = signal<string[]>([]);
  protected readonly userLastAttended = signal('Within the last month');
  protected readonly userPrimaryCategory = signal('A mix of all three');
  protected readonly userWouldUse = signal('Maybe, depends on the events');
  protected readonly userFeatures = signal<string[]>([]);
  protected readonly userConversation = signal('Maybe');
  protected readonly userContact = signal('');
  protected readonly userWish = signal('');

  protected readonly providerType = signal('Yoga teacher');
  protected readonly providerExperiences = signal<string[]>([]);
  protected readonly providerPromotion = signal<string[]>([]);
  protected readonly providerChallenges = signal<string[]>([]);
  protected readonly providerBookingTools = signal('Sometimes');
  protected readonly providerWouldList = signal('Maybe, if it brings new customers');
  protected readonly providerValue = signal<string[]>([]);
  protected readonly providerPricing = signal('Free basic plan + paid premium features');
  protected readonly providerPilot = signal('Maybe');
  protected readonly providerFirstEvent = signal('Maybe');
  protected readonly providerBusinessName = signal('');
  protected readonly providerContact = signal('');
  protected readonly providerLink = signal('');
  protected readonly providerBlocker = signal('');

  protected readonly pillars = [
    {
      name: 'Move',
      label: 'Body in motion',
      description: 'Fitness, yoga, pilates, mobility, walking groups, and active experiences that support vitality.',
      accent: 'move',
    },
    {
      name: 'Feel',
      label: 'Presence and awareness',
      description: 'Meditation, breathwork, reflection, emotional wellbeing, and gentle practices for stress relief.',
      accent: 'feel',
    },
    {
      name: 'Seek',
      label: 'Growth and meaning',
      description: 'Retreats, mindfulness, purpose-led sessions, spiritual exploration, and personal growth.',
      accent: 'seek',
    },
  ];

  protected readonly features = [
    {
      category: 'Discover',
      title: 'Perth-first wellbeing discovery',
      detail: 'Bring scattered classes, workshops, retreats, and community experiences into one calm place.',
    },
    {
      category: 'Trust',
      title: 'Clear host and event context',
      detail: 'Prioritise verified providers, clear pricing, beginner-friendly signals, and practical details.',
    },
    {
      category: 'Pilot',
      title: 'Early access built from real demand',
      detail: 'Separate attendee and provider surveys help shape the first useful version of Within.',
    },
  ];

  protected readonly providerPoints = [
    'Share events, workshops, circles, retreats, or programs',
    'Reach people already looking for wellbeing experiences',
    'Test listing intent before paid marketplace features',
    'Join the early Perth provider pilot',
  ];

  protected readonly surveyStats = [
    { value: '2-3 min', label: 'short survey' },
    { value: 'Perth', label: 'first pilot' },
    { value: 'Move / Feel / Seek', label: 'clear signal' },
  ];

  protected readonly userProfileOptions = [
    'I regularly attend wellbeing/fitness/spiritual events',
    'I attend occasionally',
    'I am interested but have not started yet',
    'I am just curious',
    'Not interested currently',
  ];

  protected readonly userExperienceOptions = [
    'Yoga',
    'Meditation',
    'Fitness classes',
    'Breathwork',
    'Sound healing',
    'Spiritual workshops',
    'Retreats',
    'Nature walks / outdoor wellbeing',
    'Community meetups',
    'Mental/emotional wellbeing sessions',
    'Life coaching / mindset sessions',
  ];

  protected readonly discoveryOptions = [
    'Instagram',
    'Facebook groups',
    'Meetup',
    'Google search',
    'Eventbrite',
    'Friends / word of mouth',
    'Local gyms or studios',
    'WhatsApp groups',
    'I do not know where to find them',
  ];

  protected readonly userProblemOptions = [
    'Hard to find good events in one place',
    'I do not know which providers to trust',
    'Too much scattered information',
    'Events are not beginner-friendly',
    'Pricing is unclear',
    'Booking process is annoying',
    'I do not want to attend alone',
    'I do not know what is right for me',
    'Events are too expensive',
  ];

  protected readonly lastAttendedOptions = [
    'Within the last week',
    'Within the last month',
    'Within the last 3 months',
    'Within the last 6 months',
    'More than 6 months ago',
    'Never',
  ];

  protected readonly categoryOptions = [
    'Move: fitness, yoga, physical wellbeing',
    'Feel: emotional wellbeing, mindfulness, stress relief',
    'Seek: spirituality, retreats, deeper growth',
    'A mix of all three',
  ];

  protected readonly wouldUseOptions = [
    'Yes, definitely',
    'Maybe, depends on the events',
    'Maybe, depends on price',
    'Not sure',
    'No',
  ];

  protected readonly userFeatureOptions = [
    'Browse local events',
    'Book and pay in one place',
    'Save favourite events',
    'Follow providers',
    'See beginner-friendly events',
    'Join with friends',
    'Retreat discovery',
    'Personal wellbeing dashboard',
    'Reviews and ratings',
    'Event reminders',
  ];

  protected readonly providerTypeOptions = [
    'Yoga teacher',
    'Meditation teacher',
    'Fitness trainer',
    'Breathwork facilitator',
    'Sound healer',
    'Life coach',
    'Mindset coach',
    'Wellness coach',
    'Retreat organiser',
    'Spiritual practitioner',
    'Community event organiser',
    'Studio / business owner',
  ];

  protected readonly providerExperienceOptions = [
    'Classes',
    'Workshops',
    '1:1 sessions',
    'Group sessions',
    'Retreats',
    'Online sessions',
    'Corporate wellbeing sessions',
    'Community meetups',
    'Courses/programs',
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
    'Getting discovered by new people',
    'Filling events/classes',
    'Managing bookings',
    'Managing payments',
    'Communicating with attendees',
    'Building trust',
    'Standing out from other providers',
    'Retaining customers',
    'Promoting retreats/workshops',
    'Admin work',
  ];

  protected readonly providerValueOptions = [
    'More bookings',
    'Better discovery',
    'Easy event creation',
    'Payment collection',
    'Provider profile page',
    'Reviews and ratings',
    'Verified provider badge',
    'Marketing support',
    'Analytics/dashboard',
    'Repeat customer management',
    'Retreat promotion',
    'Corporate client leads',
  ];

  protected readonly pricingOptions = [
    'Free listing with commission per booking',
    'Monthly subscription',
    'Free basic plan + paid premium features',
    'One-time event promotion fee',
    'Not sure',
    'I would only use it if free',
  ];

  @HostListener('window:popstate')
  protected onPopState(): void {
    this.pageMode.set(this.getPageMode());
  }

  protected navigate(path: string): void {
    history.pushState(null, '', path);
    this.pageMode.set(this.getPageMode());
    this.activeSurvey.set(path.includes('provider') ? 'provider' : 'user');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected chooseSurvey(audience: SurveyAudience): void {
    this.activeSurvey.set(audience);
    this.surveySubmitted.set(null);
    this.navigate(audience === 'provider' ? '/survey/provider' : '/survey/user');
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

  protected submitUserSurvey(): void {
    if (!this.waitlistName().trim() || !this.userContact().trim()) {
      return;
    }

    this.saveMarketFitSubmission({
      audience: 'user',
      name: this.waitlistName().trim(),
      contact: this.userContact().trim(),
      profile: this.userProfile(),
      experiences: this.userExperiences(),
      discovery: this.userDiscovery(),
      problems: this.userProblems(),
      lastAttended: this.userLastAttended(),
      primaryCategory: this.userPrimaryCategory(),
      wouldUse: this.userWouldUse(),
      features: this.userFeatures(),
      openToConversation: this.userConversation(),
      wish: this.userWish().trim(),
    });
    this.waitlistEmail.set(this.userContact());
    this.waitlistRole.set('Early user');
    this.surveySubmitted.set('user');
  }

  protected submitProviderSurvey(): void {
    if (!this.waitlistName().trim() || !this.providerContact().trim()) {
      return;
    }

    this.saveMarketFitSubmission({
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
    });
    this.waitlistEmail.set(this.providerContact());
    this.waitlistRole.set('Provider');
    this.surveySubmitted.set('provider');
  }

  private getPageMode(): PageMode {
    const path = window.location.pathname;
    if (path === '/survey/user') return 'user-survey';
    if (path === '/survey/provider') return 'provider-survey';
    if (path === '/internal/conversation-guide') return 'conversation-guide';
    return 'landing';
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

  private saveMarketFitSubmission(payload: Record<string, unknown>): void {
    const key = 'within.marketFitSubmissions';
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as Record<string, unknown>[];
    existing.push({
      ...payload,
      createdUtc: new Date().toISOString(),
      source: 'landing-page',
    });
    localStorage.setItem(key, JSON.stringify(existing));
  }
}
