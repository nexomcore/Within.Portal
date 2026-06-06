import { ProviderApplication, ProviderApplicationEntry, ProviderApplicationStatus, ProviderCategory } from './within.models';
import { providerCategoryOptions } from './within-options';

export function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim();
}

export function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '-';
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (!entries.length) return '-';
    return entries.map(([k, v]) => `${formatKey(k)}: ${formatValue(v)}`).join(' - ');
  }
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
}

export function formatProviderCategory(category: ProviderCategory): string {
  return providerCategoryOptions.find(option => option.value === category)?.label ?? formatKey(category);
}

export function formatProviderStatus(status: ProviderApplicationStatus): string {
  return formatKey(status);
}

export function providerApplicationEntries(application: ProviderApplication | null): ProviderApplicationEntry[] {
  if (!application) return [];
  return [
    { key: 'Contact', value: `${application.contactName} - ${application.contactEmail}${application.contactPhone ? ' - ' + application.contactPhone : ''}` },
    { key: 'Preferred contact', value: application.preferredContactMethod },
    { key: 'Category', value: formatProviderCategory(application.providerCategory) },
    { key: 'Business type', value: application.businessType },
    { key: 'Primary lens', value: application.primaryLens },
    { key: 'Service areas', value: formatValue(application.serviceAreas) },
    { key: 'Location', value: application.location },
    { key: 'Delivery', value: formatValue(application.deliveryModes) },
    { key: 'Venues', value: application.venueNames ?? '-' },
    { key: 'Services', value: formatValue(application.servicesOffered) },
    { key: 'Years practicing', value: application.yearsPracticing },
    { key: 'Typical audience', value: application.typicalAudience },
    { key: 'Bio', value: application.bio },
    { key: 'Why Within', value: application.joinReason },
    { key: 'Certifications', value: application.certifications },
    { key: 'Insurance', value: application.insuranceStatus },
    { key: 'Working with children', value: application.workingWithChildrenCheck },
    { key: 'First aid / CPR', value: application.firstAidCpr },
    { key: 'Memberships', value: application.professionalMemberships ?? '-' },
    { key: 'Credential links', value: application.credentialLinks ?? '-' },
    { key: 'Events ready', value: application.hasEventsReady },
    { key: 'First event', value: application.expectedFirstEvent },
    { key: 'Booking tools', value: application.bookingTools },
    { key: 'Provider notes', value: application.adminFacingNotes ?? '-' },
    { key: 'Website', value: application.websiteUrl ?? '-' },
    { key: 'Instagram', value: application.instagramUrl ?? '-' },
    { key: 'Other social', value: application.otherSocialUrl ?? '-' },
    { key: 'ABN', value: application.abn ?? '-' },
    { key: 'Approved provider id', value: application.approvedProviderId ?? '-' },
  ];
}

export function trustChecklist(application: ProviderApplication): { label: string; ok: boolean }[] {
  return [
    { label: 'Certifications supplied', ok: !!application.certifications.trim() },
    { label: 'Insurance status supplied', ok: !!application.insuranceStatus.trim() },
    { label: 'Safety checks supplied', ok: !!application.workingWithChildrenCheck.trim() && !!application.firstAidCpr.trim() },
    { label: 'Credential links supplied', ok: !!application.credentialLinks?.trim() },
    { label: 'Business identifier supplied', ok: !!application.abn?.trim() },
    { label: 'Public profile link supplied', ok: !!(application.websiteUrl?.trim() || application.instagramUrl?.trim() || application.otherSocialUrl?.trim()) },
    { label: 'Declaration accepted', ok: application.declarationAccepted },
  ];
}
