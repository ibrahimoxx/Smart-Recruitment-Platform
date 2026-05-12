import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  HostListener, ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="titleId"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          (click)="onBackdropClick()"
          aria-hidden="true"
        ></div>

        <div
          class="relative glass-strong rounded-3xl shadow-glass-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in"
          [style.max-width]="maxWidth"
          #panel
        >
          <div class="p-6 pb-0 flex items-start justify-between gap-4">
            @if (title) {
              <h2 [id]="titleId" class="text-xl font-bold text-white">{{ title }}</h2>
            }
            @if (showClose) {
              <button
                type="button"
                class="ml-auto flex-shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                (click)="close.emit()"
                aria-label="Close dialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            }
          </div>

          <div class="p-6">
            <ng-content />
          </div>

          @if (hasFooter) {
            <div class="px-6 pb-6 flex items-center gap-3 justify-end border-t border-glass pt-4">
              <ng-content select="[footer]" />
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
  `],
})
export class GlassModalComponent implements OnChanges {
  @Input() open = false;
  @Input() title = '';
  @Input() maxWidth = '480px';
  @Input() showClose = true;
  @Input() closeOnBackdrop = true;
  @Input() hasFooter = false;
  @Output() close = new EventEmitter<void>();

  titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      document.body.style.overflow = this.open ? 'hidden' : '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close.emit();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) this.close.emit();
  }
}
