import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { lensOptions } from '../../core/within-options';
import { AdminCircle, CircleStatus, CircleVisibility, WithinLens } from '../../core/within.models';
import { CircleManagePanelComponent } from './circle-manage-panel.component';

@Component({
  selector: 'app-circle-admin-dashboard-page',
  imports: [CommonModule, FormsModule, RouterLink, CircleManagePanelComponent],
  templateUrl: './circle-admin-dashboard-page.component.html',
})
export class CircleAdminDashboardPageComponent {
  private readonly admin = inject(AdminService);

  protected readonly lensOptions = lensOptions;
  protected readonly statusOptions: CircleStatus[] = ['Active', 'Archived'];

  protected readonly circles = signal<AdminCircle[]>([]);
  protected readonly selectedCircleId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly message = signal('');

  protected readonly editorOpen = signal(false);
  protected circleDraft: { id: string | null; name: string; description: string; lens: WithinLens; requiresApproval: boolean; rules: string; status: CircleStatus; visibility: CircleVisibility } =
    this.emptyDraft();

  protected readonly selectedCircle = computed(() =>
    this.circles().find(item => item.id === this.selectedCircleId()) ?? null
  );

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    try {
      const circles = await this.admin.getMyCircles();
      if (!circles) {
        this.message.set('Session expired. Sign in again.');
        return;
      }
      this.circles.set(circles);
      if (this.selectedCircleId() && !circles.some(c => c.id === this.selectedCircleId())) {
        this.selectedCircleId.set(null);
      }
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not load circles.');
    } finally {
      this.loading.set(false);
    }
  }

  protected logout(): void {
    this.admin.logout();
  }

  protected newCircle(): void {
    this.circleDraft = this.emptyDraft();
    this.editorOpen.set(true);
    this.message.set('Ready for a new circle.');
  }

  protected editCircle(circle: AdminCircle): void {
    this.circleDraft = {
      id: circle.id, name: circle.name, description: circle.description, lens: circle.lens,
      requiresApproval: circle.requiresApproval, rules: circle.rules ?? '', status: circle.status,
      visibility: circle.visibility === 'Hidden' ? 'Public' : circle.visibility,
    };
    this.editorOpen.set(true);
  }

  protected closeEditor(): void {
    this.editorOpen.set(false);
  }

  protected async saveCircle(): Promise<void> {
    const name = this.circleDraft.name.trim();
    const description = this.circleDraft.description.trim();
    if (!name || !description) { this.message.set('Circle name and description are required.'); return; }
    const rules = this.circleDraft.rules.trim() || null;
    const requiresApproval = this.circleDraft.requiresApproval;
    const lens = this.circleDraft.lens;
    const visibility = this.circleDraft.visibility;

    this.saving.set(true);
    try {
      const saved = this.circleDraft.id
        ? await this.admin.updateMyCircle(this.circleDraft.id, { name, description, lens, visibility, status: this.circleDraft.status, rules, requiresApproval })
        : await this.admin.createMyCircle({ name, description, lens, visibility, rules, requiresApproval });
      if (!saved) { this.message.set('Could not save circle. Sign in again and retry.'); return; }
      await this.load();
      this.editorOpen.set(false);
      this.message.set(this.circleDraft.id ? 'Circle updated.' : 'Circle created.');
      this.selectedCircleId.set(saved.id);
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Could not save circle.');
    } finally {
      this.saving.set(false);
    }
  }

  protected selectCircle(circle: AdminCircle): void {
    this.selectedCircleId.set(circle.id);
    this.editorOpen.set(false);
  }

  protected backToList(): void {
    this.selectedCircleId.set(null);
  }

  private emptyDraft() {
    return { id: null as string | null, name: '', description: '', lens: 'Feel' as WithinLens, requiresApproval: false, rules: '', status: 'Active' as CircleStatus, visibility: 'Public' as CircleVisibility };
  }
}
