import { Component, Input, Output, EventEmitter, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-1.5" aria-label="Pagination">
        <!-- Prev -->
        <button
          type="button"
          [disabled]="currentPage() === 0"
          (click)="go(currentPage() - 1)"
          class="pagination-btn"
          aria-label="Previous page"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Pages -->
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-1 text-white/30 text-sm">…</span>
          } @else {
            <button
              type="button"
              (click)="go(page)"
              [attr.aria-current]="page === currentPage() ? 'page' : null"
              [attr.aria-label]="'Page ' + (page + 1)"
              class="pagination-btn"
              [class.pagination-active]="page === currentPage()"
            >
              {{ page + 1 }}
            </button>
          }
        }

        <!-- Next -->
        <button
          type="button"
          [disabled]="currentPage() === totalPages() - 1"
          (click)="go(currentPage() + 1)"
          class="pagination-btn"
          aria-label="Next page"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </nav>
    }
  `,
  styles: [`
    .pagination-btn {
      @apply w-9 h-9 rounded-xl glass glass-hover flex items-center justify-center text-sm text-white/60
             hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed;
    }
    .pagination-active {
      color: white;
      background: rgba(124,58,237,0.3) !important;
      border-color: rgba(124,58,237,0.4) !important;
      box-shadow: 0 0 12px rgba(124,58,237,0.3);
    }
    :host-context(html.light) .pagination-btn { color: rgba(10,10,30,0.60); }
    :host-context(html.light) .pagination-btn:hover { color: rgba(10,10,30,0.95); }
    :host-context(html.light) .pagination-active { color: white; }
  `],
})
export class PaginationComponent {
  currentPage = input(0);
  totalPages = input(0);
  @Output() pageChange = new EventEmitter<number>();

  visiblePages = computed(() => {
    const total = this.totalPages();
    const cur = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    const pages: number[] = [0];
    if (cur > 2) pages.push(-1);
    for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i);
    if (cur < total - 3) pages.push(-1);
    pages.push(total - 1);
    return pages;
  });

  go(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.pageChange.emit(page);
  }
}
