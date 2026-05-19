import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { JobOffer, JobOfferStatus } from '../../../core/models/job-offer.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

type StatusAction = { label: string; status: JobOfferStatus; style: string };

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, TimeAgoPipe],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-white mb-1">My Job Offers</h1>
          <p class="text-white/40 text-sm">{{ jobs().length }} job{{ jobs().length !== 1 ? 's' : '' }}</p>
        </div>
        <a routerLink="/recruiter/jobs/new"
          class="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Post a job
        </a>
      </div>

      <!-- Status tabs -->
      <div class="flex gap-2 flex-wrap mb-6">
        @for (tab of statusTabs; track tab.value) {
          <button type="button" (click)="activeTab.set(tab.value)"
            class="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
            [style]="activeTab() === tab.value
              ? 'background:rgba(124,58,237,0.2);color:#A78BFA;border:1px solid rgba(124,58,237,0.4)'
              : 'background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.08)'">
            {{ tab.label }}
            <span class="ml-1.5 px-1.5 py-0.5 rounded-md text-xs" style="background:rgba(255,255,255,0.08)">
              {{ countOf(tab.value) }}
            </span>
          </button>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="h-48 rounded-2xl animate-pulse" style="background:rgba(255,255,255,0.04)"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2)">
            <svg class="w-8 h-8 text-aurora-violet/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <p class="text-white/40 mb-4">No jobs here yet.</p>
          <a routerLink="/recruiter/jobs/new" class="btn-primary text-sm px-5 py-2">Post your first job</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (job of filtered(); track job.id) {
            <div class="glass rounded-2xl border border-glass hover:border-aurora-violet/20 transition-all duration-300 p-5 flex flex-col gap-4 group relative">
              <!-- Top row -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-white text-sm leading-tight truncate">{{ job.title }}</h3>
                  <p class="text-xs text-white/40 mt-0.5">
                    {{ job.applicationCount ?? 0 }} applicant{{ (job.applicationCount ?? 0) !== 1 ? 's' : '' }}
                    · {{ job.createdAt | timeAgo }}
                  </p>
                </div>
                <app-status-badge [status]="job.status" />
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5">
                <span class="tag">{{ contractLabel(job) }}</span>
                <span class="tag">{{ expLabel(job) }}</span>
                <span class="tag tag-green">{{ workModeLabel(job) }}</span>
              </div>

              <!-- Salary -->
              @if (job.salaryMin || job.salaryMax) {
                <p class="text-sm text-aurora-emerald font-semibold">{{ salaryDisplay(job) }}</p>
              }

              <!-- Actions -->
              <div class="flex items-center gap-2 mt-auto pt-3 border-t border-glass">
                <a [routerLink]="['/recruiter/jobs', job.id, 'applications']"
                  class="flex-1 text-center text-xs btn-glass py-2">
                  View applications
                </a>
                <a [routerLink]="['/recruiter/jobs', job.id, 'edit']"
                  class="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-all" title="Edit">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </a>
                <div class="relative">
                  <button type="button" (click)="toggleMenu(job.id)"
                    class="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-all" title="More">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>
                  @if (openMenu() === job.id) {
                    <div class="absolute right-0 bottom-full mb-2 w-44 glass-strong rounded-xl shadow-glass-lg overflow-hidden animate-scale-in z-20" role="menu">
                      @for (action of statusActions(job.status); track action.status) {
                        <button type="button" (click)="changeStatus(job, action.status)"
                          class="w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.06]"
                          [style]="action.style" role="menuitem">
                          {{ action.label }}
                        </button>
                      }
                      <div class="border-t border-glass"></div>
                      <button type="button" (click)="confirmDelete(job)"
                        class="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors" role="menuitem">
                        Delete job
                      </button>
                    </div>
                  }
                </div>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style="background:linear-gradient(90deg,#7C3AED,#EC4899,#06B6D4)"></div>
            </div>
          }
        </div>
      }
    </div>

    @if (deleteTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div class="absolute inset-0" style="background:rgba(10,10,15,0.85);backdrop-filter:blur(8px)"
          (click)="deleteTarget.set(null)"></div>
        <div class="relative w-full max-w-sm glass-strong rounded-2xl p-6 animate-scale-in">
          <h3 class="text-base font-bold text-white mb-2">Delete job offer?</h3>
          <p class="text-sm text-white/50 mb-6">
            <strong class="text-white/80">{{ deleteTarget()!.title }}</strong> and all its applications will be permanently deleted.
          </p>
          <div class="flex gap-3">
            <button type="button" (click)="deleteTarget.set(null)" class="flex-1 btn-glass py-2.5 text-sm">Cancel</button>
            <button type="button" (click)="executeDelete()"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
              style="background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3)">
              Delete
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .tag {
      @apply px-2 py-0.5 rounded-lg text-xs text-white/50 font-medium;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .tag-green { color: #34D399; background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.2); }
  `],
})
export class MyJobsComponent implements OnInit {
  private jobService = inject(JobService);
  private toast = inject(ToastService);
  private router = inject(Router);

  jobs = signal<JobOffer[]>([]);
  loading = signal(true);
  activeTab = signal<JobOfferStatus | 'ALL'>('ALL');
  openMenu = signal<string | null>(null);
  deleteTarget = signal<JobOffer | null>(null);

  statusTabs = [
    { label: 'All',       value: 'ALL' as const },
    { label: 'Published', value: 'PUBLISHED' as const },
    { label: 'Draft',     value: 'DRAFT' as const },
    { label: 'Closed',    value: 'CLOSED' as const },
  ];

  filtered = computed(() => {
    const t = this.activeTab();
    return t === 'ALL' ? this.jobs() : this.jobs().filter(j => j.status === t);
  });

  countOf(status: JobOfferStatus | 'ALL'): number {
    return status === 'ALL' ? this.jobs().length : this.jobs().filter(j => j.status === status).length;
  }

  statusActions(current: JobOfferStatus): StatusAction[] {
    const all: Record<JobOfferStatus, StatusAction> = {
      PUBLISHED: { label: 'Publish',       status: 'PUBLISHED', style: 'color:#34D399' },
      DRAFT:     { label: 'Move to Draft', status: 'DRAFT',     style: 'color:rgba(255,255,255,0.6)' },
      CLOSED:    { label: 'Close',         status: 'CLOSED',    style: 'color:#F87171' },
    };
    return (Object.values(all) as StatusAction[]).filter(a => a.status !== current);
  }

  contractLabel(j: JobOffer): string {
    return ({ CDI: 'CDI', CDD: 'CDD', PART_TIME: 'Part-time', INTERNSHIP: 'Internship', FREELANCE: 'Freelance' })[j.contractType] ?? j.contractType;
  }

  expLabel(j: JobOffer): string {
    return ({ JUNIOR: 'Junior', MID: 'Mid', SENIOR: 'Senior', LEAD: 'Lead' })[j.experienceLevel] ?? j.experienceLevel;
  }

  workModeLabel(j: JobOffer): string {
    return ({ REMOTE: '🌐 Remote', HYBRID: '🏠 Hybrid', ON_SITE: '🏢 On-site' })[j.workMode] ?? j.workMode;
  }

  salaryDisplay(j: JobOffer): string {
    const cur = j.currency ?? 'USD';
    const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
    if (j.salaryMin && j.salaryMax) return `${fmt(j.salaryMin)}–${fmt(j.salaryMax)} ${cur}`;
    if (j.salaryMin) return `From ${fmt(j.salaryMin)} ${cur}`;
    if (j.salaryMax) return `Up to ${fmt(j.salaryMax)} ${cur}`;
    return '';
  }

  ngOnInit(): void {
    this.jobService.list({ size: 100 }).subscribe({
      next: res => {
        const data = res.data as unknown as { content: JobOffer[] };
        this.jobs.set(data.content ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleMenu(id: string): void { this.openMenu.set(this.openMenu() === id ? null : id); }

  changeStatus(job: JobOffer, status: JobOfferStatus): void {
    this.openMenu.set(null);
    this.jobService.changeStatus(job.id, status).subscribe({
      next: res => {
        this.jobs.update(list => list.map(j => j.id === job.id ? res.data : j));
        this.toast.success(`Job ${status.toLowerCase()}.`);
      },
      error: () => this.toast.error('Could not change status.'),
    });
  }

  confirmDelete(job: JobOffer): void { this.openMenu.set(null); this.deleteTarget.set(job); }

  executeDelete(): void {
    const job = this.deleteTarget();
    if (!job) return;
    this.jobService.delete(job.id).subscribe({
      next: () => {
        this.jobs.update(list => list.filter(j => j.id !== job.id));
        this.deleteTarget.set(null);
        this.toast.success('Job deleted.');
      },
      error: () => { this.deleteTarget.set(null); this.toast.error('Could not delete job.'); },
    });
  }
}
