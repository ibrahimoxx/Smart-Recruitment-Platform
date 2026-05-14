import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AdminDashboard } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-3xl font-black text-white mb-1">Platform Overview</h1>
        <p class="text-white/40 text-sm">Global analytics across all users and jobs</p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-32 rounded-2xl animate-pulse" style="background:rgba(255,255,255,0.04)"></div>
          }
        </div>
      } @else if (data()) {
        <!-- ── Hero stat tiles ── -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          @for (tile of statTiles(); track tile.label) {
            <div class="glass rounded-2xl p-5 border border-glass relative overflow-hidden group hover:border-aurora-violet/20 transition-all">
              <p class="text-xs text-white/40 uppercase tracking-wider mb-2">{{ tile.label }}</p>
              <p class="text-3xl font-black text-white mb-1">{{ tile.value }}</p>
              @if (tile.sub) {
                <p class="text-xs text-white/30">{{ tile.sub }}</p>
              }
              <!-- Glow -->
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                [style]="'background:radial-gradient(circle at 30% 50%,' + tile.glow + ',transparent 70%)'"></div>
            </div>
          }
        </div>

        <!-- ── Charts row ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <!-- Jobs by status — donut -->
          <div class="glass rounded-2xl p-6 border border-glass">
            <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider mb-5">Jobs by status</h2>
            <div class="flex items-center gap-6">
              <svg viewBox="0 0 120 120" class="w-28 h-28 flex-shrink-0 -rotate-90"
                role="img" aria-labelledby="donut-title">
                <title id="donut-title">Jobs by status donut chart</title>
                @for (seg of jobsDonut(); track seg.status; let i = $index) {
                  <circle cx="60" cy="60" r="44"
                    fill="none"
                    [attr.stroke]="seg.color"
                    stroke-width="18"
                    [attr.stroke-dasharray]="'276.5'"
                    [attr.stroke-dashoffset]="seg.offset"
                    [attr.opacity]="seg.value > 0 ? 1 : 0"
                    [attr.aria-label]="seg.status + ': ' + seg.value"
                  />
                }
              </svg>
              <div class="space-y-2 flex-1">
                @for (seg of jobsDonut(); track seg.status) {
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" [style]="'background:' + seg.color"></div>
                    <span class="text-xs text-white/50">{{ seg.status }}</span>
                    <span class="ml-auto text-xs font-bold text-white">{{ seg.value }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Applications by status — stacked bar -->
          <div class="glass rounded-2xl p-6 border border-glass" role="region" aria-label="Applications by status">
            <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider mb-5">Applications by status</h2>
            <div class="space-y-3">
              @for (bar of appBars(); track bar.status) {
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-white/50">{{ bar.status }}</span>
                    <span class="text-xs font-bold text-white">{{ bar.value }}</span>
                  </div>
                  <div class="h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.06)">
                    <div class="h-full rounded-full transition-all duration-700"
                      [style]="'width:' + bar.pct + '%;background:' + bar.color">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- AI match score gauge -->
          <div class="glass rounded-2xl p-6 border border-glass flex flex-col items-center justify-center gap-4">
            <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider self-start w-full">Avg match score</h2>
            <div class="relative">
              <svg viewBox="0 0 120 80" class="w-36 h-24"
                role="img" [attr.aria-label]="'Average match score gauge: ' + avgScore() + ' out of 100'">
                <title>Average match score gauge</title>
                <!-- Track arc (180°) -->
                <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10" stroke-linecap="round"/>
                <!-- Value arc -->
                <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none"
                  [attr.stroke]="gaugeColor()"
                  stroke-width="10" stroke-linecap="round"
                  [attr.stroke-dasharray]="157"
                  [attr.stroke-dashoffset]="157 - (157 * avgScore() / 100)"
                  style="transition: stroke-dashoffset 1s ease-out"
                />
              </svg>
              <div class="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <p class="text-3xl font-black text-white leading-none">{{ avgScore() }}</p>
                <p class="text-xs text-white/30 mt-0.5">/ 100</p>
              </div>
            </div>
            <p class="text-xs text-white/30">across all applications</p>
          </div>
        </div>

        <!-- New applications last 7 days -->
        <div class="glass rounded-2xl p-6 border border-glass">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider">New applications (last 7 days)</h2>
            <span class="text-2xl font-black aurora-text">{{ data()!.newApplicationsLast7Days }}</span>
          </div>
          <p class="text-xs text-white/30">
            {{ data()!.newApplicationsLast7Days > 0 ? 'Activity detected this week' : 'No new applications this week' }}
          </p>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class AdminDashboardComponent implements OnInit {
  private dashService = inject(DashboardService);

  data = signal<AdminDashboard | null>(null);
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
    return [
      { label: 'Total users',   value: d.totalUsers,       sub: `${d.candidateCount} candidates · ${d.recruiterCount} recruiters`, glow: 'rgba(124,58,237,0.15)' },
      { label: 'Job offers',    value: d.totalJobOffers,   sub: null, glow: 'rgba(6,182,212,0.15)' },
      { label: 'Applications',  value: d.totalApplications, sub: null, glow: 'rgba(236,72,153,0.15)' },
      { label: 'Avg AI score',  value: d.avgMatchScore ? d.avgMatchScore.toFixed(1) : '—', sub: '/ 100', glow: 'rgba(16,185,129,0.15)' },
    ];
  });

  jobsDonut = computed(() => {
    const d = this.data();
    if (!d) return [];
    const statuses = [
      { status: 'PUBLISHED', color: '#34D399' },
      { status: 'DRAFT',     color: '#FCD34D' },
      { status: 'CLOSED',    color: '#6B7280' },
    ] as const;
    const total = Object.values(d.jobsByStatus).reduce((a, b) => a + b, 0) || 1;
    const circumference = 276.5;
    let accumulated = 0;
    return statuses.map(s => {
      const value = d.jobsByStatus[s.status] ?? 0;
      const pct = value / total;
      const offset = circumference * (1 - accumulated - pct);
      accumulated += pct;
      return { ...s, value, pct, offset: circumference - circumference * accumulated + circumference * pct };
    });
  });

  appBars = computed(() => {
    const d = this.data();
    if (!d) return [];
    const total = d.totalApplications || 1;
    return [
      { status: 'PENDING',   color: '#FCD34D', value: d.applicationsByStatus['PENDING']   ?? 0 },
      { status: 'INTERVIEW', color: '#818CF8', value: d.applicationsByStatus['INTERVIEW'] ?? 0 },
      { status: 'ACCEPTED',  color: '#34D399', value: d.applicationsByStatus['ACCEPTED']  ?? 0 },
      { status: 'REJECTED',  color: '#F87171', value: d.applicationsByStatus['REJECTED']  ?? 0 },
    ].map(b => ({ ...b, pct: Math.round((b.value / total) * 100) }));
  });

  ngOnInit(): void {
    this.dashService.getAdminDashboard().subscribe({
      next: res => { this.data.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
