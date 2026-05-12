import { Component } from '@angular/core';
import { ShimmerComponent } from '../../ui/shimmer.component';

@Component({
  selector: 'app-detail-skeleton',
  standalone: true,
  imports: [ShimmerComponent],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">
      <app-shimmer height="200px" radius="1.5rem" />
      <div class="flex flex-col gap-3">
        <app-shimmer height="36px" width="70%" />
        <app-shimmer height="20px" width="40%" />
        <div class="flex gap-2 mt-2">
          <app-shimmer height="28px" width="90px" />
          <app-shimmer height="28px" width="70px" />
          <app-shimmer height="28px" width="80px" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        @for (i of lines; track i) {
          <app-shimmer height="14px" [width]="i % 3 === 2 ? '60%' : '100%'" />
        }
      </div>
    </div>
  `,
})
export class DetailSkeletonComponent {
  lines = Array.from({ length: 8 }, (_, i) => i);
}
