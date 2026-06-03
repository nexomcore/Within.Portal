export type SurveyAudience = 'user' | 'provider';
export type AdminAudienceFilter = 'all' | 'user' | 'provider' | 'interest';
export type ProviderApplicationStatus = 'Submitted' | 'InReview' | 'MoreInfoRequested' | 'Approved' | 'Rejected';
export type ProviderCategory = 'BusinessStudio' | 'IndividualPractitioner' | 'CollectiveCommunityGroup' | 'RetreatProgramOrganiser' | 'VenueSpacePartner' | 'CorporateWorkplaceWellness';
export type WithinLens = 'Move' | 'Feel' | 'Seek';
export type AdminProviderFilter = 'all' | ProviderApplicationStatus;

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
  role: 'User' | 'Provider' | 'Admin';
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
}

export interface ProviderApplicationEntry {
  key: string;
  value: string;
}

export interface Option<T extends string = string> {
  value: T;
  label: string;
}
