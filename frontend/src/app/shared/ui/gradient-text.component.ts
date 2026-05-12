import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gradient-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="aurora-text" [class]="extraClass">
      <ng-content />
    </span>
  `,
  styles: [`:host { display: inline; }`],
})
export class GradientTextComponent {
  @Input() extraClass = '';
}
