import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShimmerComponent } from '../../ui/shimmer.component';

@Component({
  selector: 'app-job-card-skeleton',
  standalone: true,
  imports: [CommonModule, ShimmerComponent],
  template: `
    @for (i of items; track i) {
      <div class="glass rounded-2xl p-5 flex flex-col gap-4 shadow-glass">
        <div class="flex items-start gap-3">
          <app-shimmer width="40px" height="40px" radius="0.75rem" />
          <div class="flex-1 flex flex-col gap-2">
            <app-shimmer height="14px" width="60%" />
            <app-shimmer height="12px" width="40%" />
          </div>
        </div>
        <div class="flex gap-2">
          <app-shimmer height="24px" width="80px" />
          <app-shimmer height="24px" width="60px" />
          <app-shimmer height="24px" width="70px" />
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-glass">
          <app-shimmer height="12px" width="60px" />
          <app-shimmer height="24px" width="24px" radius="0.5rem" />
        </div>
      </div>
    }
  `,
})
export class JobCardSkeletonComponent {
  @Input() count = 6;
  get items(): number[] { return Array.from({ length: this.count }, (_, i) => i); }
}
