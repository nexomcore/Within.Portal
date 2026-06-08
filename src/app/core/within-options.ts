import { AdminProviderFilter, Option, ProviderCategory, ProviderPriceType, ProviderServiceDeliveryMode, ProviderType, WithinLens } from './within.models';

export const unifiedProviderTypeOptions: Option<ProviderType>[] = [
  { value: 'Individual', label: 'Individual Practitioner' },
  { value: 'Business', label: 'Business / Organization' },
];

export const providerPriceTypeOptions: Option<ProviderPriceType>[] = [
  { value: 'Free', label: 'Free' },
  { value: 'Fixed', label: 'Fixed price' },
  { value: 'FromPrice', label: 'From price' },
  { value: 'ContactProvider', label: 'Contact provider' },
];

export const providerServiceDeliveryModeOptions: Option<ProviderServiceDeliveryMode>[] = [
  { value: 'InPerson', label: 'In person' },
  { value: 'Online', label: 'Online' },
  { value: 'Hybrid', label: 'Hybrid' },
];

export const providerCategoryOptions: Option<ProviderCategory>[] = [
  { value: 'BusinessStudio', label: 'Business / Studio' },
  { value: 'IndividualPractitioner', label: 'Individual Practitioner' },
  { value: 'CollectiveCommunityGroup', label: 'Collective / Community Group' },
  { value: 'RetreatProgramOrganiser', label: 'Retreat / Program Organiser' },
  { value: 'VenueSpacePartner', label: 'Venue / Space Partner' },
  { value: 'CorporateWorkplaceWellness', label: 'Corporate / Workplace Wellness' },
];

export const lensOptions: WithinLens[] = ['Move', 'Feel', 'Seek'];

export const providerStatusFilters: Option<AdminProviderFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'InReview', label: 'In review' },
  { value: 'MoreInfoRequested', label: 'More info' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

export const deliveryModeOptions = ['In person', 'Online', 'Hybrid', 'Mobile / pop-up'];

export const serviceAreaOptions = [
  'Move: fitness, yoga, pilates, hiking, running, strength, mobility',
  'Feel: mindfulness, counselling, therapy-adjacent support, stress reduction, coaching',
  'Seek: meditation, breathwork, spiritual practice, circles, retreats, meaning/purpose work',
];

export const onboardingServiceOptions = [
  'Classes',
  'Workshops',
  '1:1 sessions',
  'Group programs',
  'Retreats',
  'Corporate sessions',
  'Community circles',
  'Online sessions',
];

export const interestRoleOptions = [
  'Curious - tell me more',
  'I attend wellbeing experiences',
  'I host or run sessions',
  'I work in wellness / community',
  'Just keep me posted',
];

export const userStepTitles = ['About you', 'Your three areas', 'What you have tried', 'Where you get stuck', 'What would help', 'Contact'];
export const providerStepTitles = ['Provider type', 'Offerings', 'Promotion', 'Challenges', 'Platform fit', 'Pilot contact'];
export const onboardingStepTitles = ['Provider type', 'Basic details', 'Your setup', 'Services', 'Review'];

export const userProfileOptions = [
  'I have a consistent daily practice',
  'I dabble - practice on and off',
  'I am just starting out',
  'I am curious but have not started yet',
  'I tried, lost momentum, and want to come back',
];

export const categoryOptions = [
  'Move: my body, energy, movement',
  'Feel: my mood, stress, inner balance',
  'Seek: meaning, purpose, deeper growth',
  'A mix of all three',
];

export const moveBarrierOptions = ['Time and energy after work', 'Motivation when I am alone', 'I do not know where to start', 'I lose consistency', 'It starts to feel like a chore', 'Cost of classes or gyms', 'Injury, illness, or physical limits', 'Other'];
export const feelBarrierOptions = ['I do not know where to start', 'Stress spills into everything', 'I do not feel safe opening up', 'I do not get quiet time alone', 'Therapy feels too clinical or pricey', 'I cannot sit still long enough', 'I do not know what actually works for me', 'Other'];
export const seekBarrierOptions = ['I do not know what I believe', 'Spiritual spaces feel performative', 'I get curious but lose momentum', 'I do not know who to trust', 'I cannot find people on the same path', 'I feel I should already know', 'Too much content, not enough practice', 'Other'];

export const userExperienceOptions = ['Yoga / pilates / movement classes', 'Gym, strength, or cardio training', 'Walking, hiking, or outdoor sessions', 'Meditation or mindfulness', 'Breathwork', 'Journaling or reflective writing', 'Habit or routine tracking apps', 'Therapy or counselling', 'Coaching or mentoring', 'Workshops or short courses', 'Retreats', 'Sound, energy, or somatic work', 'Reading, podcasts, or online courses', 'Community circles or meetups', 'Religious or faith practice'];
export const discoveryOptions = ['Instagram', 'Facebook groups', 'Meetup', 'Google search', 'Eventbrite', 'Friends / word of mouth', 'Books, podcasts, or YouTube', 'Apps I already use', 'Local studios or gyms', 'WhatsApp groups', 'I do not really know where to look'];
export const userProblemOptions = ['I lose motivation when I am on my own', 'Tools feel scattered across apps and accounts', 'I cannot tell what is real and what is hype', 'I do not know where to start', 'I have no clear sense of progress', 'Too much content, too little practice', 'Hard to find people on the same path', 'I feel judged or out of place in these spaces', 'Pricing is opaque', 'It feels overwhelming to commit'];
export const wouldUseOptions = ['Yes, definitely', 'Maybe, depends on what is in it', 'Maybe, depends on price', 'Not sure', 'No'];
export const userFeatureOptions = ['A calmer place to find practices and people', 'Trusted teachers and guides in one place', 'Daily reflection or journaling prompts', 'A simple way to build small habits', 'See how I am doing across body, mind, and meaning', 'Beginner-friendly paths in each area', 'Small community circles', 'Local events and gatherings', 'Retreats and deeper experiences', 'Private notes only I can see', 'A weekly nudge that is not noise', 'Help finding what is right for me'];

export const providerTypeOptions = ['Yoga or movement teacher', 'Meditation or mindfulness teacher', 'Fitness trainer', 'Breathwork facilitator', 'Sound or somatic practitioner', 'Therapist or counsellor', 'Life or mindset coach', 'Wellness or habits coach', 'Retreat organiser', 'Spiritual practitioner', 'Community circle host', 'Studio or business owner', 'Other guide / practitioner'];
export const providerExperienceOptions = ['Drop-in classes', 'Workshops', '1:1 sessions', 'Group sessions', 'Ongoing programs or courses', 'Coaching journeys', 'Retreats', 'Online sessions', 'Community circles or meetups', 'Corporate wellbeing sessions'];
export const providerPromotionOptions = ['Instagram', 'Facebook', 'Facebook groups', 'Meetup', 'Eventbrite', 'Google Business Profile', 'Website', 'Email list', 'Word of mouth', 'Paid ads', 'Studio partnerships'];
export const providerChallengeOptions = ['Getting discovered by the right people', 'Filling sessions or programs consistently', 'Building trust with someone before they commit', 'Keeping people engaged across a journey, not just one session', 'Managing bookings and payments', 'Communicating with people between sessions', 'Standing out from louder marketing', 'Helping people see their own progress', 'Admin work eating into the actual practice', 'Promoting retreats or longer programs'];
export const providerValueOptions = ['Reach people genuinely on a growth path', 'Be found by the right people, not everyone', 'Easy way to share what I offer', 'Help people see their progress with me', 'Support people between sessions', 'A trusted, verified guide profile', 'Reviews from people who actually showed up', 'Payment and booking handled simply', 'Promote retreats and longer programs', 'Corporate or community partnerships', 'A calmer place than social media to be found'];
export const pricingOptions = ['Free listing with commission per booking', 'Monthly subscription', 'Free basic plan + paid premium features', 'One-time event promotion fee', 'Not sure', 'I would only use it if free'];

