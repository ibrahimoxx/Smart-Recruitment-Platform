import {
  Component, Input, ElementRef, HostListener, Renderer2, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-magnetic-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [attr.aria-busy]="loading"
      [class]="buttonClasses"
      (click)="onClick($event)"
    >
      <span class="ripple-container" #rippleContainer></span>
      @if (loading) {
        <span class="inline-flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 014 12z"/>
          </svg>
          <ng-content select="[loading]" />
        </span>
      } @else {
        <span class="relative z-10 inline-flex items-center gap-2">
          <ng-content />
        </span>
      }
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
    button { position: relative; overflow: hidden; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .ripple-container { position: absolute; inset: 0; pointer-events: none; }
  `],
})
export class MagneticButtonComponent implements OnDestroy {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'glass' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private rafId: number | null = null;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  get buttonClasses(): string {
    const base = 'relative overflow-hidden font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2';
    const widthCls = this.fullWidth ? 'w-full justify-center' : '';

    const sizes: Record<string, string> = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-sm rounded-xl',
      lg: 'px-8 py-4 text-base rounded-2xl',
    };

    const variants: Record<string, string> = {
      primary: 'btn-primary text-white',
      glass: 'btn-glass text-white/80',
      ghost: 'text-white/70 hover:text-white hover:bg-white/5 rounded-xl',
    };

    return [base, sizes[this.size], variants[this.variant], widthCls].filter(Boolean).join(' ');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (this.reduced || this.disabled) return;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      const el = this.el.nativeElement.querySelector('button') as HTMLElement;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      this.renderer.setStyle(el, 'transform', `translate(${dx}px, ${dy}px)`);
    });
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    const el = this.el.nativeElement.querySelector('button') as HTMLElement;
    if (el) this.renderer.setStyle(el, 'transform', 'translate(0,0)');
  }

  onClick(e: MouseEvent): void {
    if (this.reduced) return;
    const btn = this.el.nativeElement.querySelector('button') as HTMLElement;
    const rippleContainer = btn?.querySelector('.ripple-container') as HTMLElement;
    if (!rippleContainer) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = this.renderer.createElement('span') as HTMLElement;
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${e.clientX - rect.left - size / 2}px`);
    this.renderer.setStyle(ripple, 'top', `${e.clientY - rect.top - size / 2}px`);
    this.renderer.setStyle(ripple, 'borderRadius', '50%');
    this.renderer.setStyle(ripple, 'background', 'rgba(255,255,255,0.2)');
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.setStyle(ripple, 'animation', 'ripple-expand 0.5s ease-out forwards');
    rippleContainer.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }
}
