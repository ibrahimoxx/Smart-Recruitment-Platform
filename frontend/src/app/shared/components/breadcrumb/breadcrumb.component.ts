import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-xs text-white/40">
      @for (item of items; track item.label; let last = $last) {
        @if (item.link && !last) {
          <a [routerLink]="item.link" class="hover:text-white/70 transition-colors">{{ item.label }}</a>
        } @else {
          <span [class.text-white/70]="last" [class.font-medium]="last">{{ item.label }}</span>
        }
        @if (!last) {
          <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        }
      }
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
