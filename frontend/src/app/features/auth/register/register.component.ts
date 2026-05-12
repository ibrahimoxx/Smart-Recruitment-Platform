import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { AuroraBackgroundComponent } from '../../../shared/ui/aurora-background.component';
import { GlassInputComponent } from '../../../shared/ui/glass-input.component';
import { MagneticButtonComponent } from '../../../shared/ui/magnetic-button.component';

type Role = 'CANDIDATE' | 'RECRUITER';
type Step = 1 | 2 | 3;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    AuroraBackgroundComponent, GlassInputComponent, MagneticButtonComponent,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 relative">
      <app-aurora-background [fixed]="true" />

      <div class="w-full max-w-lg relative z-10">
        <!-- Logo -->
        <div class="flex items-center justify-center gap-2 mb-8">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center"
            style="background: linear-gradient(135deg, #7C3AED, #EC4899);">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            </svg>
          </div>
          <span class="font-bold text-lg aurora-text">Aurora</span>
        </div>

        <!-- Progress dots -->
        <div class="flex items-center justify-center gap-2 mb-8" role="progressbar"
          [attr.aria-valuenow]="step()" aria-valuemin="1" aria-valuemax="3"
          [attr.aria-label]="'Step ' + step() + ' of 3'">
          @for (s of [1,2,3]; track s) {
            <div class="transition-all duration-300 rounded-full"
              [class.w-8]="s === step()"
              [class.w-2]="s !== step()"
              [class.h-2]="true"
              [style]="s === step() ? 'background:linear-gradient(90deg,#7C3AED,#EC4899)' :
                       s < step()  ? 'background:#7C3AED;opacity:0.6' :
                                     'background:rgba(255,255,255,0.15)'">
            </div>
          }
        </div>

        <div class="glass-strong rounded-3xl p-8 shadow-glass-lg">

          <!-- ── Step 1: Role selection ── -->
          @if (step() === 1) {
            <div class="animate-fade-in-up">
              <h2 class="text-2xl font-bold text-white mb-1">Join Aurora</h2>
              <p class="text-white/40 text-sm mb-8">Choose how you'll use the platform</p>

              <div class="grid grid-cols-2 gap-4 mb-8">
                @for (role of roles; track role.id) {
                  <button
                    type="button"
                    (click)="selectRole(role.id)"
                    class="relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 text-left"
                    [style]="selectedRole() === role.id ? role.activeStyle : role.inactiveStyle"
                    [attr.aria-pressed]="selectedRole() === role.id"
                  >
                    <span class="text-3xl">{{ role.emoji }}</span>
                    <div>
                      <p class="font-semibold text-white text-sm">{{ role.label }}</p>
                      <p class="text-xs text-white/50 mt-0.5">{{ role.desc }}</p>
                    </div>
                    @if (selectedRole() === role.id) {
                      <div class="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                        style="background:linear-gradient(135deg,#7C3AED,#EC4899)">
                        <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    }
                  </button>
                }
              </div>

              <app-magnetic-button
                variant="primary" size="lg" [fullWidth]="true"
                [disabled]="!selectedRole()"
                (click)="nextStep()"
              >
                Continue
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </app-magnetic-button>
            </div>
          }

          <!-- ── Step 2: Name + Email ── -->
          @if (step() === 2) {
            <div class="animate-fade-in-up">
              <button type="button" (click)="prevStep()"
                class="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-6">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>

              <h2 class="text-2xl font-bold text-white mb-1">Your details</h2>
              <p class="text-white/40 text-sm mb-8">
                Signing up as <span class="text-aurora-violet font-medium">{{ selectedRole() }}</span>
              </p>

              <form [formGroup]="detailsForm" class="flex flex-col gap-5">
                <div class="grid grid-cols-2 gap-4">
                  <app-glass-input
                    formControlName="firstName"
                    label="First name"
                    placeholder="John"
                    [required]="true"
                    [error]="detailsError('firstName')"
                  />
                  <app-glass-input
                    formControlName="lastName"
                    label="Last name"
                    placeholder="Doe"
                    [required]="true"
                    [error]="detailsError('lastName')"
                  />
                </div>
                <app-glass-input
                  formControlName="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  [required]="true"
                  [error]="detailsError('email')"
                />
              </form>

              <app-magnetic-button
                variant="primary" size="lg" [fullWidth]="true"
                (click)="toStep3()"
                class="mt-6 block"
              >Continue</app-magnetic-button>
            </div>
          }

          <!-- ── Step 3: Password ── -->
          @if (step() === 3) {
            <div class="animate-fade-in-up">
              <button type="button" (click)="prevStep()"
                class="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-6">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>

              <h2 class="text-2xl font-bold text-white mb-1">Set password</h2>
              <p class="text-white/40 text-sm mb-8">One last step — make it strong</p>

              <form [formGroup]="passwordForm" (ngSubmit)="submit()" novalidate class="flex flex-col gap-5">
                <div>
                  <app-glass-input
                    formControlName="password"
                    label="Password"
                    type="password"
                    placeholder="Min. 8 characters"
                    autocomplete="new-password"
                    [required]="true"
                    [error]="passwordError('password')"
                  />
                  <!-- Strength meter -->
                  <div class="mt-2 flex gap-1" aria-label="Password strength">
                    @for (i of [0,1,2,3]; track i) {
                      <div class="h-1 flex-1 rounded-full transition-all duration-300"
                        [style]="i < strength() ? strengthBarStyle() : 'background:rgba(255,255,255,0.08)'">
                      </div>
                    }
                  </div>
                  @if (passwordForm.get('password')?.value) {
                    <p class="text-xs mt-1.5 transition-colors" [style]="'color:' + strengthColor()">
                      {{ strengthLabel() }}
                    </p>
                  }
                </div>

                <app-glass-input
                  formControlName="confirm"
                  label="Confirm password"
                  type="password"
                  placeholder="Same password"
                  autocomplete="new-password"
                  [required]="true"
                  [error]="passwordError('confirm')"
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
                  type="submit" variant="primary" size="lg" [fullWidth]="true"
                  [loading]="loading()"
                >
                  Create account
                  <span loading>Creating account…</span>
                </app-magnetic-button>
              </form>
            </div>
          }

          <div class="mt-6 text-center">
            <p class="text-sm text-white/40">
              Already have an account?
              <a routerLink="/login"
                class="text-aurora-violet hover:text-aurora-violet-light transition-colors font-medium ml-1">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  step = signal<Step>(1);
  selectedRole = signal<Role | null>(null);
  loading = signal(false);
  serverError = signal('');

  roles = [
    {
      id: 'CANDIDATE' as Role,
      emoji: '🎯',
      label: 'Candidate',
      desc: 'Find and apply to jobs',
      activeStyle: 'border-color:#7C3AED;background:rgba(124,58,237,0.15)',
      inactiveStyle: 'border-color:rgba(255,255,255,0.08);background:rgba(255,255,255,0.03)',
    },
    {
      id: 'RECRUITER' as Role,
      emoji: '🏢',
      label: 'Recruiter',
      desc: 'Post jobs and hire talent',
      activeStyle: 'border-color:#06B6D4;background:rgba(6,182,212,0.15)',
      inactiveStyle: 'border-color:rgba(255,255,255,0.08);background:rgba(255,255,255,0.03)',
    },
  ];

  detailsForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm:  ['', [Validators.required]],
    },
    { validators: this.matchPasswords }
  );

  /* ── Strength ── */
  strength = computed(() => {
    const pw = this.passwordForm.get('password')?.value ?? '';
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  });

  strengthLabel = computed(() => ['', 'Weak', 'Fair', 'Good', 'Strong'][this.strength()]);
  strengthColor = computed(() => ['', '#F87171', '#FCD34D', '#34D399', '#34D399'][this.strength()]);
  strengthBarStyle = computed(() => {
    const colors = ['', '#F87171', '#FCD34D', '#34D399', '#34D399'];
    return `background:${colors[this.strength()]}`;
  });

  selectRole(r: Role): void { this.selectedRole.set(r); }
  nextStep(): void { if (this.step() < 3) this.step.set((this.step() + 1) as Step); }
  prevStep(): void { if (this.step() > 1) this.step.set((this.step() - 1) as Step); }

  toStep3(): void {
    this.detailsForm.markAllAsTouched();
    if (this.detailsForm.invalid) return;
    this.nextStep();
  }

  detailsError(name: 'firstName' | 'lastName' | 'email'): string {
    const ctrl = this.detailsForm.get(name);
    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'Required';
    if (ctrl.errors['email']) return 'Enter a valid email';
    if (ctrl.errors['minlength']) return 'Too short';
    return '';
  }

  passwordError(name: 'password' | 'confirm'): string {
    const ctrl = this.passwordForm.get(name);
    if (!ctrl?.touched) return '';
    if (ctrl.errors?.['required']) return 'Required';
    if (ctrl.errors?.['minlength']) return 'At least 8 characters';
    if (name === 'confirm' && this.passwordForm.errors?.['mismatch'] && ctrl.dirty)
      return 'Passwords do not match';
    return '';
  }

  submit(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid || !this.selectedRole()) return;

    this.loading.set(true);
    this.serverError.set('');

    const d = this.detailsForm.value;
    const p = this.passwordForm.value;

    this.auth.register({
      firstName: d.firstName!,
      lastName:  d.lastName!,
      email:     d.email!,
      password:  p.password!,
      role:      this.selectedRole()!,
    }).subscribe({
      next: () => {
        this.toast.success('Account created!', 'Welcome to Aurora');
        const role = this.auth.userRole();
        if (role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
        else this.router.navigate(['/jobs']);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const msg = this.extractError(err);
        this.serverError.set(msg);
      },
    });
  }

  private matchPasswords(group: AbstractControl) {
    const pw = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;
    return pw === confirm ? null : { mismatch: true };
  }

  private extractError(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const e = (err as { error?: { message?: string } }).error;
      return e?.message ?? 'Registration failed. Please try again.';
    }
    return 'Registration failed. Please try again.';
  }
}
