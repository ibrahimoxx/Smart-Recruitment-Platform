import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../ui/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav
      class="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      [class.glass]="scrolled()"
      [class.border-b]="scrolled()"
      [class.border-glass]="scrolled()"
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        <!-- Logo -->
        <a routerLink="/jobs" class="flex items-center gap-2.5 flex-shrink-0" aria-label="Aurora home">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center"
            style="background: linear-gradient(135deg, #7C3AED, #EC4899);">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="font-bold text-lg tracking-tight hidden sm:block">
            <span class="aurora-text">Aurora</span>
          </span>
        </a>

        <!-- Center Nav Links -->
        <div class="hidden md:flex items-center gap-1">
          <a routerLink="/jobs" routerLinkActive="nav-link-active" class="nav-link">Browse Jobs</a>

          @if (auth.isLoggedIn()) {
            @if (auth.userRole() === 'CANDIDATE') {
              <a routerLink="/candidate/profile" routerLinkActive="nav-link-active" class="nav-link">Profile</a>
              <a routerLink="/candidate/applications" routerLinkActive="nav-link-active" class="nav-link">My Applications</a>
            }
            @if (auth.userRole() === 'RECRUITER') {
              <a routerLink="/recruiter/dashboard" routerLinkActive="nav-link-active" class="nav-link">Dashboard</a>
              <a routerLink="/recruiter/jobs" routerLinkActive="nav-link-active" class="nav-link">My Jobs</a>
            }
            @if (auth.userRole() === 'ADMIN') {
              <a routerLink="/admin/dashboard" routerLinkActive="nav-link-active" class="nav-link">Dashboard</a>
              <a routerLink="/admin/users" routerLinkActive="nav-link-active" class="nav-link">Users</a>
            }
          }
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-2">
          <!-- Theme Toggle -->
          <button
            type="button"
            (click)="theme.toggle()"
            class="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            @if (theme.isDark()) {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            }
          </button>

          @if (auth.isLoggedIn()) {
            <!-- Avatar Dropdown -->
            <div class="relative">
              <button
                type="button"
                (click)="dropdownOpen.set(!dropdownOpen())"
                class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl glass glass-hover transition-all"
                [attr.aria-expanded]="dropdownOpen()"
                aria-haspopup="menu"
              >
                <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style="background: linear-gradient(135deg, #7C3AED, #EC4899);">
                  {{ initials() }}
                </div>
                <span class="text-sm text-white/80 hidden sm:block max-w-[100px] truncate">
                  {{ auth.currentUser()?.firstName }}
                </span>
                <svg class="w-3.5 h-3.5 text-white/40 transition-transform duration-200"
                  [class.rotate-180]="dropdownOpen()"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              @if (dropdownOpen()) {
                <div
                  class="absolute right-0 top-full mt-2 w-52 glass-strong rounded-2xl shadow-glass-lg overflow-hidden animate-scale-in"
                  role="menu"
                  (clickOutside)="dropdownOpen.set(false)"
                >
                  <div class="px-4 py-3 border-b border-glass">
                    <p class="text-sm font-semibold text-white truncate">
                      {{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}
                    </p>
                    <p class="text-xs text-white/40 truncate mt-0.5">{{ auth.currentUser()?.email }}</p>
                    <span class="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                      [style]="roleBadgeStyle()">
                      {{ auth.userRole() }}
                    </span>
                  </div>
                  <div class="py-1.5">
                    <button
                      type="button"
                      (click)="logout()"
                      role="menuitem"
                      class="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="btn-glass text-sm px-4 py-2">Sign in</a>
            <a routerLink="/register" class="btn-primary text-sm px-4 py-2">Get started</a>
          }

          <!-- Mobile hamburger -->
          <button
            type="button"
            class="md:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            (click)="mobileOpen.set(!mobileOpen())"
            [attr.aria-expanded]="mobileOpen()"
            aria-label="Toggle menu"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              @if (mobileOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileOpen()) {
        <div class="md:hidden glass border-t border-glass px-4 py-3 space-y-1 animate-fade-in-up">
          <a routerLink="/jobs" (click)="mobileOpen.set(false)" class="mobile-nav-link">Browse Jobs</a>
          @if (auth.isLoggedIn()) {
            @if (auth.userRole() === 'CANDIDATE') {
              <a routerLink="/candidate/profile" (click)="mobileOpen.set(false)" class="mobile-nav-link">Profile</a>
              <a routerLink="/candidate/applications" (click)="mobileOpen.set(false)" class="mobile-nav-link">My Applications</a>
            }
            @if (auth.userRole() === 'RECRUITER') {
              <a routerLink="/recruiter/dashboard" (click)="mobileOpen.set(false)" class="mobile-nav-link">Dashboard</a>
              <a routerLink="/recruiter/jobs" (click)="mobileOpen.set(false)" class="mobile-nav-link">My Jobs</a>
            }
            @if (auth.userRole() === 'ADMIN') {
              <a routerLink="/admin/dashboard" (click)="mobileOpen.set(false)" class="mobile-nav-link">Dashboard</a>
              <a routerLink="/admin/users" (click)="mobileOpen.set(false)" class="mobile-nav-link">Users</a>
            }
            <button type="button" (click)="logout()" class="mobile-nav-link text-red-400 w-full text-left">Sign out</button>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .nav-link {
      @apply px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.08] transition-all duration-200;
    }
    .nav-link-active {
      @apply text-white bg-white/[0.08];
    }
    .mobile-nav-link {
      @apply block px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.08] transition-all;
    }
    :host { display: block; }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);

  scrolled = signal(false);
  dropdownOpen = signal(false);
  mobileOpen = signal(false);

  constructor(private router: Router) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 10);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('[aria-haspopup]') && !target.closest('[role="menu"]')) {
      this.dropdownOpen.set(false);
    }
  }

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || u.email[0].toUpperCase();
  }

  roleBadgeStyle(): string {
    const styles: Record<string, string> = {
      ADMIN: 'background:rgba(124,58,237,0.2);color:#9B5CF6;border:1px solid rgba(124,58,237,0.3)',
      RECRUITER: 'background:rgba(6,182,212,0.2);color:#22D3EE;border:1px solid rgba(6,182,212,0.3)',
      CANDIDATE: 'background:rgba(16,185,129,0.2);color:#34D399;border:1px solid rgba(16,185,129,0.3)',
    };
    return styles[this.auth.userRole() ?? ''] ?? '';
  }

  logout(): void {
    this.dropdownOpen.set(false);
    this.mobileOpen.set(false);
    this.auth.logout();
  }
}
