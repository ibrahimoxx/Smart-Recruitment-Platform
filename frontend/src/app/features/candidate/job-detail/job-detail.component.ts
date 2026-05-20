import {
  Component, inject, signal, computed, OnInit, OnDestroy, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfettiService } from '../../../shared/ui/confetti.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { JobOffer } from '../../../core/models/job-offer.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { JobCardComponent } from '../../../shared/components/job-card/job-card.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { GlassTextareaComponent } from '../../../shared/ui/glass-textarea.component';
import { MagneticButtonComponent } from '../../../shared/ui/magnetic-button.component';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    StatusBadgeComponent, JobCardComponent, TimeAgoPipe,
    GlassTextareaComponent, MagneticButtonComponent,
  ],
  template: `
    <div class="min-h-screen">

      <!-- ── Hero ── -->
      <section class="relative overflow-hidden pt-8 pb-16">
        <!-- Background orbs -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-aurora-pulse"
            style="background: radial-gradient(circle, #7C3AED, transparent 70%)"></div>
          <div class="absolute -top-20 right-20 w-72 h-72 rounded-full opacity-15 blur-3xl"
            style="background: radial-gradient(circle, #EC4899, transparent 70%); animation: aurora-pulse 5s ease-in-out infinite 1s"></div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <!-- Breadcrumb -->
          <nav class="flex items-center gap-2 text-sm text-white/40 mb-8" aria-label="Breadcrumb">
            <a routerLink="/jobs" class="hover:text-white/70 transition-colors">Jobs</a>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span class="text-white/70 truncate max-w-[200px]">{{ job()?.title ?? '…' }}</span>
          </nav>

          @if (loading()) {
            <!-- Skeleton -->
            <div class="animate-pulse space-y-4">
              <div class="h-8 w-2/3 rounded-xl bg-white/[0.08]"></div>
              <div class="h-5 w-1/3 rounded-xl bg-white/[0.05]"></div>
              <div class="flex gap-2 mt-4">
                @for (i of [1,2,3]; track i) {
                  <div class="h-6 w-20 rounded-lg bg-white/[0.06]"></div>
                }
              </div>
            </div>
          } @else if (job()) {
            <div class="flex flex-col lg:flex-row lg:items-start gap-8">
              <!-- Left: Job info -->
              <div class="flex-1 min-w-0">
                <!-- Company + title -->
                <div class="flex items-start gap-4 mb-6">
                  <div class="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center text-2xl font-bold flex-shrink-0"
                    style="background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.25))">
                    {{ companyInitial() }}
                  </div>
                  <div>
                    <h1 class="text-3xl sm:text-4xl font-black text-white leading-tight mb-1">
                      {{ job()!.title }}
                    </h1>
                    <p class="text-lg text-white/50">
                      {{ job()!.companyName || job()!.recruiterFirstName + ' ' + job()!.recruiterLastName }}
                      @if (job()!.location) { <span class="mx-1.5 text-white/20">·</span> {{ job()!.location }} }
                    </p>
                  </div>
                </div>

                <!-- Tags row -->
                <div class="flex flex-wrap gap-2 mb-6">
                  <span class="tag">{{ contractLabel() }}</span>
                  <span class="tag">{{ experienceLabel() }}</span>
                  <span class="tag tag-green">{{ workModeLabel() }}</span>
                  @if (job()!.location) { <span class="tag">{{ job()!.location }}</span> }
                  <app-status-badge [status]="job()!.status" />
                </div>

                <!-- Salary -->
                @if (job()!.salaryMin || job()!.salaryMax) {
                  <div class="flex items-center gap-2 mb-6 text-aurora-emerald font-semibold text-xl">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ salaryDisplay() }}
                  </div>
                }

                <!-- Meta -->
                <div class="flex flex-wrap items-center gap-4 text-sm text-white/40 pb-6 border-b border-glass">
                  <span>Posted {{ job()!.createdAt | timeAgo }}</span>
                  @if (job()!.closesAt) {
                    <span class="flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      Closes {{ job()!.closesAt! | date:'mediumDate' }}
                    </span>
                  }
                  @if (job()!.applicationCount !== undefined) {
                    <span>{{ job()!.applicationCount }} applicants</span>
                  }
                </div>
              </div>

              <!-- Right: Sticky CTA (desktop) -->
              <div class="hidden lg:block w-72 flex-shrink-0">
                <div class="glass-strong rounded-2xl p-5 sticky top-24 shadow-glass-lg">
                  <p class="text-sm text-white/40 mb-4">
                    {{ job()!.companyName || job()!.recruiterFirstName + ' ' + job()!.recruiterLastName }}
                  </p>
                  @if (canApply()) {
                    <app-magnetic-button
                      variant="primary" size="lg" [fullWidth]="true"
                      (click)="openApplyModal()"
                    >Apply now</app-magnetic-button>
                  } @else if (!auth.isLoggedIn()) {
                    <a routerLink="/login"
                      [queryParams]="{ returnUrl: '/jobs/' + job()!.id }"
                      class="btn-primary text-sm px-4 py-3 w-full flex items-center justify-center gap-2">
                      Sign in to apply
                    </a>
                  } @else if (alreadyApplied()) {
                    <div class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-aurora-emerald"
                      style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2)">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Application submitted
                    </div>
                  } @else {
                    <div class="px-4 py-3 rounded-xl text-sm text-white/40"
                      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">
                      Applications closed
                    </div>
                  }
                  <p class="text-xs text-white/25 mt-3 text-center">No application fee</p>
                </div>
              </div>
            </div>
          } @else if (notFound()) {
            <div class="text-center py-16">
              <p class="text-white/40 text-lg">Job not found.</p>
              <a routerLink="/jobs" class="btn-glass mt-4 inline-block px-6 py-2 text-sm">Browse all jobs</a>
            </div>
          }
        </div>
      </section>

      @if (job()) {
        <!-- ── Body ── -->
        <section class="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
          <div class="flex flex-col lg:flex-row gap-8">

            <!-- Main content -->
            <div class="flex-1 min-w-0 space-y-8">

              <!-- Description -->
              <div class="glass rounded-2xl p-6 border border-glass">
                <h2 class="text-lg font-bold text-white mb-4">About the role</h2>
                <div class="prose-aurora" [innerHTML]="descriptionHtml()"></div>
              </div>

              <!-- Requirements -->
              @if (requirementLines().length) {
                <div class="glass rounded-2xl p-6 border border-glass">
                  <h2 class="text-lg font-bold text-white mb-4">Requirements</h2>
                  <ul class="space-y-3">
                    @for (req of requirementLines(); track req; let i = $index) {
                      <li class="flex items-start gap-3 text-white/70 text-sm leading-relaxed animate-fade-in-up"
                        [style]="'animation-delay:' + (i * 60) + 'ms'">
                        <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style="background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3)">
                          <svg class="w-2.5 h-2.5 text-aurora-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                        {{ req }}
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Mobile apply CTA -->
              <div class="lg:hidden glass-strong rounded-2xl p-5 border border-glass shadow-glass">
                @if (canApply()) {
                  <app-magnetic-button
                    variant="primary" size="lg" [fullWidth]="true"
                    (click)="openApplyModal()"
                  >Apply now</app-magnetic-button>
                } @else if (!auth.isLoggedIn()) {
                  <a routerLink="/login"
                    [queryParams]="{ returnUrl: '/jobs/' + job()!.id }"
                    class="btn-primary text-sm px-4 py-3 w-full flex items-center justify-center">
                    Sign in to apply
                  </a>
                } @else if (alreadyApplied()) {
                  <div class="flex items-center justify-center gap-2 py-3 text-aurora-emerald text-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Application submitted
                  </div>
                } @else {
                  <p class="text-center text-sm text-white/40">Applications closed</p>
                }
              </div>
            </div>

            <!-- Sidebar details (desktop only) -->
            <div class="hidden lg:block w-72 flex-shrink-0 space-y-4">
              <div class="glass rounded-2xl p-5 border border-glass">
                <h3 class="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Details</h3>
                <dl class="space-y-3">
                  @for (detail of jobDetails(); track detail.label) {
                    <div>
                      <dt class="text-xs text-white/30 mb-0.5">{{ detail.label }}</dt>
                      <dd class="text-sm text-white/80 font-medium">{{ detail.value }}</dd>
                    </div>
                  }
                </dl>
              </div>
            </div>
          </div>

          <!-- Similar jobs -->
          @if (similarJobs().length) {
            <div class="mt-16">
              <h2 class="text-2xl font-bold text-white mb-6">Similar opportunities</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                @for (j of similarJobs(); track j.id) {
                  <app-job-card [job]="j" (cardClick)="goToJob(j.id)" />
                }
              </div>
            </div>
          }
        </section>
      }
    </div>

    <!-- ── Apply modal ── -->
    @if (applyModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        (click)="maybeCloseModal($event)"
        role="dialog" aria-modal="true" aria-labelledby="apply-modal-title">
        <!-- Backdrop -->
        <div class="absolute inset-0" style="background:rgba(10,10,15,0.8);backdrop-filter:blur(8px)"></div>

        <!-- Panel -->
        <div class="relative w-full max-w-lg glass-strong rounded-3xl p-6 shadow-glass-lg animate-scale-in">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 id="apply-modal-title" class="text-xl font-bold text-white">Apply for this role</h2>
              <p class="text-sm text-white/40 mt-0.5">{{ job()!.title }} · {{ job()!.companyName || job()!.recruiterFirstName + ' ' + job()!.recruiterLastName }}</p>
            </div>
            <button type="button" (click)="closeApplyModal()"
              class="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-all" aria-label="Close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form [formGroup]="applyForm" (ngSubmit)="submitApplication()" novalidate class="space-y-5">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-sm text-white/70 font-medium">
                  Cover letter <span class="text-white/30 font-normal">(optional)</span>
                </label>
                <span class="text-xs" [class.text-red-400]="coverLetterLength() > 2000"
                  [class.text-white/30]="coverLetterLength() <= 2000">
                  {{ coverLetterLength() }}/2000
                </span>
              </div>
              <app-glass-textarea
                formControlName="coverLetter"
                placeholder="Tell the recruiter why you're a great fit…"
                [rows]="5"
              />
            </div>

            @if (applyError()) {
              <div class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 animate-fade-in"
                style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2)" role="alert">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ applyError() }}
              </div>
            }

            <div class="flex gap-3">
              <button type="button" (click)="closeApplyModal()"
                class="flex-1 btn-glass py-3 text-sm">Cancel</button>
              <app-magnetic-button
                type="submit" variant="primary" size="md" [fullWidth]="false"
                [loading]="applying()"
                class="flex-1 block"
              >
                Submit application
                <span loading>Submitting…</span>
              </app-magnetic-button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ── Success modal ── -->
    @if (successModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
        <div class="absolute inset-0" style="background:rgba(10,10,15,0.85);backdrop-filter:blur(8px)"></div>
        <div class="relative w-full max-w-sm glass-strong rounded-3xl p-8 shadow-glass-lg animate-scale-in text-center">
          <!-- Aurora ring -->
          <div class="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style="background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(16,185,129,0.2));border:2px solid rgba(16,185,129,0.4)">
            <svg class="w-10 h-10 text-aurora-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 id="success-modal-title" class="text-2xl font-black text-white mb-2">Application sent!</h2>
          <p class="text-white/50 text-sm mb-8">
            You've applied to <strong class="text-white/80">{{ job()!.title }}</strong>.
            The recruiter will review your profile.
          </p>
          <div class="flex flex-col gap-3">
            <a routerLink="/candidate/applications"
              class="btn-primary py-3 text-sm flex items-center justify-center gap-2"
              (click)="closeSuccessModal()">
              View my applications
            </a>
            <button type="button" (click)="closeSuccessModal()"
              class="btn-glass py-3 text-sm">Continue browsing</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .tag {
      @apply px-3 py-1 rounded-lg text-xs font-medium text-white/60;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .tag-green { color: #34D399; background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.2); }
    .prose-aurora { @apply text-white/70 text-sm leading-relaxed space-y-3; }
    :host-context(html.light) .tag {
      color: rgba(10,10,30,0.65);
      background: rgba(10,10,30,0.05);
      border-color: rgba(10,10,30,0.10);
    }
    :host-context(html.light) .prose-aurora { color: rgba(10,10,30,0.72); }
    :host-context(html.light) .prose-aurora h1,
    :host-context(html.light) .prose-aurora h2,
    :host-context(html.light) .prose-aurora h3,
    :host-context(html.light) .prose-aurora strong { color: rgba(10,10,30,0.90); }
    :host-context(html.light) .prose-aurora li::marker { color: rgba(10,10,30,0.40); }
  `],
})
export class JobDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private appService = inject(ApplicationService);
  auth = inject(AuthService);
  private confetti = inject(ConfettiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  job = signal<JobOffer | null>(null);
  loading = signal(true);
  notFound = signal(false);
  similarJobs = signal<JobOffer[]>([]);
  alreadyApplied = signal(false);

  applyModalOpen = signal(false);
  successModalOpen = signal(false);
  applying = signal(false);
  applyError = signal('');

  applyForm = this.fb.group({
    coverLetter: ['', [Validators.maxLength(2000)]],
  });

  coverLetterLength = computed(() => this.applyForm.get('coverLetter')?.value?.length ?? 0);

  canApply = computed(() =>
    !!this.job() &&
    this.job()!.status === 'PUBLISHED' &&
    this.auth.isLoggedIn() &&
    this.auth.userRole() === 'CANDIDATE' &&
    !this.alreadyApplied()
  );

  companyInitial = computed(() =>
    (this.job()?.companyName || this.job()?.recruiterFirstName || '?')[0].toUpperCase()
  );

  contractLabel = computed(() => {
    const map: Record<string, string> = {
      CDI: 'CDI', CDD: 'CDD', PART_TIME: 'Part-time',
      INTERNSHIP: 'Internship', FREELANCE: 'Freelance',
    };
    return map[this.job()?.contractType ?? ''] ?? '';
  });

  experienceLabel = computed(() => {
    const map: Record<string, string> = {
      JUNIOR: 'Junior', MID: 'Mid-level', SENIOR: 'Senior',
      LEAD: 'Lead',
    };
    return map[this.job()?.experienceLevel ?? ''] ?? '';
  });

  workModeLabel = computed(() => {
    const map: Record<string, string> = { REMOTE: '🌐 Remote', HYBRID: '🏠 Hybrid', ON_SITE: '🏢 On-site' };
    return map[this.job()?.workMode ?? ''] ?? '';
  });

  salaryDisplay = computed(() => {
    const j = this.job();
    if (!j) return '';
    const cur = j.currency ?? 'USD';
    const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
    if (j.salaryMin && j.salaryMax) return `${fmt(j.salaryMin)}–${fmt(j.salaryMax)} ${cur}/yr`;
    if (j.salaryMin) return `From ${fmt(j.salaryMin)} ${cur}/yr`;
    if (j.salaryMax) return `Up to ${fmt(j.salaryMax)} ${cur}/yr`;
    return '';
  });

  descriptionHtml = computed(() => {
    const desc = this.job()?.description ?? '';
    return desc.replace(/\n/g, '<br>');
  });

  requirementLines = computed(() => {
    const req = this.job()?.requirements ?? '';
    return req.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  });

  jobDetails = computed(() => {
    const j = this.job();
    if (!j) return [];
    const items: { label: string; value: string }[] = [
      { label: 'Contract', value: this.contractLabel() },
      { label: 'Experience', value: this.experienceLabel() },
      { label: 'Location', value: j.location || 'Not specified' },
      { label: 'Remote', value: j.remote ? 'Yes' : 'No' },
    ];
    if (j.closesAt) {
      items.push({ label: 'Deadline', value: new Date(j.closesAt).toLocaleDateString() });
    }
    return items;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadJob(id);
    });
  }

  ngOnDestroy(): void {}

  private loadJob(id: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.jobService.getById(id).subscribe({
      next: res => {
        this.job.set(res.data);
        this.loading.set(false);
        this.loadSimilar(id);
        if (this.auth.userRole() === 'CANDIDATE') {
          this.appService.hasApplied(id).subscribe({
            next: r => this.alreadyApplied.set(r.data),
            error: () => {},
          });
        }
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }

  private loadSimilar(id: string): void {
    this.jobService.getSimilar(id).subscribe({
      next: res => this.similarJobs.set(res.data ?? []),
      error: () => {},
    });
  }

  openApplyModal(): void {
    this.applyForm.reset();
    this.applyError.set('');
    this.applyModalOpen.set(true);
  }

  closeApplyModal(): void { this.applyModalOpen.set(false); }

  closeSuccessModal(): void { this.successModalOpen.set(false); }

  maybeCloseModal(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('fixed')) this.closeApplyModal();
  }

  submitApplication(): void {
    if (this.applyForm.invalid || !this.job()) return;
    this.applying.set(true);
    this.applyError.set('');

    const coverLetter = this.applyForm.value.coverLetter?.trim() || undefined;

    this.appService.apply({ jobOfferId: this.job()!.id, coverLetter }).subscribe({
      next: () => {
        this.applying.set(false);
        this.applyModalOpen.set(false);
        this.alreadyApplied.set(true);
        this.successModalOpen.set(true);
        this.confetti.celebrate();
        this.toast.success('Application submitted!', 'Good luck!');
      },
      error: (err: unknown) => {
        this.applying.set(false);
        const msg = this.extractError(err);
        this.applyError.set(msg);
      },
    });
  }

  goToJob(id: string): void {
    this.router.navigate(['/jobs', id]);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.applyModalOpen()) this.closeApplyModal();
    if (this.successModalOpen()) this.closeSuccessModal();
  }

  private extractError(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const e = (err as { error?: { message?: string } }).error;
      return e?.message ?? 'Failed to submit application.';
    }
    return 'Failed to submit application.';
  }
}
