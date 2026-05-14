import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav-progress',
  standalone: true,
  template: `
    @if (visible()) {
      <div
        class="fixed top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden"
        role="progressbar"
        aria-label="Page loading"
        aria-live="polite"
      >
        <div
          class="h-full transition-all duration-300 ease-out"
          [style.width]="progress() + '%'"
          [style.background]="'linear-gradient(90deg, #7C3AED, #EC4899, #06B6D4)'"
          [style.box-shadow]="'0 0 8px rgba(124, 58, 237, 0.8)'"
        ></div>
      </div>
    }
  `,
})
export class NavProgressComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private sub!: Subscription;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly visible = signal(false);
  readonly progress = signal(0);

  ngOnInit(): void {
    this.sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.start();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.complete();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.timer) clearTimeout(this.timer);
  }

  private start(): void {
    this.visible.set(true);
    this.progress.set(0);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.progress.set(70), 50);
  }

  private complete(): void {
    this.progress.set(100);
    this.timer = setTimeout(() => {
      this.visible.set(false);
      this.progress.set(0);
    }, 300);
  }
}
