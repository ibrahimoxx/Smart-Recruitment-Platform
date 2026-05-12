import {
  Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appTiltCard]',
  standalone: true,
})
export class TiltCardDirective implements OnDestroy {
  @Input() tiltMax = 12;
  @Input() tiltScale = 1.03;

  private rafId: number | null = null;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.1s ease-out');
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');
    this.renderer.setStyle(this.el.nativeElement, 'transform-style', 'preserve-3d');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (this.reduced) return;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.applyTilt(e));
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
    );
  }

  private applyTilt(e: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotX = -y * this.tiltMax;
    const rotY = x * this.tiltMax;
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${this.tiltScale})`
    );
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'auto');
  }
}
