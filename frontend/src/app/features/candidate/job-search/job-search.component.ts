import {
  Component, inject, signal, computed, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { JobService } from '../../../core/services/job.service';
import { JobOffer, ContractType, ExperienceLevel, JobOfferFilter } from '../../../core/models/job-offer.model';
import { PagedResponse } from '../../../core/models/api-response.model';
import { JobCardComponent } from '../../../shared/components/job-card/job-card.component';
import { JobCardSkeletonComponent } from '../../../shared/components/loading-states/job-card-skeleton.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

interface ActiveFilter { key: string; label: string; }

@Component({
  selector: 'app-job-search',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    JobCardComponent, JobCardSkeletonComponent,
    PaginationComponent, EmptyStateComponent,
  ],
  template: `
    <!-- Hero -->
    <section class="relative pt-16 pb-12 px-4 overflow-hidden">
      <!-- Aurora mesh behind hero -->
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style="background:radial-gradient(ellipse,#7C3AED 0%,transparent 70%);filter:blur(60px)"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-aurora-violet/30 text-xs text-aurora-violet font-medium mb-6 animate-fade-in">
          <span class="w-1.5 h-1.5 rounded-full bg-aurora-violet animate-pulse"></span>
          {{ totalElements() }} opportunities available
        </div>

        <h1 class="text-5xl sm:text-6xl font-black leading-none tracking-tight mb-4 animate-fade-in-up">
          Find your<br>
          <span class="aurora-text">dream job</span>
        </h1>
        <p class="text-white/50 text-lg mb-10 animate-fade-in-up" style="animation-delay:0.1s">
          AI-matched roles from top companies, filtered for you.
        </p>

        <!-- Search bar -->
        <div class="relative max-w-2xl mx-auto animate-fade-in-up" style="animation-delay:0.15s">
          <div class="relative glass-strong rounded-2xl flex items-center shadow-glass-lg border border-glass hover:border-aurora-violet/30 transition-colors focus-within:border-aurora-violet/50">
            <svg class="w-5 h-5 text-white/30 ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="search"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search job title, company, or keyword…"
              class="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/30 outline-none text-sm"
              aria-label="Search jobs"
            />
            @if (searchQuery) {
              <button type="button" (click)="clearSearch()"
                class="p-2 mr-2 rounded-lg text-white/30 hover:text-white/70 transition-colors"
                aria-label="Clear search">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- Main content -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div class="flex gap-6 items-start">

        <!-- Sidebar filters -->
        <aside class="hidden lg:block w-64 flex-shrink-0 sticky top-20" aria-label="Job filters">
          <div class="glass rounded-2xl p-5 shadow-glass flex flex-col gap-6">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-white/80">Filters</h2>
              @if (hasActiveFilters()) {
                <button type="button" (click)="clearAllFilters()"
                  class="text-xs text-aurora-violet hover:text-aurora-violet-light transition-colors">
                  Clear all
                </button>
              }
            </div>

            <!-- Contract type -->
            <div>
              <h3 class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Contract</h3>
              <div class="flex flex-col gap-1.5">
                @for (ct of contractTypes; track ct.value) {
                  <button type="button"
                    (click)="toggleContractType(ct.value)"
                    class="filter-chip" [class.filter-chip-active]="filter.contractType === ct.value">
                    {{ ct.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Experience -->
            <div>
              <h3 class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Experience</h3>
              <div class="flex flex-col gap-1.5">
                @for (ex of experienceLevels; track ex.value) {
                  <button type="button"
                    (click)="toggleExperience(ex.value)"
                    class="filter-chip" [class.filter-chip-active]="filter.experienceLevel === ex.value">
                    {{ ex.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Remote -->
            <div>
              <h3 class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Work mode</h3>
              <button type="button"
                (click)="toggleRemote()"
                class="filter-chip w-full" [class.filter-chip-active]="filter.remote === true">
                🌐 Remote only
              </button>
            </div>

            <!-- Salary -->
            <div>
              <h3 class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Min salary</h3>
              <div class="flex items-center gap-2">
                <input
                  type="range" min="0" max="200000" step="5000"
                  [(ngModel)]="salaryMin"
                  (change)="onSalaryChange()"
                  class="salary-slider flex-1"
                  aria-label="Minimum salary"
                />
              </div>
              <p class="text-xs text-white/40 mt-1">
                {{ salaryMin > 0 ? '≥ ' + formatK(salaryMin) + ' USD' : 'Any salary' }}
              </p>
            </div>
          </div>
        </aside>

        <!-- Jobs list -->
        <div class="flex-1 min-w-0">

          <!-- Toolbar -->
          <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Mobile filter toggle (hidden on lg+) -->
              <button
                type="button"
                (click)="mobileFiltersOpen.set(true)"
                class="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl glass text-xs text-white/70 hover:text-white border border-glass transition-all"
                [class.border-aurora-violet/40]="hasActiveFilters()"
                [class.text-aurora-violet-light]="hasActiveFilters()"
                aria-label="Open filters"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                </svg>
                Filters
                @if (activeFilters().length > 0) {
                  <span class="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style="background:rgba(124,58,237,0.8);color:white">
                    {{ activeFilters().length }}
                  </span>
                }
              </button>

              <!-- Active filter pills -->
              @for (f of activeFilters(); track f.key) {
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium animate-scale-in"
                  style="background:rgba(124,58,237,0.15);color:#9B5CF6;border:1px solid rgba(124,58,237,0.3)">
                  {{ f.label }}
                  <button type="button" (click)="removeFilter(f.key)"
                    class="hover:text-white transition-colors" [attr.aria-label]="'Remove ' + f.label + ' filter'">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </span>
              }
            </div>

            <!-- Sort -->
            <div class="flex items-center gap-2 ml-auto">
              <label for="sort-select" class="text-xs text-white/40 whitespace-nowrap">Sort by</label>
              <select id="sort-select"
                [(ngModel)]="sortBy"
                (ngModelChange)="onSortChange()"
                class="glass text-xs text-white/70 rounded-lg px-2 py-1.5 border border-glass outline-none"
                style="background:rgba(255,255,255,0.05)">
                <option value="createdAt,desc" style="background:#12121C">Newest</option>
                <option value="createdAt,asc"  style="background:#12121C">Oldest</option>
                <option value="salaryMax,desc" style="background:#12121C">Salary ↓</option>
                <option value="title,asc"      style="background:#12121C">A–Z</option>
              </select>
            </div>
          </div>

          <!-- Grid -->
          @if (loading()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <app-job-card-skeleton [count]="6" />
            </div>
          } @else if (jobs().length === 0) {
            <app-empty-state
              title="No jobs found"
              description="Try adjusting your filters or search term"
              icon="search"
            />
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              @for (job of jobs(); track job.id) {
                <a [routerLink]="['/jobs', job.id]" class="block outline-none">
                  <app-job-card [job]="job" />
                </a>
              }
            </div>

            <div class="mt-10">
              <app-pagination
                [currentPage]="filter.page ?? 0"
                [totalPages]="totalPages()"
                (pageChange)="onPageChange($event)"
              />
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .filter-chip {
      @apply text-left px-3 py-2 rounded-xl text-xs text-white/50 transition-all duration-150;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
    }
    .filter-chip:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.08); }
    .filter-chip-active {
      color: #9B5CF6 !important;
      background: rgba(124,58,237,0.15) !important;
      border-color: rgba(124,58,237,0.35) !important;
    }
    .salary-slider {
      -webkit-appearance: none;
      height: 2px;
      background: rgba(255,255,255,0.1);
      border-radius: 1px;
      outline: none;
    }
    .salary-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px; height: 14px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7C3AED, #EC4899);
      cursor: pointer;
      box-shadow: 0 0 8px rgba(124,58,237,0.5);
    }
  `],
})
export class JobSearchComponent implements OnInit, OnDestroy {
  private jobService = inject(JobService);
  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  jobs = signal<JobOffer[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  totalPages = signal(0);

  searchQuery = '';
  sortBy = 'createdAt,desc';
  salaryMin = 0;

  filter: JobOfferFilter = { page: 0, size: 12 };

  contractTypes: { value: ContractType; label: string }[] = [
    { value: 'FULL_TIME',   label: '💼 Full-time' },
    { value: 'PART_TIME',   label: '⏰ Part-time' },
    { value: 'CONTRACT',    label: '📋 Contract' },
    { value: 'INTERNSHIP',  label: '🎓 Internship' },
    { value: 'FREELANCE',   label: '🚀 Freelance' },
  ];

  experienceLevels: { value: ExperienceLevel; label: string }[] = [
    { value: 'JUNIOR',    label: '🌱 Junior' },
    { value: 'MID',       label: '⚡ Mid-level' },
    { value: 'SENIOR',    label: '🔥 Senior' },
    { value: 'LEAD',      label: '👑 Lead' },
    { value: 'EXECUTIVE', label: '🎯 Executive' },
  ];

  activeFilters = computed<ActiveFilter[]>(() => {
    const f: ActiveFilter[] = [];
    if (this.filter.contractType)
      f.push({ key: 'contractType', label: this.contractTypes.find(c => c.value === this.filter.contractType)?.label ?? '' });
    if (this.filter.experienceLevel)
      f.push({ key: 'experienceLevel', label: this.experienceLevels.find(e => e.value === this.filter.experienceLevel)?.label ?? '' });
    if (this.filter.remote)
      f.push({ key: 'remote', label: '🌐 Remote' });
    if (this.filter.salaryMin && this.filter.salaryMin > 0)
      f.push({ key: 'salaryMin', label: `≥ ${this.formatK(this.filter.salaryMin)} USD` });
    if (this.filter.search)
      f.push({ key: 'search', label: `"${this.filter.search}"` });
    return f;
  });

  hasActiveFilters = computed(() => this.activeFilters().length > 0);

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(q => {
      this.filter = { ...this.filter, search: q || undefined, page: 0 };
      this.load();
    });
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(): void {
    this.loading.set(true);
    this.jobService.list(this.filter).subscribe({
      next: res => {
        const data = res.data as PagedResponse<JobOffer>;
        this.jobs.set(data.content);
        this.totalElements.set(data.totalElements);
        this.totalPages.set(data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(q: string): void { this.search$.next(q); }
  clearSearch(): void { this.searchQuery = ''; this.search$.next(''); }

  toggleContractType(ct: ContractType): void {
    this.filter = { ...this.filter, contractType: this.filter.contractType === ct ? undefined : ct, page: 0 };
    this.load();
  }

  toggleExperience(ex: ExperienceLevel): void {
    this.filter = { ...this.filter, experienceLevel: this.filter.experienceLevel === ex ? undefined : ex, page: 0 };
    this.load();
  }

  toggleRemote(): void {
    this.filter = { ...this.filter, remote: this.filter.remote ? undefined : true, page: 0 };
    this.load();
  }

  onSalaryChange(): void {
    this.filter = { ...this.filter, salaryMin: this.salaryMin > 0 ? this.salaryMin : undefined, page: 0 };
    this.load();
  }

  onSortChange(): void {
    this.filter = { ...this.filter, sort: this.sortBy, page: 0 };
    this.load();
  }

  onPageChange(page: number): void {
    this.filter = { ...this.filter, page };
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  removeFilter(key: string): void {
    const update: JobOfferFilter = { ...this.filter, page: 0 };
    if (key === 'contractType')   delete update.contractType;
    if (key === 'experienceLevel') delete update.experienceLevel;
    if (key === 'remote')         delete update.remote;
    if (key === 'salaryMin')      { delete update.salaryMin; this.salaryMin = 0; }
    if (key === 'search')         { delete update.search; this.searchQuery = ''; }
    this.filter = update;
    this.load();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.salaryMin = 0;
    this.sortBy = 'createdAt,desc';
    this.filter = { page: 0, size: 12 };
    this.load();
  }

  formatK(n: number): string {
    return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  }
}
