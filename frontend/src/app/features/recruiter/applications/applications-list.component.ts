import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { AiService } from '../../../core/services/ai.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { Application, ApplicationStatus } from '../../../core/models/application.model';
import { MatchScore, EmailDraft } from '../../../core/models/ai.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

type FilterStatus = ApplicationStatus | 'ALL';

const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING:   ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['ACCEPTED', 'REJECTED'],
  ACCEPTED:  [],
  REJECTED:  [],
};

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, TimeAgoPipe],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/recruiter/jobs" class="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-3xl font-black text-white mb-1">Applications</h1>
          <p class="text-white/40 text-sm">{{ total() }} applicant{{ total() !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-2 flex-wrap mb-6">
        @for (tab of tabs; track tab.value) {
          <button type="button" (click)="activeFilter.set(tab.value)"
            class="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
            [style]="activeFilter() === tab.value
              ? 'background:rgba(124,58,237,0.2);color:#A78BFA;border:1px solid rgba(124,58,237,0.4)'
              : 'background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.08)'">
            {{ tab.label }}
            @if (countOf(tab.value) > 0) {
              <span class="ml-1.5 px-1.5 py-0.5 rounded-md text-xs" style="background:rgba(255,255,255,0.08)">
                {{ countOf(tab.value) }}
              </span>
            }
          </button>
        }
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3]; track i) {
            <div class="h-24 rounded-2xl animate-pulse" style="background:rgba(255,255,255,0.04)"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <div class="flex flex-col items-center py-20 text-center">
          <p class="text-white/40 text-sm">No applications found.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (app of filtered(); track app.id) {
            <div class="glass rounded-2xl border border-glass transition-all duration-200"
              [class.border-aurora-violet]="expandedId() === app.id"
              [class.border-glass]="expandedId() !== app.id">

              <!-- Row header -->
              <div class="flex items-center gap-4 p-5 cursor-pointer group"
                (click)="toggleExpand(app)">
                <!-- Avatar -->
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style="background:linear-gradient(135deg,rgba(124,58,237,0.25),rgba(236,72,153,0.25))">
                  {{ app.candidateName[0].toUpperCase() }}
                </div>

                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-white text-sm">{{ app.candidateName }}</p>
                  <p class="text-xs text-white/40">{{ app.candidateEmail }} · {{ app.appliedAt | timeAgo }}</p>
                </div>

                <!-- Inline score gauge -->
                @if (scores()[app.id] !== undefined) {
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <div class="relative w-8 h-8">
                      <svg viewBox="0 0 32 32" class="w-8 h-8 -rotate-90">
                        <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>
                        <circle cx="16" cy="16" r="12" fill="none"
                          [attr.stroke]="scoreColor(scores()[app.id])"
                          stroke-width="3" stroke-linecap="round"
                          [attr.stroke-dasharray]="'75.4'"
                          [attr.stroke-dashoffset]="75.4 - (75.4 * scores()[app.id] / 100)"/>
                      </svg>
                      <span class="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white rotate-90">
                        {{ scores()[app.id] }}
                      </span>
                    </div>
                    <span class="text-xs text-white/40 hidden sm:block">match</span>
                  </div>
                } @else {
                  <div class="flex-shrink-0">
                    <button type="button" (click)="loadScore(app.id, $event)"
                      class="text-xs text-aurora-violet/70 hover:text-aurora-violet transition-colors">
                      Load score
                    </button>
                  </div>
                }

                <app-status-badge [status]="app.status" />

                <!-- Expand chevron -->
                <svg class="w-4 h-4 text-white/30 transition-transform flex-shrink-0"
                  [class.rotate-180]="expandedId() === app.id"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>

              <!-- Expanded panel -->
              @if (expandedId() === app.id) {
                <div class="border-t border-glass px-5 pb-5 space-y-5 animate-fade-in-up">

                  <!-- Cover letter -->
                  @if (app.coverLetter) {
                    <div class="pt-5">
                      <p class="text-xs text-white/30 uppercase tracking-wider mb-2">Cover letter</p>
                      <p class="text-sm text-white/70 leading-relaxed">{{ app.coverLetter }}</p>
                    </div>
                  }

                  <!-- AI score details -->
                  @if (scoreDetails()[app.id]) {
                    <div class="glass rounded-xl p-4 border border-glass">
                      <p class="text-xs text-white/30 uppercase tracking-wider mb-3">AI Match Analysis</p>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <p class="text-xs text-aurora-emerald mb-2">Matched skills</p>
                          <div class="flex flex-wrap gap-1.5">
                            @for (skill of scoreDetails()[app.id].matchedSkills; track skill) {
                              <span class="px-2 py-0.5 rounded-lg text-xs font-medium"
                                style="background:rgba(16,185,129,0.1);color:#34D399;border:1px solid rgba(16,185,129,0.2)">
                                {{ skill }}
                              </span>
                            }
                          </div>
                        </div>
                        <div>
                          <p class="text-xs text-red-400 mb-2">Missing skills</p>
                          <div class="flex flex-wrap gap-1.5">
                            @for (skill of scoreDetails()[app.id].missingSkills; track skill) {
                              <span class="px-2 py-0.5 rounded-lg text-xs font-medium"
                                style="background:rgba(239,68,68,0.1);color:#F87171;border:1px solid rgba(239,68,68,0.2)">
                                {{ skill }}
                              </span>
                            }
                          </div>
                        </div>
                      </div>
                      @if (scoreDetails()[app.id].reasoning) {
                        <p class="text-xs text-white/40 mt-3 leading-relaxed">{{ scoreDetails()[app.id].reasoning }}</p>
                      }
                    </div>
                  }

                  <!-- Status actions + email draft -->
                  <div class="flex flex-wrap items-center gap-3">
                    @for (nextStatus of transitions(app.status); track nextStatus) {
                      <button type="button" (click)="changeStatus(app, nextStatus)"
                        class="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                        [style]="transitionStyle(nextStatus)">
                        {{ transitionLabel(nextStatus) }}
                      </button>
                    }
                    <button type="button" (click)="loadEmailDraft(app.id)"
                      class="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                      style="background:rgba(124,58,237,0.1);color:#A78BFA;border:1px solid rgba(124,58,237,0.2)">
                      View email draft
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Email draft modal -->
    @if (emailDraftApp()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div class="absolute inset-0" style="background:rgba(10,10,15,0.85);backdrop-filter:blur(8px)"
          (click)="emailDraftApp.set(null)"></div>
        <div class="relative w-full max-w-xl glass-strong rounded-2xl p-6 shadow-glass-lg animate-scale-in max-h-[80vh] overflow-y-auto">
          <div class="flex items-start justify-between mb-5">
            <div>
              <h3 class="text-base font-bold text-white">AI Email Draft</h3>
              @if (emailDrafts()[emailDraftApp()!]) {
                <div class="flex gap-2 mt-1.5">
                  <span class="px-2 py-0.5 rounded-md text-xs font-medium"
                    style="background:rgba(124,58,237,0.15);color:#A78BFA">
                    {{ emailDrafts()[emailDraftApp()!].draftType }}
                  </span>
                  <span class="px-2 py-0.5 rounded-md text-xs text-white/40"
                    style="background:rgba(255,255,255,0.05)">
                    {{ emailDrafts()[emailDraftApp()!].tone }}
                  </span>
                </div>
              }
            </div>
            <button type="button" (click)="emailDraftApp.set(null)"
              class="p-2 rounded-xl text-white/40 hover:text-white transition-all">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          @if (loadingDraft()) {
            <div class="animate-pulse space-y-3">
              <div class="h-4 w-2/3 rounded bg-white/[0.06]"></div>
              <div class="h-32 rounded bg-white/[0.04]"></div>
            </div>
          } @else if (emailDrafts()[emailDraftApp()!]) {
            <div class="space-y-4">
              <div>
                <p class="text-xs text-white/30 mb-1">Subject</p>
                <p class="text-sm font-semibold text-white">{{ emailDrafts()[emailDraftApp()!].subject }}</p>
              </div>
              <div>
                <p class="text-xs text-white/30 mb-2">Body</p>
                <div class="p-4 rounded-xl text-sm text-white/70 leading-relaxed whitespace-pre-wrap"
                  style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
                  {{ emailDrafts()[emailDraftApp()!].body }}
                </div>
              </div>
              <div class="flex gap-3 pt-2">
                <button type="button" (click)="copyEmail()"
                  class="flex-1 btn-glass py-2.5 text-sm flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  {{ copied() ? 'Copied!' : 'Copy' }}
                </button>
                <a [href]="mailtoLink()" class="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                  Open in email client
                </a>
              </div>
            </div>
          } @else {
            <p class="text-sm text-white/40 text-center py-8">No draft available for this application yet.</p>
          }
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`],
})
export class ApplicationsListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private appService = inject(ApplicationService);
  private aiService = inject(AiService);
  private toast = inject(ToastService);

  jobId = signal<string | null>(null);
  applications = signal<Application[]>([]);
  loading = signal(true);
  total = signal(0);
  activeFilter = signal<FilterStatus>('ALL');
  expandedId = signal<string | null>(null);

  scores = signal<Record<string, number>>({});
  scoreDetails = signal<Record<string, MatchScore>>({});
  emailDraftApp = signal<string | null>(null);
  emailDrafts = signal<Record<string, EmailDraft>>({});
  loadingDraft = signal(false);
  copied = signal(false);

  tabs: { label: string; value: FilterStatus }[] = [
    { label: 'All',       value: 'ALL' },
    { label: 'Pending',   value: 'PENDING' },
    { label: 'Interview', value: 'INTERVIEW' },
    { label: 'Accepted',  value: 'ACCEPTED' },
    { label: 'Rejected',  value: 'REJECTED' },
  ];

  filtered = computed(() => {
    const f = this.activeFilter();
    return f === 'ALL' ? this.applications() : this.applications().filter(a => a.status === f);
  });

  countOf(f: FilterStatus): number {
    return f === 'ALL' ? this.applications().length : this.applications().filter(a => a.status === f).length;
  }

  transitions(status: ApplicationStatus): ApplicationStatus[] {
    return TRANSITIONS[status] ?? [];
  }

  transitionLabel(status: ApplicationStatus): string {
    const map: Partial<Record<ApplicationStatus, string>> = {
      INTERVIEW: 'Move to Interview', ACCEPTED: 'Accept', REJECTED: 'Reject',
    };
    return map[status] ?? status;
  }

  transitionStyle(status: ApplicationStatus): string {
    const styles: Record<string, string> = {
      INTERVIEW: 'background:rgba(99,102,241,0.15);color:#818CF8;border:1px solid rgba(99,102,241,0.3)',
      ACCEPTED:  'background:rgba(16,185,129,0.15);color:#34D399;border:1px solid rgba(16,185,129,0.3)',
      REJECTED:  'background:rgba(239,68,68,0.12);color:#F87171;border:1px solid rgba(239,68,68,0.25)',
    };
    return styles[status] ?? '';
  }

  scoreColor(score: number): string {
    if (score >= 70) return '#34D399';
    if (score >= 40) return '#FCD34D';
    return '#F87171';
  }

  mailtoLink = computed(() => {
    const id = this.emailDraftApp();
    if (!id) return '#';
    const draft = this.emailDrafts()[id];
    if (!draft) return '#';
    return `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
  });

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    this.jobId.set(jobId);
    if (jobId) {
      this.appService.getByJob(jobId).subscribe({
        next: res => {
          const data = res.data as unknown as { content: Application[]; totalElements: number };
          this.applications.set(data.content ?? []);
          this.total.set(data.totalElements ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  toggleExpand(app: Application): void {
    const id = this.expandedId() === app.id ? null : app.id;
    this.expandedId.set(id);
    if (id && this.scores()[id] === undefined) this.loadScoreSilent(id);
  }

  loadScore(appId: string, e: Event): void {
    e.stopPropagation();
    this.loadScoreSilent(appId);
  }

  private loadScoreSilent(appId: string): void {
    this.aiService.getMatchScore(appId).subscribe({
      next: res => {
        this.scores.update(s => ({ ...s, [appId]: res.data.score }));
        this.scoreDetails.update(s => ({ ...s, [appId]: res.data }));
      },
      error: () => {},
    });
  }

  loadEmailDraft(appId: string): void {
    this.emailDraftApp.set(appId);
    if (this.emailDrafts()[appId]) return;
    this.loadingDraft.set(true);
    this.aiService.getEmailDraft(appId).subscribe({
      next: res => {
        this.emailDrafts.update(d => ({ ...d, [appId]: res.data }));
        this.loadingDraft.set(false);
      },
      error: () => { this.loadingDraft.set(false); },
    });
  }

  changeStatus(app: Application, status: ApplicationStatus): void {
    this.appService.changeStatus(app.id, { newStatus: status }).subscribe({
      next: res => {
        this.applications.update(list => list.map(a => a.id === app.id ? res.data : a));
        this.toast.success(`Status updated to ${status.toLowerCase()}.`);
      },
      error: () => this.toast.error('Could not update status.'),
    });
  }

  copyEmail(): void {
    const id = this.emailDraftApp();
    if (!id) return;
    const draft = this.emailDrafts()[id];
    if (!draft) return;
    navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
