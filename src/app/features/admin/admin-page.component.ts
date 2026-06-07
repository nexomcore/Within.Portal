import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { formatKey, formatProviderCategory, formatProviderStatus, formatValue, providerApplicationEntries, trustChecklist } from '../../core/formatters';
import { AdminAnswerEntry, AdminAudienceFilter, AdminStats, AdminSubmission, AdminUserRecord, AdminProviderFilter, ProviderApplication, ProviderApplicationStatus } from '../../core/within.models';
import { providerStatusFilters } from '../../core/within-options';

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-page.component.html',
})
export class AdminPageComponent {
  private readonly admin = inject(AdminService);

  protected readonly providerStatusFilters = providerStatusFilters;
  protected readonly adminEmail = signal('admin@within.local');
  protected readonly adminPassword = signal('');
  protected readonly adminMessage = signal('');
  protected readonly adminLoading = signal(false);
  protected readonly adminSubmissions = signal<AdminSubmission[]>([]);
  protected readonly adminStats = signal<AdminStats | null>(null);
  protected readonly adminUsers = signal<AdminUserRecord[]>([]);
  protected readonly adminFilter = signal<AdminAudienceFilter>('all');
  protected readonly adminSelectedId = signal<string | null>(null);
  protected readonly adminTab = signal<'submissions' | 'providers' | 'users'>('submissions');
  protected readonly providerApplications = signal<ProviderApplication[]>([]);
  protected readonly providerApplicationFilter = signal<AdminProviderFilter>('all');
  protected readonly providerApplicationSearch = signal('');
  protected readonly selectedProviderApplicationId = signal<string | null>(null);
  protected readonly providerDecisionReason = signal('');
  protected readonly providerAdminNotesDraft = signal('');
  protected readonly providerCredential = signal<{ email: string; password: string } | null>(null);
  protected readonly adminAuthed = this.admin.authed;
  protected readonly formatProviderCategory = formatProviderCategory;
  protected readonly formatProviderStatus = formatProviderStatus;
  protected readonly providerApplicationEntries = providerApplicationEntries;
  protected readonly trustChecklist = trustChecklist;

  protected readonly adminFilteredSubmissions = computed(() => {
    const filter = this.adminFilter();
    return filter === 'all' ? this.adminSubmissions() : this.adminSubmissions().filter(item => item.audience === filter);
  });

  protected readonly adminSelectedSubmission = computed(() =>
    this.adminSubmissions().find(item => item.id === this.adminSelectedId()) ?? null
  );

  protected readonly filteredProviderApplications = computed(() => {
    const filter = this.providerApplicationFilter();
    const search = this.providerApplicationSearch().trim().toLowerCase();
    return this.providerApplications()
      .filter(item => filter === 'all' || item.status === filter)
      .filter(item => !search || [
        item.providerName,
        item.contactName,
        item.contactEmail,
        item.location,
        formatProviderCategory(item.providerCategory),
        item.primaryLens,
      ].some(value => value.toLowerCase().includes(search)));
  });

  protected readonly selectedProviderApplication = computed(() =>
    this.providerApplications().find(item => item.id === this.selectedProviderApplicationId()) ?? null
  );

  constructor() {
    if (this.adminAuthed()) void this.loadAdminData();
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
      const displayName = await this.admin.login(email, password);
      this.adminPassword.set('');
      this.adminMessage.set(`Signed in as ${displayName}.`);
      await this.loadAdminData();
    } catch (error) {
      this.adminMessage.set(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      this.adminLoading.set(false);
    }
  }

  protected adminLogout(): void {
    this.admin.logout();
    this.adminSubmissions.set([]);
    this.adminStats.set(null);
    this.adminUsers.set([]);
    this.providerApplications.set([]);
    this.adminSelectedId.set(null);
    this.selectedProviderApplicationId.set(null);
    this.providerCredential.set(null);
    this.adminMessage.set('Signed out.');
  }

  protected async loadAdminData(): Promise<void> {
    this.adminLoading.set(true);
    this.adminMessage.set('');
    const [submissions, stats, users, providerApplications] = await Promise.all([
      this.admin.getSubmissions(),
      this.admin.getStats(),
      this.admin.getUsers(),
      this.admin.getProviderApplications(),
    ]);
    this.adminLoading.set(false);
    if (submissions === null || stats === null || users === null || providerApplications === null) {
      this.adminMessage.set('Could not load admin data. Check the API and session.');
      return;
    }
    this.adminSubmissions.set(submissions);
    this.adminStats.set(stats);
    this.adminUsers.set(users);
    this.providerApplications.set(providerApplications);
    if (!this.adminSelectedId() && submissions.length) this.adminSelectedId.set(submissions[0].id);
    if (!this.selectedProviderApplicationId() && providerApplications.length) this.selectProviderApplication(providerApplications[0].id);
  }

  protected setAdminFilter(filter: AdminAudienceFilter): void {
    this.adminFilter.set(filter);
    const filtered = this.adminFilteredSubmissions();
    if (filtered.length && !filtered.some(item => item.id === this.adminSelectedId())) this.adminSelectedId.set(filtered[0].id);
  }

  protected setAdminTab(tab: 'submissions' | 'providers' | 'users'): void {
    this.adminTab.set(tab);
  }

  protected selectSubmission(id: string): void {
    this.adminSelectedId.set(id);
  }

  protected setProviderApplicationFilter(filter: AdminProviderFilter): void {
    this.providerApplicationFilter.set(filter);
    const filtered = this.filteredProviderApplications();
    if (filtered.length && !filtered.some(item => item.id === this.selectedProviderApplicationId())) this.selectProviderApplication(filtered[0].id);
  }

  protected selectProviderApplication(id: string): void {
    this.selectedProviderApplicationId.set(id);
    const application = this.providerApplications().find(item => item.id === id);
    this.providerAdminNotesDraft.set(application?.adminNotes ?? '');
    this.providerDecisionReason.set('');
    this.providerCredential.set(null);
  }

  protected async updateProviderApplicationStatus(status: ProviderApplicationStatus): Promise<void> {
    const application = this.selectedProviderApplication();
    if (!application) return;
    const reason = this.providerDecisionReason().trim();
    if ((status === 'Rejected' || status === 'MoreInfoRequested') && !reason) {
      this.adminMessage.set('Add a reason before requesting more information or rejecting.');
      return;
    }
    try {
      const updated = await this.admin.updateProviderApplicationStatus(application.id, status, reason);
      if (!updated) {
        this.adminMessage.set('Could not update provider application.');
        return;
      }
      this.replaceProviderApplication(updated);
      this.providerDecisionReason.set('');
      this.providerCredential.set(updated.temporaryPassword ? { email: updated.contactEmail, password: updated.temporaryPassword } : null);
      this.adminMessage.set(`Provider application marked ${formatProviderStatus(status)}.`);
    } catch (error) {
      this.providerCredential.set(null);
      this.adminMessage.set(error instanceof Error ? error.message : 'Could not update provider application.');
    }
  }

  protected async copyProviderCredential(): Promise<void> {
    const credential = this.providerCredential();
    if (!credential) return;
    const text = `Within provider login\nEmail: ${credential.email}\nTemporary password: ${credential.password}`;
    try {
      await navigator.clipboard.writeText(text);
      this.adminMessage.set('Provider credential copied.');
    } catch {
      this.adminMessage.set('Could not copy automatically. Select the credential text and copy it manually.');
    }
  }

  protected async saveProviderAdminNotes(): Promise<void> {
    const application = this.selectedProviderApplication();
    if (!application) return;
    const updated = await this.admin.updateProviderApplicationNotes(application.id, this.providerAdminNotesDraft());
    if (!updated) {
      this.adminMessage.set('Could not save provider notes.');
      return;
    }
    this.replaceProviderApplication(updated);
    this.adminMessage.set('Provider notes saved.');
  }

  protected async deleteSubmission(id: string): Promise<void> {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    const ok = await this.admin.deleteSubmission(id);
    if (ok === null) {
      this.adminMessage.set('Could not delete submission.');
      return;
    }
    const remaining = this.adminSubmissions().filter(item => item.id !== id);
    this.adminSubmissions.set(remaining);
    if (this.adminSelectedId() === id) this.adminSelectedId.set(remaining[0]?.id ?? null);
    const stats = await this.admin.getStats();
    if (stats) this.adminStats.set(stats);
  }

  protected async deleteProvider(application: ProviderApplication): Promise<void> {
    if (!application.approvedProviderId) {
      this.adminMessage.set('This application does not have a linked provider to delete.');
      return;
    }

    if (!confirm(`Delete provider "${application.providerName}"? This cannot be undone.`)) {
      return;
    }

    const ok = await this.admin.deleteProvider(application.approvedProviderId);
    if (ok === null) {
      this.adminMessage.set('Could not delete provider. Providers with linked events or communities cannot be deleted.');
      return;
    }

    this.providerApplications.set(this.providerApplications().map(item =>
      item.id === application.id ? { ...item, approvedProviderId: null } : item
    ));
    this.adminMessage.set('Provider deleted. The application remains for audit history.');
  }

  protected answerEntries(submission: AdminSubmission | null): AdminAnswerEntry[] {
    if (!submission) return [];
    const comments = this.extractComments(submission.answers['comments']);
    return Object.entries(submission.answers)
      .filter(([key]) => !['audience', 'name', 'contact', 'source', 'createdUtc', 'comments'].includes(key))
      .map(([key, value]) => ({ key: formatKey(key), value: formatValue(value), comment: comments[key] ?? '' }));
  }

  protected formatAudience(audience: string): string {
    if (audience === 'provider') return 'Provider';
    if (audience === 'interest') return 'Interest';
    return 'User';
  }

  private replaceProviderApplication(updated: ProviderApplication): void {
    this.providerApplications.set(this.providerApplications().map(item => item.id === updated.id ? updated : item));
    this.providerAdminNotesDraft.set(updated.adminNotes ?? '');
  }

  private extractComments(value: unknown): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, comment]) => typeof comment === 'string' && comment.trim().length > 0)
        .map(([key, comment]) => [key, (comment as string).trim()])
    );
  }
}
