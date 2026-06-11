import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { formatKey, formatProviderCategory, formatProviderStatus, formatValue, providerApplicationEntries, trustChecklist } from '../../core/formatters';
import { AdminAnswerEntry, AdminAudienceFilter, AdminCircle, AdminCircleGuideline, AdminHabitTemplate, AdminStats, AdminSubmission, AdminUserRecord, AdminProviderFilter, CircleStatus, CircleVisibility, CommunityReport, CommunityReportStatus, HabitCategory, ProviderApplication, ProviderApplicationStatus, WithinLens } from '../../core/within.models';
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
  protected readonly communityReports = signal<CommunityReport[]>([]);
  protected readonly adminFilter = signal<AdminAudienceFilter>('all');
  protected readonly adminSelectedId = signal<string | null>(null);
  protected readonly adminTab = signal<'submissions' | 'providers' | 'users' | 'moderation' | 'habits' | 'circles'>('submissions');
  protected readonly navOpen = signal(false);
  protected readonly navItems: { id: 'submissions' | 'providers' | 'users' | 'moderation' | 'habits' | 'circles'; label: string; icon: string }[] = [
    { id: 'submissions', label: 'Submissions', icon: 'inbox' },
    { id: 'providers', label: 'Providers', icon: 'verified_user' },
    { id: 'moderation', label: 'Moderation', icon: 'flag' },
    { id: 'users', label: 'Users', icon: 'group' },
    { id: 'habits', label: 'Habits', icon: 'check_circle' },
    { id: 'circles', label: 'Circles', icon: 'forum' },
  ];
  protected readonly sectionMeta: Record<'submissions' | 'providers' | 'users' | 'moderation' | 'habits' | 'circles', { title: string; sub: string }> = {
    submissions: { title: 'Submissions', sub: 'Survey responses from users and providers' },
    providers: { title: 'Providers', sub: 'Review and approve provider applications' },
    moderation: { title: 'Moderation', sub: 'Community reports awaiting review' },
    users: { title: 'Users', sub: 'Registered accounts on the platform' },
    habits: { title: 'Habits', sub: 'Master data for habit templates' },
    circles: { title: 'Circles', sub: 'Platform circles and their guidelines' },
  };
  protected readonly selectedCommunityReportId = signal<string | null>(null);
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

  // ---- Master data (admin-managed) ----
  protected readonly habitCategoryOptions: HabitCategory[] = ['Mind', 'Body', 'Lifestyle', 'Social', 'Nature'];
  protected readonly lensOptions: WithinLens[] = ['Move', 'Feel', 'Seek'];
  protected readonly circleVisibilityOptions: CircleVisibility[] = ['Public', 'Private'];
  protected readonly circleStatusOptions: CircleStatus[] = ['Active', 'Archived'];

  protected readonly habitTemplates = signal<AdminHabitTemplate[]>([]);
  protected habitDraft: { id: string | null; name: string; category: HabitCategory; description: string; iconKey: string; sortOrder: number; isActive: boolean } =
    { id: null, name: '', category: 'Mind', description: '', iconKey: '', sortOrder: 0, isActive: true };

  protected readonly circles = signal<AdminCircle[]>([]);
  protected circleDraft: { id: string | null; name: string; description: string; lens: WithinLens; visibility: CircleVisibility; status: CircleStatus; rules: string } =
    { id: null, name: '', description: '', lens: 'Feel', visibility: 'Public', status: 'Active', rules: '' };
  protected readonly selectedCircleId = signal<string | null>(null);
  protected readonly guidelines = signal<AdminCircleGuideline[]>([]);
  protected guidelineDraft: { id: string | null; title: string; body: string; sortOrder: number; isActive: boolean } =
    { id: null, title: '', body: '', sortOrder: 0, isActive: true };

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

  protected readonly selectedCommunityReport = computed(() =>
    this.communityReports().find(item => item.id === this.selectedCommunityReportId()) ?? null
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
    this.communityReports.set([]);
    this.providerApplications.set([]);
    this.adminSelectedId.set(null);
    this.selectedProviderApplicationId.set(null);
    this.selectedCommunityReportId.set(null);
    this.providerCredential.set(null);
    this.habitTemplates.set([]);
    this.circles.set([]);
    this.guidelines.set([]);
    this.selectedCircleId.set(null);
    this.resetHabitDraft();
    this.resetCircleDraft();
    this.adminMessage.set('Signed out.');
  }

  protected async loadAdminData(): Promise<void> {
    this.adminLoading.set(true);
    this.adminMessage.set('');
    const [submissions, stats, users, providerApplications, communityReports] = await Promise.all([
      this.admin.getSubmissions(),
      this.admin.getStats(),
      this.admin.getUsers(),
      this.admin.getProviderApplications(),
      this.admin.getCommunityReports(),
    ]);
    this.adminLoading.set(false);
    if (submissions === null || stats === null || users === null || providerApplications === null || communityReports === null) {
      this.adminMessage.set('Could not load admin data. Check the API and session.');
      return;
    }
    this.adminSubmissions.set(submissions);
    this.adminStats.set(stats);
    this.adminUsers.set(users);
    this.providerApplications.set(providerApplications);
    this.communityReports.set(communityReports);
    if (!this.adminSelectedId() && submissions.length) this.adminSelectedId.set(submissions[0].id);
    if (!this.selectedProviderApplicationId() && providerApplications.length) this.selectProviderApplication(providerApplications[0].id);
    if (!this.selectedCommunityReportId() && communityReports.length) this.selectedCommunityReportId.set(communityReports[0].id);
    void this.loadMasterData();
  }

  protected async loadMasterData(): Promise<void> {
    const [habitTemplates, circles] = await Promise.all([
      this.admin.listHabitTemplates(),
      this.admin.listCircles(),
    ]);
    if (habitTemplates) this.habitTemplates.set(habitTemplates);
    if (circles) this.circles.set(circles);
  }

  protected setAdminFilter(filter: AdminAudienceFilter): void {
    this.adminFilter.set(filter);
    const filtered = this.adminFilteredSubmissions();
    if (filtered.length && !filtered.some(item => item.id === this.adminSelectedId())) this.adminSelectedId.set(filtered[0].id);
  }

  protected setAdminTab(tab: 'submissions' | 'providers' | 'users' | 'moderation' | 'habits' | 'circles'): void {
    this.adminTab.set(tab);
    this.navOpen.set(false);
  }

  protected selectSubmission(id: string): void {
    this.adminSelectedId.set(id);
  }

  protected selectCommunityReport(id: string): void {
    this.selectedCommunityReportId.set(id);
  }

  protected async reviewCommunityReport(status: CommunityReportStatus): Promise<void> {
    const report = this.selectedCommunityReport();
    if (!report) return;
    const updated = await this.admin.reviewCommunityReport(report.id, status);
    if (!updated) {
      this.adminMessage.set('Could not update moderation report.');
      return;
    }
    this.replaceCommunityReport(updated);
    this.adminMessage.set(`Report marked ${status}.`);
  }

  protected async removeReportedContent(report: CommunityReport): Promise<void> {
    const targetPost = report.thread ?? report.post;
    const ok = targetPost
      ? await this.admin.removeCommunityPost(targetPost.id)
      : report.comment
        ? await this.admin.removeCommunityComment(report.comment.id)
        : report.sharedEvent && report.circleEventId
          ? await this.admin.removeCircleEventShare(report.circleEventId)
          : null;
    if (ok === null) {
      this.adminMessage.set('Could not remove reported content.');
      return;
    }
    const updated = await this.admin.reviewCommunityReport(report.id, 'ActionTaken');
    if (updated) this.replaceCommunityReport(updated);
    this.adminMessage.set('Reported content removed.');
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

  protected isTombstoneUser(user: AdminUserRecord): boolean {
    return user.email.endsWith('@deleted.invalid');
  }

  protected async deleteUser(user: AdminUserRecord): Promise<void> {
    if (this.isTombstoneUser(user)) return;
    if (!confirm(`Delete ${user.displayName} (${user.email})?\n\nThis removes their personal data permanently. Their past contributions remain but show as "Deleted user". This cannot be undone.`)) {
      return;
    }
    try {
      await this.admin.deleteUser(user.id);
      this.adminUsers.set(this.adminUsers().filter(item => item.id !== user.id));
      this.adminMessage.set(`${user.displayName} was deleted.`);
    } catch (error) {
      this.adminMessage.set(error instanceof Error ? error.message : 'Could not delete this user.');
    }
  }

  protected async hardDeleteUser(user: AdminUserRecord): Promise<void> {
    if (!this.isTombstoneUser(user)) return;
    if (!confirm(`Permanently purge this deleted account (${user.email})?\n\nThis erases the account row and ALL of its remaining content — threads, comments, reactions, reviews, RSVPs and reports. Anything others added to those threads is removed too. This cannot be undone.`)) {
      return;
    }
    try {
      await this.admin.hardDeleteUser(user.id);
      this.adminUsers.set(this.adminUsers().filter(item => item.id !== user.id));
      this.adminMessage.set('The deleted account was permanently purged.');
    } catch (error) {
      this.adminMessage.set(error instanceof Error ? error.message : 'Could not purge this account.');
    }
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

  protected formatCommunityReportReason(reason: string): string {
    return reason.replace(/([A-Z])/g, ' $1').trim();
  }

  // ---- Master data: habit templates ----
  protected editHabit(template: AdminHabitTemplate): void {
    this.habitDraft = {
      id: template.id, name: template.name, category: template.category,
      description: template.description ?? '', iconKey: template.iconKey ?? '',
      sortOrder: template.sortOrder, isActive: template.isActive,
    };
  }

  protected resetHabitDraft(): void {
    this.habitDraft = { id: null, name: '', category: 'Mind', description: '', iconKey: '', sortOrder: 0, isActive: true };
  }

  protected async saveHabit(): Promise<void> {
    const name = this.habitDraft.name.trim();
    if (!name) { this.adminMessage.set('Habit name is required.'); return; }
    const description = this.habitDraft.description.trim() || null;
    const iconKey = this.habitDraft.iconKey.trim() || null;
    const sortOrder = Number(this.habitDraft.sortOrder) || 0;
    const result = this.habitDraft.id
      ? await this.admin.updateHabitTemplate(this.habitDraft.id, { name, category: this.habitDraft.category, description, iconKey, sortOrder, isActive: this.habitDraft.isActive })
      : await this.admin.createHabitTemplate({ name, category: this.habitDraft.category, description, iconKey, sortOrder });
    if (!result) { this.adminMessage.set('Could not save habit template (name may already exist).'); return; }
    const habitTemplates = await this.admin.listHabitTemplates();
    if (habitTemplates) this.habitTemplates.set(habitTemplates);
    this.resetHabitDraft();
    this.adminMessage.set('Habit template saved.');
  }

  protected async deactivateHabit(template: AdminHabitTemplate): Promise<void> {
    if (!confirm(`Deactivate "${template.name}"? It will be hidden from users but can be reactivated.`)) return;
    const ok = await this.admin.deactivateHabitTemplate(template.id);
    if (ok === null) { this.adminMessage.set('Could not deactivate habit template.'); return; }
    const habitTemplates = await this.admin.listHabitTemplates();
    if (habitTemplates) this.habitTemplates.set(habitTemplates);
    this.adminMessage.set('Habit template deactivated.');
  }

  // ---- Master data: platform circles + guidelines ----
  protected async selectCircle(circle: AdminCircle): Promise<void> {
    this.selectedCircleId.set(circle.id);
    this.circleDraft = {
      id: circle.id, name: circle.name, description: circle.description, lens: circle.lens,
      visibility: circle.visibility === 'Hidden' ? 'Public' : circle.visibility, status: circle.status, rules: circle.rules ?? '',
    };
    this.resetGuidelineDraft();
    const guidelines = await this.admin.listGuidelines(circle.id);
    this.guidelines.set(guidelines ?? []);
  }

  protected resetCircleDraft(): void {
    this.circleDraft = { id: null, name: '', description: '', lens: 'Feel', visibility: 'Public', status: 'Active', rules: '' };
    this.selectedCircleId.set(null);
    this.guidelines.set([]);
    this.resetGuidelineDraft();
  }

  protected async saveCircle(): Promise<void> {
    const name = this.circleDraft.name.trim();
    const description = this.circleDraft.description.trim();
    if (!name || !description) { this.adminMessage.set('Circle name and description are required.'); return; }
    const rules = this.circleDraft.rules.trim() || null;
    const result = this.circleDraft.id
      ? await this.admin.updateCircle(this.circleDraft.id, { name, description, lens: this.circleDraft.lens, visibility: this.circleDraft.visibility, status: this.circleDraft.status, rules })
      : await this.admin.createCircle({ name, description, lens: this.circleDraft.lens, visibility: this.circleDraft.visibility, rules });
    if (!result) { this.adminMessage.set('Could not save circle.'); return; }
    const circles = await this.admin.listCircles();
    if (circles) this.circles.set(circles);
    this.adminMessage.set('Circle saved.');
    if (!this.circleDraft.id) {
      this.resetCircleDraft();
    } else {
      await this.selectCircle(result);
    }
  }

  protected async archiveCircle(circle: AdminCircle): Promise<void> {
    if (!confirm(`Archive "${circle.name}"? It will be hidden but history is kept.`)) return;
    const ok = await this.admin.archiveCircle(circle.id);
    if (ok === null) { this.adminMessage.set('Could not archive circle.'); return; }
    const circles = await this.admin.listCircles();
    if (circles) this.circles.set(circles);
    if (this.selectedCircleId() === circle.id) this.resetCircleDraft();
    this.adminMessage.set('Circle archived.');
  }

  protected editGuideline(guideline: AdminCircleGuideline): void {
    this.guidelineDraft = { id: guideline.id, title: guideline.title, body: guideline.body, sortOrder: guideline.sortOrder, isActive: guideline.isActive };
  }

  protected resetGuidelineDraft(): void {
    this.guidelineDraft = { id: null, title: '', body: '', sortOrder: 0, isActive: true };
  }

  protected async saveGuideline(): Promise<void> {
    const circleId = this.selectedCircleId();
    if (!circleId) { this.adminMessage.set('Select a circle first.'); return; }
    const title = this.guidelineDraft.title.trim();
    const body = this.guidelineDraft.body.trim();
    if (!title || !body) { this.adminMessage.set('Guideline title and body are required.'); return; }
    const sortOrder = Number(this.guidelineDraft.sortOrder) || 0;
    const result = this.guidelineDraft.id
      ? await this.admin.updateGuideline(circleId, this.guidelineDraft.id, { title, body, sortOrder, isActive: this.guidelineDraft.isActive })
      : await this.admin.createGuideline(circleId, { title, body, sortOrder });
    if (!result) { this.adminMessage.set('Could not save guideline.'); return; }
    const guidelines = await this.admin.listGuidelines(circleId);
    this.guidelines.set(guidelines ?? []);
    this.resetGuidelineDraft();
    this.adminMessage.set('Guideline saved.');
  }

  protected async deleteGuideline(guideline: AdminCircleGuideline): Promise<void> {
    const circleId = this.selectedCircleId();
    if (!circleId) return;
    if (!confirm(`Delete guideline "${guideline.title}"?`)) return;
    const ok = await this.admin.deleteGuideline(circleId, guideline.id);
    if (ok === null) { this.adminMessage.set('Could not delete guideline.'); return; }
    const guidelines = await this.admin.listGuidelines(circleId);
    this.guidelines.set(guidelines ?? []);
    this.adminMessage.set('Guideline deleted.');
  }

  private replaceProviderApplication(updated: ProviderApplication): void {
    this.providerApplications.set(this.providerApplications().map(item => item.id === updated.id ? updated : item));
    this.providerAdminNotesDraft.set(updated.adminNotes ?? '');
  }

  private replaceCommunityReport(updated: CommunityReport): void {
    this.communityReports.set(this.communityReports().map(item => item.id === updated.id ? updated : item));
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
