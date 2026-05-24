import { Component, OnInit, computed, signal } from '@angular/core';

type Pillar = 'Move' | 'Feel' | 'Seek';

interface Attendee {
  name: string;
  initials: string;
}

interface WithinEvent {
  id: number;
  pillar: Pillar;
  title: string;
  dateTime: string;
  location: string;
  host: string;
  joined: number;
  price: string;
  description: string;
  audience: string;
  bring: string;
  tag: string;
  attendeePreview: Attendee[];
}

interface Community {
  id: number;
  pillar: Pillar;
  name: string;
  description: string;
  members: number;
}

const pillarCopy: Record<Pillar, { intro: string; tone: string }> = {
  Move: {
    intro: 'Find experiences that energise your body, build strength, and connect you through movement.',
    tone: 'Fresh movement, outdoor rhythm, grounded vitality',
  },
  Feel: {
    intro: 'Explore safe spaces for reflection, emotional balance, mindfulness, and meaningful connection.',
    tone: 'Soft reflection, emotional clarity, shared support',
  },
  Seek: {
    intro: 'Discover spiritual experiences, retreats, meditation circles, and journeys into deeper purpose.',
    tone: 'Inner growth, ritual, purpose, expansive connection',
  },
};

const events: WithinEvent[] = [
  {
    id: 1,
    pillar: 'Move',
    title: 'Sunrise Yoga by the River',
    dateTime: 'Sunday, 7:00 AM',
    location: 'South Perth Foreshore',
    host: 'Anaya Yoga',
    joined: 24,
    price: 'Free',
    tag: 'Outdoor yoga',
    description:
      'Start your morning with a gentle outdoor yoga flow designed to awaken the body, calm the mind, and connect with community.',
    audience: 'Beginners, regular yoga practitioners, and anyone looking for a peaceful start to the day.',
    bring: 'Yoga mat, water bottle, towel, and comfortable clothing.',
    attendeePreview: [
      { name: 'Mia', initials: 'MI' },
      { name: 'Leo', initials: 'LE' },
      { name: 'Ari', initials: 'AR' },
    ],
  },
  {
    id: 2,
    pillar: 'Move',
    title: 'Community Run Club',
    dateTime: 'Wednesday, 6:15 PM',
    location: 'Elizabeth Quay',
    host: 'Perth Morning Movers',
    joined: 38,
    price: 'Free',
    tag: 'Run club',
    description: 'A relaxed social run for all levels with warm-up mobility, two distance options, and coffee after.',
    audience: 'New runners, returning runners, and anyone who likes moving with a group.',
    bring: 'Running shoes, water, and a light layer.',
    attendeePreview: [
      { name: 'Sam', initials: 'SA' },
      { name: 'Nora', initials: 'NO' },
      { name: 'Jay', initials: 'JA' },
    ],
  },
  {
    id: 3,
    pillar: 'Move',
    title: 'Strength & Mobility Workshop',
    dateTime: 'Saturday, 10:30 AM',
    location: 'Northbridge Studio',
    host: 'Kai Movement Lab',
    joined: 18,
    price: '$18',
    tag: 'Workshop',
    description: 'Build practical strength and range with a guided class blending mobility drills and slow conditioning.',
    audience: 'People wanting stronger joints, better posture, and more confidence in everyday movement.',
    bring: 'Training clothes, water bottle, and a small towel.',
    attendeePreview: [
      { name: 'Taj', initials: 'TA' },
      { name: 'Elena', initials: 'EL' },
      { name: 'Kim', initials: 'KI' },
    ],
  },
  {
    id: 4,
    pillar: 'Move',
    title: 'Weekend Hiking Circle',
    dateTime: 'Saturday, 8:00 AM',
    location: 'Lesmurdie Falls',
    host: 'Trail & Breath',
    joined: 31,
    price: '$12',
    tag: 'Nature walk',
    description: 'A mindful group hike with quiet trail moments, light breathwork, and a shared lookout pause.',
    audience: 'Nature lovers and beginners comfortable with a moderate trail.',
    bring: 'Walking shoes, sun protection, water, and snacks.',
    attendeePreview: [
      { name: 'Ash', initials: 'AS' },
      { name: 'Priya', initials: 'PR' },
      { name: 'Ben', initials: 'BE' },
    ],
  },
  {
    id: 5,
    pillar: 'Move',
    title: 'Beginner Pilates Flow',
    dateTime: 'Monday, 5:45 PM',
    location: 'Online',
    host: 'Luna Core Studio',
    joined: 22,
    price: '$9',
    tag: 'Pilates',
    description: 'A low-pressure mat Pilates class focused on core awareness, breathing, and steady alignment.',
    audience: 'Beginners and anyone returning to movement after a break.',
    bring: 'Mat, quiet floor space, and water.',
    attendeePreview: [
      { name: 'Ivy', initials: 'IV' },
      { name: 'Max', initials: 'MA' },
      { name: 'Zoe', initials: 'ZO' },
    ],
  },
  {
    id: 6,
    pillar: 'Feel',
    title: 'Guided Journaling Circle',
    dateTime: 'Thursday, 7:00 PM',
    location: 'Subiaco Commons',
    host: 'Mindful Living Circle',
    joined: 16,
    price: '$14',
    tag: 'Reflection',
    description: 'A gentle writing circle with prompts for self-awareness, emotional release, and shared reflection.',
    audience: 'Anyone wanting a calm space to process, write, and reconnect with themselves.',
    bring: 'Journal, pen, and an open mind.',
    attendeePreview: [
      { name: 'Mae', initials: 'MA' },
      { name: 'Olive', initials: 'OL' },
      { name: 'Ren', initials: 'RE' },
    ],
  },
  {
    id: 7,
    pillar: 'Feel',
    title: 'Stress Reset Workshop',
    dateTime: 'Tuesday, 6:30 PM',
    location: 'Online',
    host: 'Clara Wells',
    joined: 44,
    price: '$11',
    tag: 'Stress relief',
    description: 'Learn practical nervous-system tools for softening stress, restoring focus, and ending the day well.',
    audience: 'Busy people seeking simple practices for calm and emotional steadiness.',
    bring: 'Notebook, headphones, and a quiet space.',
    attendeePreview: [
      { name: 'Ana', initials: 'AN' },
      { name: 'Dev', initials: 'DE' },
      { name: 'Lu', initials: 'LU' },
    ],
  },
  {
    id: 8,
    pillar: 'Feel',
    title: 'Breathwork for Calm',
    dateTime: 'Friday, 12:30 PM',
    location: 'Kings Park Studio',
    host: 'Breathwork & Balance Circle',
    joined: 27,
    price: '$16',
    tag: 'Breathwork',
    description: 'A restorative breathwork session for grounding the body and creating more emotional space.',
    audience: 'People wanting a supported reset without intensity.',
    bring: 'Comfortable clothing, water, and a light blanket.',
    attendeePreview: [
      { name: 'Noa', initials: 'NO' },
      { name: 'Eli', initials: 'EL' },
      { name: 'Tia', initials: 'TI' },
    ],
  },
  {
    id: 9,
    pillar: 'Feel',
    title: 'Mindful Tea Gathering',
    dateTime: 'Sunday, 3:00 PM',
    location: 'Fremantle Tea House',
    host: 'Sora Tea Practice',
    joined: 19,
    price: '$20',
    tag: 'Mindfulness',
    description: 'A slow tea ceremony and conversation circle for presence, listening, and gentle connection.',
    audience: 'Anyone seeking a quiet social space with mindful ritual.',
    bring: 'Comfortable layers and curiosity.',
    attendeePreview: [
      { name: 'Gia', initials: 'GI' },
      { name: 'Ali', initials: 'AL' },
      { name: 'Mika', initials: 'MI' },
    ],
  },
  {
    id: 10,
    pillar: 'Feel',
    title: 'Emotional Balance Group Session',
    dateTime: 'Monday, 7:15 PM',
    location: 'Leederville Wellness Room',
    host: 'Dr. Eva Rowan',
    joined: 13,
    price: '$22',
    tag: 'Support circle',
    description: 'A facilitated group session exploring emotional patterns, self-compassion, and everyday grounding.',
    audience: 'People wanting guided support in a small, respectful group.',
    bring: 'Notebook and comfortable clothing.',
    attendeePreview: [
      { name: 'Rae', initials: 'RA' },
      { name: 'Sol', initials: 'SO' },
      { name: 'Nina', initials: 'NI' },
    ],
  },
  {
    id: 11,
    pillar: 'Seek',
    title: 'Full Moon Meditation Circle',
    dateTime: 'Friday, 8:00 PM',
    location: 'Cottesloe Beach',
    host: 'Seekers Meditation Group',
    joined: 36,
    price: '$10',
    tag: 'Meditation',
    description: 'A moonlit meditation circle with intention setting, stillness, and gentle group reflection.',
    audience: 'Meditators, curious beginners, and anyone drawn to reflective ritual.',
    bring: 'Warm layer, mat or towel, and water.',
    attendeePreview: [
      { name: 'Indi', initials: 'IN' },
      { name: 'Uma', initials: 'UM' },
      { name: 'Sky', initials: 'SK' },
    ],
  },
  {
    id: 12,
    pillar: 'Seek',
    title: 'Inner Purpose Workshop',
    dateTime: 'Saturday, 1:00 PM',
    location: 'Mount Lawley Hall',
    host: 'Amara Field',
    joined: 21,
    price: '$28',
    tag: 'Purpose',
    description: 'A guided workshop using reflection, values mapping, and group insight to reconnect with direction.',
    audience: 'People navigating change, seeking clarity, or exploring a deeper sense of purpose.',
    bring: 'Journal, pen, and anything that helps you feel grounded.',
    attendeePreview: [
      { name: 'Rue', initials: 'RU' },
      { name: 'Omi', initials: 'OM' },
      { name: 'Lia', initials: 'LI' },
    ],
  },
  {
    id: 13,
    pillar: 'Seek',
    title: 'Weekend Spiritual Retreat',
    dateTime: 'Next Saturday, 9:00 AM',
    location: 'Margaret River',
    host: 'Within Retreats',
    joined: 12,
    price: '$120',
    tag: 'Retreat',
    description: 'A day retreat with meditation, nature practice, reflective exercises, and nourishing community time.',
    audience: 'Anyone ready for a deeper pause and a full-day guided reset.',
    bring: 'Comfortable clothing, journal, water bottle, and walking shoes.',
    attendeePreview: [
      { name: 'Aya', initials: 'AY' },
      { name: 'Mo', initials: 'MO' },
      { name: 'Cass', initials: 'CA' },
    ],
  },
  {
    id: 14,
    pillar: 'Seek',
    title: 'Energy Healing Gathering',
    dateTime: 'Wednesday, 7:30 PM',
    location: 'Online',
    host: 'Nadia Bloom',
    joined: 29,
    price: '$18',
    tag: 'Healing circle',
    description: 'A calm group healing session with guided relaxation, intention work, and reflective integration.',
    audience: 'People curious about subtle healing practices in a grounded, welcoming format.',
    bring: 'Headphones, blanket, water, and a quiet room.',
    attendeePreview: [
      { name: 'Ira', initials: 'IR' },
      { name: 'Jun', initials: 'JU' },
      { name: 'Elle', initials: 'EL' },
    ],
  },
  {
    id: 15,
    pillar: 'Seek',
    title: 'Nature Connection Journey',
    dateTime: 'Sunday, 9:30 AM',
    location: 'Bold Park',
    host: 'Earth Path Collective',
    joined: 25,
    price: '$15',
    tag: 'Nature ritual',
    description: 'A guided nature immersion with walking meditation, sensory awareness, and quiet connection practices.',
    audience: 'People wanting to feel more connected to place, self, and the natural world.',
    bring: 'Walking shoes, hat, water, and a small notebook.',
    attendeePreview: [
      { name: 'Kai', initials: 'KA' },
      { name: 'Mara', initials: 'MR' },
      { name: 'Lux', initials: 'LU' },
    ],
  },
];

const communities: Community[] = [
  { id: 1, pillar: 'Move', name: 'Perth Morning Movers', description: 'Social runs, yoga, mobility, and weekend outdoor movement.', members: 428 },
  { id: 2, pillar: 'Move', name: 'Weekend Wellness Community', description: 'Active local meetups for building strength and friendship.', members: 302 },
  { id: 3, pillar: 'Feel', name: 'Mindful Living Circle', description: 'Reflection circles, mindfulness workshops, and gentle support spaces.', members: 516 },
  { id: 4, pillar: 'Feel', name: 'Breathwork & Balance Circle', description: 'Breathing practices and emotional reset sessions for everyday calm.', members: 271 },
  { id: 5, pillar: 'Seek', name: 'Seekers Meditation Group', description: 'Meditation, retreats, ritual circles, and inner growth journeys.', members: 389 },
  { id: 6, pillar: 'Seek', name: 'Earth Path Collective', description: 'Nature connection, purpose work, and spiritual practice outdoors.', members: 244 },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  readonly pillars: Pillar[] = ['Move', 'Feel', 'Seek'];
  readonly pillarCopy = pillarCopy;

  readonly showSplash = signal(true);
  readonly currentView = signal<'home' | 'events'>('home');
  readonly selectedPillar = signal<Pillar>('Move');
  readonly selectedEvent = signal<WithinEvent | null>(null);
  readonly joinedEventIds = signal<Set<number>>(new Set());
  readonly searchQuery = signal('');

  readonly filteredEvents = computed(() => {
    const query = this.normalizedQuery();
    return events.filter((event) => event.pillar === this.selectedPillar() && this.matchesEvent(event, query));
  });

  readonly filteredCommunities = computed(() => {
    const query = this.normalizedQuery();
    return communities.filter(
      (community) =>
        community.pillar === this.selectedPillar() &&
        (!query || `${community.name} ${community.description}`.toLowerCase().includes(query)),
    );
  });

  ngOnInit(): void {
    window.setTimeout(() => this.dismissSplash(), 1450);
  }

  dismissSplash(): void {
    this.showSplash.set(false);
  }

  selectPillar(pillar: Pillar): void {
    this.selectedPillar.set(pillar);
    this.selectedEvent.set(null);
  }

  openPillarEvents(pillar: Pillar): void {
    this.selectPillar(pillar);
    this.currentView.set('events');
  }

  goHome(): void {
    this.selectedEvent.set(null);
    this.currentView.set('home');
  }

  updateSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  openEvent(event: WithinEvent): void {
    this.selectedEvent.set(event);
  }

  closeEvent(): void {
    this.selectedEvent.set(null);
  }

  joinEvent(eventId: number): void {
    this.joinedEventIds.update((current) => {
      const next = new Set(current);
      next.add(eventId);
      return next;
    });
  }

  isJoined(eventId: number): boolean {
    return this.joinedEventIds().has(eventId);
  }

  joinedCount(event: WithinEvent): number {
    return event.joined + (this.isJoined(event.id) ? 1 : 0);
  }

  private normalizedQuery(): string {
    return this.searchQuery().trim().toLowerCase();
  }

  private matchesEvent(event: WithinEvent, query: string): boolean {
    if (!query) {
      return true;
    }

    return [
      event.title,
      event.pillar,
      event.dateTime,
      event.location,
      event.host,
      event.price,
      event.tag,
      event.description,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  }
}
