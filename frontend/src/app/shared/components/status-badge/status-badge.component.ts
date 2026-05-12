import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationStatus } from '../../../core/models/application.model';
import { JobOfferStatus } from '../../../core/models/job-offer.model';

type AnyStatus = ApplicationStatus | JobOfferStatus;

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" [style]="badgeStyle">
      <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" [style]="dotStyle" [class.animate-pulse]="status === 'PENDING'"></span>
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() set status(val: AnyStatus) {
    this._status = val;
    this.applyStyle(val);
  }
  get status(): AnyStatus { return this._status; }

  private _status: AnyStatus = 'PENDING';
  badgeStyle = '';
  dotStyle = '';
  label = '';

  private readonly config: Record<string, { bg: string; color: string; border: string; label: string }> = {
    PENDING:   { bg: 'rgba(234,179,8,0.12)',   color: '#FCD34D', border: 'rgba(234,179,8,0.25)',   label: 'Pending' },
    INTERVIEW: { bg: 'rgba(6,182,212,0.12)',    color: '#22D3EE', border: 'rgba(6,182,212,0.25)',   label: 'Interview' },
    ACCEPTED:  { bg: 'rgba(16,185,129,0.12)',   color: '#34D399', border: 'rgba(16,185,129,0.25)',  label: 'Accepted' },
    REJECTED:  { bg: 'rgba(239,68,68,0.12)',    color: '#F87171', border: 'rgba(239,68,68,0.25)',   label: 'Rejected' },
    PUBLISHED: { bg: 'rgba(16,185,129,0.12)',   color: '#34D399', border: 'rgba(16,185,129,0.25)',  label: 'Published' },
    DRAFT:     { bg: 'rgba(255,255,255,0.06)',  color: '#9CA3AF', border: 'rgba(255,255,255,0.12)', label: 'Draft' },
    CLOSED:    { bg: 'rgba(239,68,68,0.12)',    color: '#F87171', border: 'rgba(239,68,68,0.25)',   label: 'Closed' },
  };

  private applyStyle(s: AnyStatus): void {
    const c = this.config[s] ?? this.config['DRAFT'];
    this.label = c.label;
    this.badgeStyle = `background:${c.bg};color:${c.color};border:1px solid ${c.border}`;
    this.dotStyle = `background:${c.color}`;
  }
}
