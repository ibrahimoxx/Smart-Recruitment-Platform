import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { Application, ApplicationStatus } from '../../../core/models/application.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

type FilterStatus = ApplicationStatus | 'ALL';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, PaginationComponent, TimeAgoPipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-white mb-1">My Applications</h1>
          <p class="text-white/40 text-sm">{{ total() }} application{{ total() !== 1 ? 's' : '' }}</p>
        </div>
        <a routerLink="/jobs" class="btn-glass text-sm px-4 py-2 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Browse jobs
        </a>
      </div>

      <!-- Status filter tabs -->
      <div class="flex gap-2 flex-wrap mb-6">
        @for (tab of tabs; track tab.value) {
          <button type="button"
            (click)="setFilter(tab.value)"
            class="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
            [style]="activeFilter() === tab.value
              ? 'background:rgba(124,58,237,0.2);color:#A78BFA;border:1px solid rgba(124,58,237,0.4)'
              : 'background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.08)'"
          >
            {{ tab.label }}
            @if (tab.count() > 0) {
              <span class="ml-1.5 px-1.5 py-0.5 rounded-md text-xs"
                style="background:rgba(255,255,255,0.08)">
                {{ tab.count() }}
              </span>
            }
          </button>
        }
      </div>

      <!-- List -->
      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3]; track i) {
            <div class="h-28 rounded-2xl animate-pulse" style="background:rgba(255,255,255,0.04)"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2)">
            <svg class="w-8 h-8 text-aurora-violet/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="text-white/40 text-sm">No applications yet.</p>
          <a routerLink="/jobs" class="btn-primary mt-4 inline-block px-5 py-2 text-sm">
            Find your first job
          </a>
        </div>
      } @else {
        <div class="space-y-3">
          @for (app of filtered(); track app.id) {
            <div class="glass rounded-2xl border border-glass p-5 hover:border-aurora-violet/20 transition-all duration-200 animate-fade-in-up group">
              <div class="flex items-start gap-4">
                <!-- Company initial -->
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style="background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(236,72,153,0.2))">
                  {{ (app.companyName || app.jobTitle)[0].toUpperCase() }}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="font-semibold text-white text-sm group-hover:text-aurora-violet-light transition-colors">
                        {{ app.jobTitle }}
                      </h3>
                      @if (app.companyName) {
                        <p class="text-xs text-white/40 mt-0.5">{{ app.companyName }}</p>
                      }
                    </div>
                    <app-status-badge [status]="app.status" />
                  </div>

                  <!-- Timeline dots -->
                  <div class="flex items-center gap-2 mt-3">
                    @for (step of statusSteps; track step.status) {
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full transition-all"
                          [style]="statusReached(app.status, step.status)
                            ? 'background:' + step.color
                            : 'background:rgba(255,255,255,0.1)'">
                        </div>
                        <span class="text-xs"
                          [style]="statusReached(app.status, step.status)
                            ? 'color:' + step.color
                            : 'color:rgba(255,255,255,0.2)'">
                          {{ step.label }}
                        </span>
                        @if (!$last) {
                          <div class="w-6 h-px" style="background:rgba(255,255,255,0.08)"></div>
                        }
                      </div>
                    }
                  </div>

                  <!-- Dates -->
                  <div class="flex items-center gap-4 mt-3 text-xs text-white/30">
                    <span>Applied {{ app.appliedAt | timeAgo }}</span>
                    @if (app.reviewedAt) {
                      <span>Reviewed {{ app.reviewedAt | timeAgo }}</span>
                    }
                  </div>
                </div>

                <!-- Actions -->
                @if (app.status === 'PENDING') {
                  <button type="button"
                    (click)="withdraw(app)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Withdraw application">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                }
              </div>
            </div>
          }
        </div>

        @if (totalPages() > 1) {
          <div class="mt-8">
            <app-pagination
              [currentPage]="page()"
              [totalPages]="totalPages()"
              (pageChange)="onPageChange($event)"
            />
          </div>
        }
      }
    </div>

    <!-- Withdraw confirm modal -->
    @if (withdrawTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true">
        <div class="absolute inset-0" style="background:rgba(10,10,15,0.8);backdrop-filter:blur(8px)"
          (click)="withdrawTarget.set(null)"></div>
        <div class="relative w-full max-w-sm glass-strong rounded-2xl p-6 shadow-glass-lg animate-scale-in">
          <h3 class="text-base font-bold text-white mb-2">Withdraw application?</h3>
          <p class="text-sm text-white/50 mb-6">
            You're about to withdraw your application for
            <strong class="text-white/80">{{ withdrawTarget()!.jobTitle }}</strong>.
            This cannot be undone.
          </p>
          <div class="flex gap-3">
            <button type="button" (click)="withdrawTarget.set(null)"
              class="flex-1 btn-glass py-2.5 text-sm">Cancel</button>
            <button type="button" (click)="confirmWithdraw()"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style="background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3)"
              [class.opacity-50]="withdrawing()">
              @if (withdrawing()) { Withdrawing… } @else { Withdraw }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`],
})
export class MyApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private toast = inject(ToastService);

  applications = signal<Application[]>([]);
  loading = signal(true);
  page = signal(0);
  total = signal(0);
  totalPages = signal(0);
  activeFilter = signal<FilterStatus>('ALL');
  withdrawTarget = signal<Application | null>(null);
  withdrawing = signal(false);

  tabs: { label: string; value: FilterStatus; count: () => number }[] = [
    { label: 'All',       value: 'ALL',       count: () => this.applications().length },
    { label: 'Pending',   value: 'PENDING',   count: () => this.countOf('PENDING') },
    { label: 'Interview', value: 'INTERVIEW', count: () => this.countOf('INTERVIEW') },
    { label: 'Accepted',  value: 'ACCEPTED',  count: () => this.countOf('ACCEPTED') },
    { label: 'Rejected',  value: 'REJECTED',  count: () => this.countOf('REJECTED') },
  ];

  statusSteps: { status: ApplicationStatus; label: string; color: string }[] = [
    { status: 'PENDING',   label: 'Pending',   color: '#FCD34D' },
    { status: 'INTERVIEW', label: 'Interview', color: '#818CF8' },
    { status: 'ACCEPTED',  label: 'Accepted',  color: '#34D399' },
  ];

  filtered = computed(() => {
    const f = this.activeFilter();
    return f === 'ALL' ? this.applications() : this.applications().filter(a => a.status === f);
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.appService.myApplications(this.page(), 20).subscribe({
      next: res => {
        const paged = res.data as unknown as { content: Application[]; totalElements: number; totalPages: number };
        this.applications.set(paged.content ?? []);
        this.total.set(paged.totalElements ?? 0);
        this.totalPages.set(paged.totalPages ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setFilter(f: FilterStatus): void { this.activeFilter.set(f); }

  onPageChange(p: number): void { this.page.set(p); this.load(); }

  countOf(s: ApplicationStatus): number {
    return this.applications().filter(a => a.status === s).length;
  }

  statusReached(current: ApplicationStatus, step: ApplicationStatus): boolean {
    const order: ApplicationStatus[] = ['PENDING', 'INTERVIEW', 'ACCEPTED'];
    const ci = order.indexOf(current);
    const si = order.indexOf(step);
    if (current === 'REJECTED') return step === 'PENDING';
    return si <= ci;
  }

  withdraw(app: Application): void { this.withdrawTarget.set(app); }

  confirmWithdraw(): void {
    const app = this.withdrawTarget();
    if (!app) return;
    this.withdrawing.set(true);
    this.appService.withdraw(app.id).subscribe({
      next: () => {
        this.applications.update(list => list.filter(a => a.id !== app.id));
        this.total.update(v => v - 1);
        this.withdrawTarget.set(null);
        this.withdrawing.set(false);
        this.toast.success('Application withdrawn.');
      },
      error: () => {
        this.withdrawing.set(false);
        this.toast.error('Could not withdraw application.');
      },
    });
  }
}
