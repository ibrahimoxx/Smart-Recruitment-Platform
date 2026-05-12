import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobOffer } from '../../../core/models/job-offer.model';
import { TiltCardDirective } from '../../ui/tilt-card.directive';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TiltCardDirective, StatusBadgeComponent, TimeAgoPipe],
  template: `
    <article
      appTiltCard
      [tiltMax]="8"
      class="glass glass-hover rounded-2xl p-5 flex flex-col gap-4 shadow-glass group cursor-pointer
             border border-glass hover:border-aurora-violet/30 transition-all duration-300"
      (click)="onCardClick()"
      [attr.aria-label]="job.title + ' at ' + (job.companyName || job.recruiterName)"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-3">
        <div class="w-10 h-10 rounded-xl glass-strong flex items-center justify-center flex-shrink-0 text-lg font-bold"
          style="background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2));">
          {{ companyInitial }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-white text-sm leading-tight truncate group-hover:text-aurora-violet-light transition-colors">
            {{ job.title }}
          </h3>
          <p class="text-xs text-white/50 mt-0.5 truncate">{{ job.companyName || job.recruiterName }}</p>
        </div>
        @if (showStatus) {
          <app-status-badge [status]="job.status" />
        }
      </div>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1.5">
        <span class="tag">{{ contractLabel }}</span>
        <span class="tag">{{ experienceLabel }}</span>
        @if (job.remote) { <span class="tag tag-green">Remote</span> }
        @if (job.location) { <span class="tag">{{ job.location }}</span> }
      </div>

      <!-- Salary -->
      @if (job.salaryMin || job.salaryMax) {
        <div class="flex items-center gap-1.5 text-aurora-emerald text-sm font-semibold">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ salaryDisplay }}
        </div>
      }

      <!-- Footer -->
      <div class="flex items-center justify-between mt-auto pt-3 border-t border-glass">
        <span class="text-xs text-white/30">{{ job.createdAt | timeAgo }}</span>
        @if (job.applicationCount !== undefined) {
          <span class="text-xs text-white/40 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ job.applicationCount }}
          </span>
        }
        <div class="w-6 h-6 rounded-lg glass flex items-center justify-center text-white/30
                    group-hover:text-aurora-violet group-hover:bg-aurora-violet/10 transition-all">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>

      <!-- Hover glow line -->
      <div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style="background: linear-gradient(90deg, #7C3AED, #EC4899, #06B6D4);">
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .tag {
      @apply px-2 py-0.5 rounded-lg text-xs text-white/50 font-medium;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .tag-green { color: #34D399; background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.2); }
  `],
})
export class JobCardComponent {
  @Input({ required: true }) job!: JobOffer;
  @Input() showStatus = false;
  @Output() cardClick = new EventEmitter<JobOffer>();

  get companyInitial(): string {
    return (this.job.companyName || this.job.recruiterName || '?')[0].toUpperCase();
  }

  get contractLabel(): string {
    const map: Record<string, string> = {
      FULL_TIME: 'Full-time', PART_TIME: 'Part-time',
      CONTRACT: 'Contract', INTERNSHIP: 'Internship', FREELANCE: 'Freelance',
    };
    return map[this.job.contractType] ?? this.job.contractType;
  }

  get experienceLabel(): string {
    const map: Record<string, string> = {
      JUNIOR: 'Junior', MID: 'Mid', SENIOR: 'Senior', LEAD: 'Lead', EXECUTIVE: 'Executive',
    };
    return map[this.job.experienceLevel] ?? this.job.experienceLevel;
  }

  get salaryDisplay(): string {
    const cur = this.job.currency ?? 'USD';
    if (this.job.salaryMin && this.job.salaryMax)
      return `${this.formatK(this.job.salaryMin)}–${this.formatK(this.job.salaryMax)} ${cur}`;
    if (this.job.salaryMin) return `From ${this.formatK(this.job.salaryMin)} ${cur}`;
    if (this.job.salaryMax) return `Up to ${this.formatK(this.job.salaryMax)} ${cur}`;
    return '';
  }

  private formatK(n: number): string {
    return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  }

  onCardClick(): void { this.cardClick.emit(this.job); }
}
