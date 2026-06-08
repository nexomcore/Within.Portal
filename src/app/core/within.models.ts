export type SurveyAudience = 'user' | 'provider';
export type AdminAudienceFilter = 'all' | 'user' | 'provider' | 'interest';
export type ProviderApplicationStatus = 'Submitted' | 'InReview' | 'MoreInfoRequested' | 'Approved' | 'Rejected';
export type ProviderCategory = 'BusinessStudio' | 'IndividualPractitioner' | 'CollectiveCommunityGroup' | 'RetreatProgramOrganiser' | 'VenueSpacePartner' | 'CorporateWorkplaceWellness';
export type WithinLens = 'Move' | 'Feel' | 'Seek';
export type AdminProviderFilter = 'all' | ProviderApplicationStatus;
export type WithinRole = 'User' | 'Provider' | 'Admin';
export type SignupType = 'Internal' | 'External';
export type EventStatus = 'Draft' | 'Published' | 'Cancelled';
export type EventJoinState = 'Interested' | 'Going' | 'Attended' | 'Declined';
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
  bio: string;
  lens: WithinLens;
  location: string;
  websiteUrl: string | null;
  instagramUrl: string | null;
  isVerified: boolean;
}

export interface EventItem {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  description: string;
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
}

export interface UpsertEventPayload {
  title: string;
  description: string;
  lens: WithinLens;
  locationName: string;
  isOnline: boolean;
  startUtc: string;
  endUtc: string;
  priceAmount: number;
  currency: string;
  capacity: number;
  signupType: SignupType;
  externalBookingUrl: string | null;
  imageUrl: string | null;
  tags: string[];
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
