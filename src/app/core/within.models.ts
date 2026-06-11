export type SurveyAudience = 'user' | 'provider';
export type AdminAudienceFilter = 'all' | 'user' | 'provider' | 'interest';
export type ProviderApplicationStatus = 'Submitted' | 'InReview' | 'MoreInfoRequested' | 'Approved' | 'Rejected';
export type ProviderCategory = 'BusinessStudio' | 'IndividualPractitioner' | 'CollectiveCommunityGroup' | 'RetreatProgramOrganiser' | 'VenueSpacePartner' | 'CorporateWorkplaceWellness';
export type ProviderType = 'Individual' | 'Business';
export type ProviderVerificationStatus = 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
export type ProviderPriceType = 'Free' | 'Fixed' | 'FromPrice' | 'ContactProvider';
export type ProviderServiceDeliveryMode = 'InPerson' | 'Online' | 'Hybrid';
export type WithinLens = 'Move' | 'Feel' | 'Seek';
export type AdminProviderFilter = 'all' | ProviderApplicationStatus;
export type WithinRole = 'User' | 'Provider' | 'Admin';
export type SignupType = 'Internal' | 'External';
export type EventStatus = 'Draft' | 'Published' | 'Cancelled';
export type EventJoinState = 'Interested' | 'Going' | 'Attended' | 'Declined';
export type EventIntensity = 'low' | 'medium' | 'high';
export type EventExperienceLevel = 'beginner_friendly' | 'some_experience_recommended' | 'experienced_participants_only';
export type EventAgeRestriction = 'all_ages' | '13_plus' | '16_plus' | '18_plus' | 'seniors_focused' | 'family_kids_friendly';
export type EventType = 'class' | 'workshop' | 'meetup' | 'meditation' | 'yoga' | 'fitness' | 'sound_healing' | 'hiking' | 'retreat' | 'festival' | 'other';
export type RetreatFocus = 'meditation' | 'yoga' | 'spiritual' | 'wellness' | 'fitness' | 'detox' | 'mens_retreat' | 'womens_retreat' | 'corporate_wellness' | 'nature' | 'mindfulness';
export type RetreatDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type CommunityPostType = 'AskCommunity' | 'ShareExperience' | 'FindBuddy' | 'LocalRecommendation' | 'Reflection';
export type CommunityContentStatus = 'Active' | 'Hidden' | 'Removed' | 'UnderReview';
export type CommunityReportReason = 'SpamOrPromotion' | 'HarassmentOrAbuse' | 'MedicalMisinformation' | 'InappropriateContent' | 'SafetyConcern' | 'Other';
export type CommunityReportStatus = 'Pending' | 'Reviewed' | 'ActionTaken' | 'Dismissed';

export interface AdminSubmission {
  id: string;
  audience: string;
  name: string;
  contact: string;
  source: string;
  answers: Record<string, unknown>;
  createdUtc: string;
}

export interface AdminStats {
  totalSubmissions: number;
  userSubmissions: number;
  providerSubmissions: number;
  totalUsers: number;
  providerUsers: number;
  adminUsers: number;
  latestSubmissionUtc: string | null;
}

export interface AdminUserRecord {
  id: string;
  displayName: string;
  email: string;
  role: WithinRole;
  createdUtc: string;
}

export interface AdminAnswerEntry {
  key: string;
  value: string;
  comment: string;
}

export interface ProviderApplication {
  id: string;
  status: ProviderApplicationStatus;
  providerType: ProviderType;
  providerCategory: ProviderCategory;
  primaryLens: WithinLens;
  serviceAreas: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  preferredContactMethod: string;
  providerName: string;
  businessType: string;
  abn: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  otherSocialUrl: string | null;
  location: string;
  deliveryModes: string[];
  venueNames: string | null;
  servicesOffered: string[];
  yearsPracticing: string;
  typicalAudience: string;
  bio: string;
  joinReason: string;
  certifications: string;
  insuranceStatus: string;
  workingWithChildrenCheck: string;
  firstAidCpr: string;
  professionalMemberships: string | null;
  credentialLinks: string | null;
  hasEventsReady: string;
  expectedFirstEvent: string;
  bookingTools: string;
  adminFacingNotes: string | null;
  declarationAccepted: boolean;
  adminNotes: string;
  reviewDecisionReason: string;
  submittedUtc: string;
  updatedUtc: string;
  reviewedUtc: string | null;
  approvedProviderId: string | null;
  temporaryPassword?: string | null;
}

export interface ProviderApplicationEntry {
  key: string;
  value: string;
}

export interface UserSummary {
  id: string;
  displayName: string;
  email: string;
  role: WithinRole;
  preferredLens: WithinLens;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSummary;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  providerType: ProviderType;
  legalName: string | null;
  bio: string;
  lens: WithinLens;
  categories: string[];
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  location: string;
  suburb: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  phone: string | null;
  email: string | null;
  isVerified: boolean;
  verificationStatus: ProviderVerificationStatus;
  isActive: boolean;
  showEmailPublicly: boolean;
  showPhonePublicly: boolean;
  showWebsitePublicly: boolean;
  practitionerTitle: string | null;
  yearsExperience: number | null;
  qualifications: string | null;
  servicesOffered: string[];
  languages: string[];
  onlineAvailable: boolean;
  inPersonAvailable: boolean;
  businessType: string | null;
  abn: string | null;
  facilities: string[];
  accessibilityFeatures: string[];
  teamMembers: string[];
  openingHours: string | null;
  serviceCount: number;
  createdUtc: string;
  updatedUtc: string;
}

export interface ProviderSummary {
  id: string;
  name: string;
  providerType: ProviderType;
  lens: WithinLens;
  location: string;
  isVerified: boolean;
  verificationStatus: ProviderVerificationStatus;
}

export interface ProviderService {
  id: string;
  providerId: string;
  name: string;
  description: string;
  lens: WithinLens;
  category: string;
  durationMinutes: number | null;
  priceAmount: number | null;
  priceType: ProviderPriceType;
  deliveryMode: ProviderServiceDeliveryMode;
  location: string | null;
  isActive: boolean;
  createdUtc: string;
  updatedUtc: string;
}

export interface UpsertProviderPayload {
  name: string;
  bio: string;
  lens: WithinLens;
  location: string;
  websiteUrl: string | null;
  instagramUrl: string | null;
  providerType: ProviderType;
  legalName: string | null;
  categories: string[];
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  suburb: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  showEmailPublicly: boolean;
  showPhonePublicly: boolean;
  showWebsitePublicly: boolean;
  practitionerTitle: string | null;
  yearsExperience: number | null;
  qualifications: string | null;
  servicesOffered: string[];
  languages: string[];
  onlineAvailable: boolean;
  inPersonAvailable: boolean;
  businessType: string | null;
  abn: string | null;
  facilities: string[];
  accessibilityFeatures: string[];
  teamMembers: string[];
  openingHours: string | null;
  isActive: boolean;
}

export interface UpsertProviderServicePayload {
  name: string;
  description: string;
  lens: WithinLens;
  category: string;
  durationMinutes: number | null;
  priceAmount: number | null;
  priceType: ProviderPriceType;
  deliveryMode: ProviderServiceDeliveryMode;
  location: string | null;
  isActive: boolean;
}

export interface EventItem {
  id: string;
  providerId: string;
  providerServiceId: string | null;
  providerName: string;
  provider: ProviderSummary;
  providerService: ProviderService | null;
  title: string;
  description: string;
  eventType: EventType;
  lens: WithinLens;
  locationName: string;
  isOnline: boolean;
  startUtc: string;
  endUtc: string;
  priceAmount: number;
  currency: string;
  capacity: number;
  goingCount: number;
  isSaved: boolean;
  joinState: EventJoinState | null;
  signupType: SignupType;
  externalBookingUrl: string | null;
  imageUrl: string | null;
  status: EventStatus;
  tags: string[];
  bringItems: string[];
  bringNotes: string | null;
  facilities: string[];
  accessibilityFeatures: string[];
  physicalIntensity: EventIntensity | null;
  socialInteractionLevel: EventIntensity | null;
  experienceLevel: EventExperienceLevel | null;
  atmosphereTags: string[];
  foodProvided: boolean;
  drinksProvided: boolean;
  dietaryOptions: string[];
  foodNotes: string | null;
  ageRestriction: EventAgeRestriction | null;
  safetyNotes: string | null;
  retreatDuration: string | null;
  accommodationIncluded: boolean;
  mealsIncluded: boolean;
  transportIncluded: boolean;
  retreatFocus: RetreatFocus | null;
  difficultyLevel: RetreatDifficulty | null;
  whatsIncluded: string | null;
  whatToBring: string | null;
  facilitiesAvailable: string[];
}

export interface UpsertEventPayload {
  title: string;
  description: string;
  eventType: EventType;
  lens: WithinLens;
  locationName: string;
  isOnline: boolean;
  startUtc: string;
  endUtc: string;
  priceAmount: number;
  currency: string;
  capacity: number;
  signupType: SignupType;
  providerServiceId: string | null;
  externalBookingUrl: string | null;
  imageUrl: string | null;
  tags: string[];
  bringItems: string[];
  bringNotes: string | null;
  facilities: string[];
  accessibilityFeatures: string[];
  physicalIntensity: EventIntensity | null;
  socialInteractionLevel: EventIntensity | null;
  experienceLevel: EventExperienceLevel | null;
  atmosphereTags: string[];
  foodProvided: boolean;
  drinksProvided: boolean;
  dietaryOptions: string[];
  foodNotes: string | null;
  ageRestriction: EventAgeRestriction | null;
  safetyNotes: string | null;
  retreatDuration: string | null;
  accommodationIncluded: boolean;
  mealsIncluded: boolean;
  transportIncluded: boolean;
  retreatFocus: RetreatFocus | null;
  difficultyLevel: RetreatDifficulty | null;
  whatsIncluded: string | null;
  whatToBring: string | null;
  facilitiesAvailable: string[];
}

export interface ProviderEventParticipant {
  userId: string;
  displayName: string;
  updatedUtc: string;
}

export interface ProviderEventEngagement {
  eventId: string;
  eventTitle: string;
  goingCount: number;
  interestedCount: number;
  declinedCount: number;
  savedCount: number;
  going: ProviderEventParticipant[];
  interested: ProviderEventParticipant[];
  declined: ProviderEventParticipant[];
  saved: ProviderEventParticipant[];
}

export interface CommunityAuthor {
  id: string;
  displayName: string;
  role: WithinRole;
  isVerifiedProvider: boolean;
}

export interface CommunityTopic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

export interface CommunityEventSummary {
  id: string;
  title: string;
  providerName: string;
  startUtc: string;
  locationName: string;
}

export interface CommunityPost {
  id: string;
  postType: CommunityPostType;
  title: string;
  body: string;
  status: CommunityContentStatus;
  author: CommunityAuthor;
  topics: CommunityTopic[];
  linkedEvent: CommunityEventSummary | null;
  helpfulCount: number;
  commentCount: number;
  savedCount: number;
  isHelpful: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  body: string;
  status: CommunityContentStatus;
  author: CommunityAuthor;
  helpfulCount: number;
  isHelpful: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityReport {
  id: string;
  circleId?: string;
  circleEventId?: string | null;
  circleName?: string;
  reason: CommunityReportReason;
  description: string | null;
  status: CommunityReportStatus;
  post: CommunityPost | null;
  thread?: CommunityPost | null;
  comment: CommunityComment | null;
  sharedEvent?: EventItem | null;
  reporter: CommunityAuthor;
  reviewer: CommunityAuthor | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

// ---- Admin-managed master data ----
export type HabitCategory = 'Mind' | 'Body' | 'Lifestyle' | 'Social' | 'Nature';
export type CircleType = 'Platform' | 'Provider' | 'EventCohort' | 'PrivateSupport';
export type CircleVisibility = 'Public' | 'Private' | 'Hidden';
export type CircleStatus = 'Active' | 'Archived';

export interface AdminHabitTemplate {
  id: string;
  name: string;
  category: HabitCategory;
  description: string | null;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateHabitTemplatePayload {
  name: string;
  category: HabitCategory;
  description: string | null;
  iconKey: string | null;
  sortOrder: number | null;
}

export interface UpdateHabitTemplatePayload {
  name: string;
  category: HabitCategory;
  description: string | null;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminCircle {
  id: string;
  name: string;
  slug: string;
  description: string;
  rules: string | null;
  type: CircleType;
  visibility: CircleVisibility;
  status: CircleStatus;
  lens: WithinLens;
  requiresApproval: boolean;
  memberCount: number;
  threadCount: number;
  eventCount: number;
}

export type CircleJoinRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AdminCircleJoinRequest {
  id: string;
  circleId: string;
  circleName: string;
  user: CommunityAuthor;
  status: CircleJoinRequestStatus;
  requestedAt: string;
  reviewedBy: CommunityAuthor | null;
  reviewedAt: string | null;
}

export interface CreateCirclePayload {
  name: string;
  description: string;
  lens: WithinLens;
  visibility: CircleVisibility;
  rules: string | null;
  requiresApproval: boolean;
}

export interface UpdateCirclePayload {
  name: string;
  description: string;
  lens: WithinLens;
  visibility: CircleVisibility;
  status: CircleStatus;
  rules: string | null;
  requiresApproval: boolean;
}

export interface AdminCircleGuideline {
  id: string;
  title: string;
  body: string;
  sortOrder: number;
  isActive: boolean;
}

export interface GuidelinePayload {
  title: string;
  body: string;
  sortOrder: number;
}

export interface GuidelineUpdatePayload {
  title: string;
  body: string;
  sortOrder: number;
  isActive: boolean;
}
