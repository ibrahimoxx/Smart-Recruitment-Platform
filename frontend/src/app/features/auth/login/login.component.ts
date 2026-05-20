import {
  Component, inject, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { AuroraBackgroundComponent } from '../../../shared/ui/aurora-background.component';
import { GlassInputComponent } from '../../../shared/ui/glass-input.component';
import { MagneticButtonComponent } from '../../../shared/ui/magnetic-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    AuroraBackgroundComponent, GlassInputComponent, MagneticButtonComponent,
  ],
  template: `
    <div class="min-h-screen flex">
      <app-aurora-background [fixed]="true" />

      <!-- Left panel — aurora visual (hidden on mobile) -->
      <div class="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 z-10">
        <div class="max-w-md w-full">
          <!-- Logo -->
          <div class="flex items-center gap-3 mb-12">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-aurora-violet"
              style="background: linear-gradient(135deg, #7C3AED, #EC4899);">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span class="text-2xl font-bold aurora-text">Aurora</span>
          </div>

          <!-- Hero text -->
          <h1 class="text-5xl font-black leading-none mb-6 text-white">
            Find your<br>
            <span class="aurora-text">next role.</span>
          </h1>
          <p class="text-white/50 text-lg leading-relaxed mb-12">
            AI-powered matching connects the right talent with the right opportunity — faster than ever.
          </p>

          <!-- Feature chips -->
          <div class="flex flex-col gap-3 mb-10">
            @for (feat of features; track feat.label) {
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  [style]="'background:' + feat.bg">
                  <span class="text-sm">{{ feat.icon }}</span>
                </div>
                <span class="text-sm text-white/60">{{ feat.label }}</span>
              </div>
            }
          </div>

          <!-- Browse jobs CTA -->
          <a routerLink="/jobs"
            class="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style="background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.35);color:#C4B5FD;backdrop-filter:blur(8px)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Browse jobs without signing in
            <svg class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Right panel — form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div class="w-full max-w-md">
          <!-- Mobile logo -->
          <div class="lg:hidden flex items-center gap-2 mb-8">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center"
              style="background: linear-gradient(135deg, #7C3AED, #EC4899);">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              </svg>
            </div>
            <span class="font-bold aurora-text">Aurora</span>
          </div>

          <div class="glass-strong rounded-3xl p-8 shadow-glass-lg" [class.shake]="shaking()">
            <h2 class="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p class="text-white/40 text-sm mb-8">Sign in to continue to Aurora</p>

            <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="flex flex-col gap-5">
              <app-glass-input
                formControlName="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                [required]="true"
                [error]="fieldError('email')"
              />

              <app-glass-input
                formControlName="password"
                label="Password"
                type="password"
                placeholder="Your password"
                autocomplete="current-password"
                [required]="true"
                [error]="fieldError('password')"
              />

              @if (serverError()) {
                <div class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 animate-fade-in"
                  style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2)" role="alert">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ serverError() }}
                </div>
              }

              <app-magnetic-button
                type="submit"
                variant="primary"
                size="lg"
                [fullWidth]="true"
                [loading]="loading()"
              >
                Sign in
                <span loading>Signing in…</span>
              </app-magnetic-button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-sm text-white/40">
                Don't have an account?
                <a routerLink="/register"
                  class="text-aurora-violet hover:text-aurora-violet-light transition-colors font-medium ml-1">
                  Create one free
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-6px)}
      80%{transform:translateX(6px)}
    }
    .shake { animation: shake 0.4s ease-in-out; }
    :host { display: block; }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);
  serverError = signal('');
  shaking = signal(false);

  features = [
    { icon: '🤖', label: 'AI-powered CV parsing and skill extraction', bg: 'rgba(124,58,237,0.15)' },
    { icon: '🎯', label: 'Smart match scoring between candidates and roles', bg: 'rgba(236,72,153,0.15)' },
    { icon: '✉️', label: 'Automated email draft generation for recruiters', bg: 'rgba(6,182,212,0.15)' },
  ];

  fieldError(name: 'email' | 'password'): string {
    const ctrl = this.form.get(name);
    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    if (ctrl.errors['email']) return 'Enter a valid email';
    if (ctrl.errors['minlength']) return 'Password must be at least 6 characters';
    return '';
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.triggerShake(); return; }

    this.loading.set(true);
    this.serverError.set('');

    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) { this.router.navigateByUrl(returnUrl); return; }
        const role = this.auth.userRole();
        if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
        else if (role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
        else this.router.navigate(['/jobs']);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const msg = this.extractError(err);
        this.serverError.set(msg);
        this.triggerShake();
      },
    });
  }

  private triggerShake(): void {
    this.shaking.set(true);
    setTimeout(() => this.shaking.set(false), 500);
  }

  private extractError(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const e = (err as { error?: { message?: string } }).error;
      return e?.message ?? 'Invalid email or password';
    }
    return 'Invalid email or password';
  }
}
