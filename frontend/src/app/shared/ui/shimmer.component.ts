import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shimmer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="shimmer-base rounded-xl"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="radius"
      role="progressbar"
      aria-busy="true"
      aria-label="Loading..."
    ></div>
  `,
  styles: [`:host { display: block; }`],
})
export class ShimmerComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() radius = '0.75rem';
}
