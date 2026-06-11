import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { AdminCircleJoinRequest, CircleAdminMember, CircleInsights, EventItem } from '../../core/within.models';

type CircleSection = 'overview' | 'members' | 'engage' | 'events';

// Per-circle management UI shared by the Circle Admin dashboard and the admin Circles tab.
// Pass the circle id; everything loads itself. Auth is whatever admin session is active
// (platform Admins pass CanAdminCircle for every circle; circle admins for their own).
@Component({
  selector: 'app-circle-manage',
  imports: [CommonModule, FormsModule],
  templateUrl: './circle-manage-panel.component.html',
})
export class CircleManagePanelComponent {
  private readonly admin = inject(AdminService);

  private currentId = '';
  @Input({ required: true })
  set circleId(value: string) {
    if (value && value !== this.currentId) {
      this.currentId = value;
      void this.load();
    }
  }
  get circleId(): string { return this.currentId; }

  protected readonly section = signal<CircleSection>('overview');
  protected readonly insights = signal<CircleInsights | null>(null);
  protected readonly members = signal<CircleAdminMember[]>([]);
  protected readonly joinRequests = signal<AdminCircleJoinRequest[]>([]);
  protected readonly events = signal<EventItem[]>([]);
  protected readonly saving = signal(false);
  protected readonly message = signal('');

  protected readonly announcementBody = signal('');
  protected readonly announcementPinned = signal(true);
  protected readonly promptTitle = signal('');
  protected readonly promptBody = signal('');
  protected readonly pollQuestion = signal('');
  protected readonly pollOptionsText = signal('');
  protected readonly shareEventId = signal('');
  protected readonly shareNote = signal('');

  protected setSection(section: CircleSection): void {
    this.section.set(section);
    if (section === 'events' && !this.events().length) void this.loadEvents();
  }

  private async load(): Promise<void> {
    this.section.set('overview');
    this.message.set('');
    try {
      const [insights, members, requests] = await Promise.all([
        this.admin.getCircleInsights(this.currentId),
        this.admin.getCircleMembers(this.currentId),
        this.admin.getCircleJoinRequests(this.currentId),
      ]);
      this.insights.set(insights);
      this.members.set(members ?? []);
      this.joinRequests.set((requests ?? []).filter(r => r.status === 'Pending'));
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not load circle details.');
    }
  }

  protected async approveRequest(request: AdminCircleJoinRequest): Promise<void> {
    await this.admin.approveOwnedCircleJoinRequest(this.currentId, request.id);
    this.message.set(`Approved ${request.user.displayName}.`);
    await this.load();
  }

  protected async rejectRequest(request: AdminCircleJoinRequest): Promise<void> {
    await this.admin.rejectOwnedCircleJoinRequest(this.currentId, request.id);
    this.message.set(`Declined ${request.user.displayName}.`);
    await this.load();
  }

  protected async postAnnouncement(): Promise<void> {
    const body = this.announcementBody().trim();
    if (!body) { this.message.set('Write an announcement first.'); return; }
    this.saving.set(true);
    try {
      await this.admin.postCircleAnnouncement(this.currentId, body, this.announcementPinned());
      this.announcementBody.set('');
      this.message.set('Announcement posted.');
      await this.load();
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not post announcement.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async postPrompt(): Promise<void> {
    const title = this.promptTitle().trim();
    const body = this.promptBody().trim();
    if (!title || !body) { this.message.set('Add a prompt title and body.'); return; }
    this.saving.set(true);
    try {
      await this.admin.postCircleThread(this.currentId, { threadType: 'AskCommunity', title, body, postType: 'Standard' });
      this.promptTitle.set('');
      this.promptBody.set('');
      this.message.set('Prompt posted to the circle feed.');
      await this.load();
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not post prompt.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async postPoll(): Promise<void> {
    const question = this.pollQuestion().trim();
    const options = this.pollOptionsText().split('\n').map(o => o.trim()).filter(Boolean);
    if (!question) { this.message.set('Add a poll question.'); return; }
    if (options.length < 2) { this.message.set('Add at least two poll options (one per line).'); return; }
    this.saving.set(true);
    try {
      await this.admin.postCircleThread(this.currentId, { threadType: 'AskCommunity', title: question, body: question, postType: 'Poll', poll: { question, options } });
      this.pollQuestion.set('');
      this.pollOptionsText.set('');
      this.message.set('Poll posted.');
      await this.load();
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not post poll.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async loadEvents(): Promise<void> {
    try {
      this.events.set(await this.admin.getPublishedEvents() ?? []);
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not load events.');
    }
  }

  protected async shareEvent(): Promise<void> {
    const eventId = this.shareEventId();
    if (!eventId) { this.message.set('Choose an event to share.'); return; }
    this.saving.set(true);
    try {
      await this.admin.shareCircleEvent(this.currentId, eventId, this.shareNote().trim() || null);
      this.shareEventId.set('');
      this.shareNote.set('');
      this.message.set('Event shared to the circle.');
      await this.load();
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not share event.');
    } finally {
      this.saving.set(false);
    }
  }
}
