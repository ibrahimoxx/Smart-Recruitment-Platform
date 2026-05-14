import { Component, HostListener, signal, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuroraBackgroundComponent } from '../../ui/aurora-background.component';
import { NavProgressComponent } from '../nav-progress/nav-progress.component';
import { CommandPaletteComponent } from '../command-palette/command-palette.component';
import { CommandPaletteService } from '../command-palette/command-palette.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    AuroraBackgroundComponent,
    NavProgressComponent,
    CommandPaletteComponent,
  ],
  template: `
    <div class="min-h-screen flex flex-col relative">
      <app-nav-progress />
      <app-aurora-background [fixed]="true" />
      <app-navbar />
      <main id="main-content" class="flex-1 pt-16 relative z-10">
        <router-outlet />
      </main>
      <app-footer />
    </div>

    <app-command-palette />

    <!-- Keyboard shortcuts modal -->
    @if (showShortcuts()) {
      <div
        class="fixed inset-0 z-[9997] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          (click)="showShortcuts.set(false)"
          aria-hidden="true"
        ></div>
        <div
          class="relative glass-strong rounded-2xl p-6 w-full max-w-sm"
          style="box-shadow: 0 0 40px rgba(124,58,237,0.2);"
        >
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-white">Keyboard Shortcuts</h2>
            <button
              type="button"
              class="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              (click)="showShortcuts.set(false)"
              aria-label="Close shortcuts"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="space-y-2">
            @for (shortcut of shortcuts; track shortcut.keys) {
              <div class="flex items-center justify-between py-1.5">
                <span class="text-sm text-white/70">{{ shortcut.label }}</span>
                <div class="flex items-center gap-1">
                  @for (key of shortcut.keys; track key) {
                    <kbd class="px-2 py-1 rounded-md text-xs font-mono text-white/60 border border-white/15 glass">{{ key }}</kbd>
                  }
                </div>
              </div>
            }
          </div>

          <p class="mt-5 text-xs text-white/25 text-center font-mono">Press ? to toggle this panel</p>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`],
})
export class AppShellComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  readonly commandPalette = inject(CommandPaletteService);

  readonly showShortcuts = signal(false);

  private pendingKey: string | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  readonly shortcuts = [
    { keys: ['⌘ K', 'Ctrl K'], label: 'Open command palette' },
    { keys: ['g', 'j'], label: 'Go to Jobs' },
    { keys: ['g', 'a'], label: 'Go to Applications' },
    { keys: ['?'], label: 'Show keyboard shortcuts' },
  ];

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Cmd+K / Ctrl+K — works everywhere
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.commandPalette.toggle();
      return;
    }

    // Don't intercept single keys when user is typing
    if (inInput) return;

    // ? — shortcuts modal
    if (event.key === '?') {
      event.preventDefault();
      this.showShortcuts.update(v => !v);
      return;
    }

    // Escape — close any open overlay
    if (event.key === 'Escape') {
      if (this.showShortcuts()) {
        this.showShortcuts.set(false);
        return;
      }
    }

    // Chord shortcuts: g j, g a
    if (event.key === 'g') {
      event.preventDefault();
      this.pendingKey = 'g';
      if (this.pendingTimer) clearTimeout(this.pendingTimer);
      this.pendingTimer = setTimeout(() => { this.pendingKey = null; }, 500);
      return;
    }

    if (this.pendingKey === 'g') {
      if (this.pendingTimer) clearTimeout(this.pendingTimer);
      this.pendingKey = null;

      if (event.key === 'j') {
        event.preventDefault();
        this.router.navigate(['/jobs']);
      } else if (event.key === 'a') {
        event.preventDefault();
        const role = this.auth.userRole();
        if (role === 'CANDIDATE') {
          this.router.navigate(['/candidate/applications']);
        } else if (role === 'RECRUITER') {
          this.router.navigate(['/recruiter/jobs']);
        } else if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/jobs']);
        }
      }
    }
  }
}
