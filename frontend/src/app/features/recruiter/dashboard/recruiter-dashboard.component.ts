import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { RecruiterDashboard, TopJob } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-3xl font-black text-white mb-1">
          Hello, {{ auth.currentUser()?.firstName ?? 'Recruiter' }} 👋
        </h1>
        <p class="text-white/40 text-sm">Your recruiting analytics at a glance</p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-28 rounded-2xl animate-pulse" style="background:rgba(255,255,255,0.04)"></div>
          }
        </div>
      } @else if (data()) {
        <!-- ── Stat tiles ── -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          @for (tile of statTiles(); track tile.label) {
            <div class="glass rounded-2xl p-5 border border-glass relative overflow-hidden group hover:border-aurora-violet/20 transition-all">
              <p class="text-xs text-white/40 uppercase tracking-wider mb-2">{{ tile.label }}</p>
              <p class="text-3xl font-black text-white mb-1">{{ tile.value }}</p>
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                [style]="'background:radial-gradient(circle at 30% 50%,' + tile.glow + ',transparent 70%)'"></div>
            </div>
          }
        </div>

        <!-- ── Charts row ── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          <!-- Applications by status -->
          <div class="glass rounded-2xl p-6 border border-glass">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider">Applications by status</h2>
              <a routerLink="/recruiter/jobs" class="text-xs text-aurora-violet hover:text-aurora-violet-light transition-colors">
                View jobs →
              </a>
            </div>
            <div class="space-y-3">
              @for (bar of appBars(); track bar.status) {
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-white/50">{{ bar.status }}</span>
                    <span class="text-xs font-bold text-white">{{ bar.value }}</span>
                  </div>
                  <div class="h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.06)">
                    <div class="h-full rounded-full transition-all duration-700"
                      [style]="'width:' + bar.pct + '%;background:' + bar.color"></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Avg match score gauge -->
          <div class="glass rounded-2xl p-6 border border-glass flex flex-col items-center justify-center gap-4">
            <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider self-start w-full">Avg AI match score</h2>
            <div class="relative">
              <svg viewBox="0 0 120 80" class="w-36 h-24">
                <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10" stroke-linecap="round"/>
                <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none"
                  [attr.stroke]="gaugeColor()"
                  stroke-width="10" stroke-linecap="round"
                  [attr.stroke-dasharray]="157"
                  [attr.stroke-dashoffset]="157 - (157 * avgScore() / 100)"
                  style="transition: stroke-dashoffset 1s ease-out"/>
              </svg>
              <div class="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <p class="text-3xl font-black text-white leading-none">{{ avgScore() }}</p>
                <p class="text-xs text-white/30 mt-0.5">/ 100</p>
              </div>
            </div>
            <p class="text-xs text-white/30">across your jobs</p>
          </div>
        </div>

        <!-- ── Top jobs by applications ── -->
        @if (data()!.topJobsByApplicationCount.length) {
          <div class="glass rounded-2xl p-6 border border-glass">
            <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider mb-5">Top jobs by applications</h2>
            <div class="space-y-3">
              @for (job of data()!.topJobsByApplicationCount; track job.jobTitle; let i = $index) {
                <div class="flex items-center gap-4">
                  <span class="text-xs font-bold text-white/20 w-5 text-right">{{ i + 1 }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-white/80 truncate mb-1">{{ job.jobTitle }}</p>
                    <div class="h-1.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.06)">
                      <div class="h-full rounded-full transition-all duration-700"
                        style="background:linear-gradient(90deg,#7C3AED,#EC4899)"
                        [style.width.%]="topJobPct(job)"></div>
                    </div>
                  </div>
                  <span class="text-xs font-bold text-white/60 flex-shrink-0">
                    {{ job.applicationCount }}
                  </span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Quick links -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <a routerLink="/recruiter/jobs/new"
            class="glass rounded-2xl p-5 border border-glass hover:border-aurora-violet/30 transition-all flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background:rgba(124,58,237,0.15)">
              <svg class="w-5 h-5 text-aurora-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-white group-hover:text-aurora-violet-light transition-colors">Post a new job</p>
              <p class="text-xs text-white/40">Attract top talent</p>
            </div>
          </a>
          <a routerLink="/recruiter/jobs"
            class="glass rounded-2xl p-5 border border-glass hover:border-aurora-cyan/30 transition-all flex items-center gap-4 group">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background:rgba(6,182,212,0.15)">
              <svg class="w-5 h-5 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-white group-hover:text-aurora-cyan transition-colors">Manage jobs</p>
              <p class="text-xs text-white/40">{{ data()!.myJobsTotal }} active listing{{ data()!.myJobsTotal !== 1 ? 's' : '' }}</p>
            </div>
          </a>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class RecruiterDashboardComponent implements OnInit {
  private dashService = inject(DashboardService);
  auth = inject(AuthService);

  data = signal<RecruiterDashboard | null>(null);
  loading = signal(true);

  avgScore = computed(() => Math.round(this.data()?.avgMatchScore ?? 0));

  gaugeColor = computed(() => {
    const s = this.avgScore();
    if (s >= 70) return '#34D399';
    if (s >= 40) return '#FCD34D';
    return '#F87171';
  });

  statTiles = computed(() => {
    const d = this.data();
    if (!d) return [];
    const published = d.myJobsByStatus['PUBLISHED'] ?? 0;
    const draft = d.myJobsByStatus['DRAFT'] ?? 0;
    return [
      { label: 'My jobs',      value: d.myJobsTotal,       glow: 'rgba(124,58,237,0.15)' },
      { label: 'Published',    value: published,           glow: 'rgba(16,185,129,0.15)' },
      { label: 'Applications', value: d.myApplicationsTotal, glow: 'rgba(6,182,212,0.15)' },
      { label: 'Avg score',    value: d.avgMatchScore ? d.avgMatchScore.toFixed(1) : '—', glow: 'rgba(236,72,153,0.15)' },
    ];
  });

  appBars = computed(() => {
    const d = this.data();
    if (!d) return [];
    const total = d.myApplicationsTotal || 1;
    return [
      { status: 'PENDING',   color: '#FCD34D', value: d.myApplicationsByStatus['PENDING']   ?? 0 },
      { status: 'INTERVIEW', color: '#818CF8', value: d.myApplicationsByStatus['INTERVIEW'] ?? 0 },
      { status: 'ACCEPTED',  color: '#34D399', value: d.myApplicationsByStatus['ACCEPTED']  ?? 0 },
      { status: 'REJECTED',  color: '#F87171', value: d.myApplicationsByStatus['REJECTED']  ?? 0 },
    ].map(b => ({ ...b, pct: Math.round((b.value / total) * 100) }));
  });

  maxApps = computed(() =>
    Math.max(1, ...(this.data()?.topJobsByApplicationCount ?? []).map((j: TopJob) => j.applicationCount))
  );

  topJobPct(job: TopJob): number {
    return Math.round((job.applicationCount / this.maxApps()) * 100);
  }

  ngOnInit(): void {
    this.dashService.getRecruiterDashboard().subscribe({
      next: res => { this.data.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
