import {
  Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appMagnetic]',
  standalone: true,
})
export class MagneticDirective implements OnDestroy {
  @Input() magneticStrength = 0.35;

  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private rafId: number | null = null;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)');
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (this.reduced) return;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      const rect = this.el.nativeElement.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * this.magneticStrength;
      const dy = (e.clientY - cy) * this.magneticStrength;
      this.renderer.setStyle(this.el.nativeElement, 'transform', `translate(${dx}px, ${dy}px)`);
    });
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translate(0, 0)');
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'auto');
  }
}
