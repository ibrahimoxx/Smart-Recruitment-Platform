import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { JobOfferRequest, ContractType, ExperienceLevel } from '../../../core/models/job-offer.model';
import { GlassInputComponent } from '../../../shared/ui/glass-input.component';
import { GlassTextareaComponent } from '../../../shared/ui/glass-textarea.component';
import { GlassSelectComponent } from '../../../shared/ui/glass-select.component';
import { GlassCheckboxComponent } from '../../../shared/ui/glass-checkbox.component';
import { MagneticButtonComponent } from '../../../shared/ui/magnetic-button.component';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    GlassInputComponent, GlassTextareaComponent, GlassSelectComponent,
    GlassCheckboxComponent, MagneticButtonComponent,
  ],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/recruiter/jobs" class="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-3xl font-black text-white">{{ isEdit() ? 'Edit job offer' : 'Post a job' }}</h1>
          <p class="text-white/40 text-sm mt-0.5">{{ isEdit() ? 'Update your job listing' : 'Attract top talent with a compelling job offer' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- ── Form (3/5) ── -->
        <div class="lg:col-span-3">
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-6">

            <!-- Basics -->
            <div class="glass rounded-2xl p-6 border border-glass space-y-5">
              <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider">Basics</h2>
              <app-glass-input
                formControlName="title"
                label="Job title"
                placeholder="e.g. Senior Backend Engineer"
                [required]="true"
                [error]="fieldError('title')"
              />
              <div class="grid grid-cols-2 gap-4">
                <app-glass-select formControlName="contractType" label="Contract type" [options]="contractOptions" />
                <app-glass-select formControlName="experienceLevel" label="Experience" [options]="experienceOptions" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <app-glass-input formControlName="location" label="Location" placeholder="Paris, France" />
                <div class="flex items-end pb-1">
                  <app-glass-checkbox formControlName="remote" label="Remote-friendly" />
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="glass rounded-2xl p-6 border border-glass space-y-5">
              <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider">Description</h2>
              <app-glass-textarea
                formControlName="description"
                label="About the role"
                placeholder="Describe what the candidate will be working on, the team, culture…"
                [rows]="7"
                [required]="true"
                [error]="fieldError('description')"
              />
              <app-glass-textarea
                formControlName="requirements"
                label="Requirements"
                placeholder="List skills, experience, and qualifications — one per line&#10;• 3+ years React experience&#10;• TypeScript proficiency"
                [rows]="5"
              />
            </div>

            <!-- Compensation -->
            <div class="glass rounded-2xl p-6 border border-glass space-y-5">
              <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider">Compensation</h2>
              <div class="grid grid-cols-3 gap-4">
                <app-glass-input formControlName="salaryMin" label="Min salary" type="number" placeholder="50000" />
                <app-glass-input formControlName="salaryMax" label="Max salary" type="number" placeholder="80000" />
                <app-glass-select formControlName="currency" label="Currency" [options]="currencyOptions" />
              </div>
            </div>

            <!-- Timeline -->
            <div class="glass rounded-2xl p-6 border border-glass space-y-5">
              <h2 class="text-sm font-bold text-white/60 uppercase tracking-wider">Timeline</h2>
              <app-glass-input
                formControlName="closesAt"
                label="Application deadline"
                type="date"
                [min]="todayStr"
              />
            </div>

            @if (serverError()) {
              <div class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400"
                style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2)" role="alert">
                {{ serverError() }}
              </div>
            }

            <div class="flex gap-3">
              <a routerLink="/recruiter/jobs" class="flex-1 btn-glass py-3 text-sm text-center">Cancel</a>
              <app-magnetic-button type="submit" variant="primary" size="lg" [loading]="saving()" class="flex-1 block">
                {{ isEdit() ? 'Update job' : 'Post job' }}
                <span loading>{{ isEdit() ? 'Updating…' : 'Posting…' }}</span>
              </app-magnetic-button>
            </div>
          </form>
        </div>

        <!-- ── Live preview (2/5) ── -->
        <div class="lg:col-span-2 hidden lg:block">
          <div class="sticky top-24">
            <p class="text-xs text-white/30 uppercase tracking-wider mb-3">Preview</p>
            <div class="glass rounded-2xl p-5 border border-glass space-y-4">
              <!-- Company initial -->
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                  style="background:linear-gradient(135deg,rgba(124,58,237,0.25),rgba(236,72,153,0.25))">
                  J
                </div>
                <div class="min-w-0">
                  <h3 class="font-semibold text-white text-sm leading-tight">
                    {{ form.value.title || 'Job title' }}
                  </h3>
                  <p class="text-xs text-white/40 mt-0.5">Your company</p>
                </div>
              </div>
              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5">
                <span class="preview-tag">{{ contractLabel() }}</span>
                <span class="preview-tag">{{ expLabel() }}</span>
                @if (form.value.remote) { <span class="preview-tag preview-tag-green">Remote</span> }
                @if (form.value.location) { <span class="preview-tag">{{ form.value.location }}</span> }
              </div>
              <!-- Salary preview -->
              @if (form.value.salaryMin || form.value.salaryMax) {
                <p class="text-aurora-emerald text-sm font-semibold">{{ salaryPreview() }}</p>
              }
              <!-- Deadline -->
              @if (form.value.closesAt) {
                <p class="text-xs text-white/30">
                  Closes {{ form.value.closesAt | date:'mediumDate' }}
                </p>
              }
              <!-- Description snippet -->
              @if (form.value.description) {
                <p class="text-xs text-white/50 leading-relaxed line-clamp-4">
                  {{ form.value.description }}
                </p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .preview-tag {
      @apply px-2 py-0.5 rounded-lg text-xs text-white/50;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .preview-tag-green { color: #34D399; background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.2); }
  `],
})
export class JobFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  isEdit = signal(false);
  editId = signal<string | null>(null);
  saving = signal(false);
  serverError = signal('');
  todayStr = new Date().toISOString().split('T')[0];

  form = this.fb.group({
    title:           ['', [Validators.required, Validators.minLength(3)]],
    description:     ['', [Validators.required, Validators.minLength(20)]],
    requirements:    [''],
    location:        [''],
    remote:          [false],
    contractType:    ['FULL_TIME' as ContractType, Validators.required],
    experienceLevel: ['MID' as ExperienceLevel, Validators.required],
    salaryMin:       [null as number | null],
    salaryMax:       [null as number | null],
    currency:        ['USD'],
    closesAt:        [''],
  });

  contractOptions = [
    { value: 'FULL_TIME',   label: 'Full-time' },
    { value: 'PART_TIME',   label: 'Part-time' },
    { value: 'CONTRACT',    label: 'Contract' },
    { value: 'INTERNSHIP',  label: 'Internship' },
    { value: 'FREELANCE',   label: 'Freelance' },
  ];

  experienceOptions = [
    { value: 'JUNIOR',    label: 'Junior' },
    { value: 'MID',       label: 'Mid-level' },
    { value: 'SENIOR',    label: 'Senior' },
    { value: 'LEAD',      label: 'Lead' },
    { value: 'EXECUTIVE', label: 'Executive' },
  ];

  currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'CAD', label: 'CAD' },
    { value: 'MAD', label: 'MAD' },
  ];

  contractLabel = computed(() => {
    return this.contractOptions.find(o => o.value === this.form.value.contractType)?.label ?? '';
  });

  expLabel = computed(() => {
    return this.experienceOptions.find(o => o.value === this.form.value.experienceLevel)?.label ?? '';
  });

  salaryPreview = computed(() => {
    const cur = this.form.value.currency ?? 'USD';
    const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
    const min = this.form.value.salaryMin;
    const max = this.form.value.salaryMax;
    if (min && max) return `${fmt(min)}–${fmt(max)} ${cur}`;
    if (min) return `From ${fmt(min)} ${cur}`;
    if (max) return `Up to ${fmt(max)} ${cur}`;
    return '';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(id);
      this.jobService.getById(id).subscribe({
        next: res => {
          const j = res.data;
          this.form.patchValue({
            title: j.title,
            description: j.description,
            requirements: j.requirements,
            location: j.location,
            remote: j.remote,
            contractType: j.contractType,
            experienceLevel: j.experienceLevel,
            salaryMin: j.salaryMin ?? null,
            salaryMax: j.salaryMax ?? null,
            currency: j.currency ?? 'USD',
            closesAt: j.closesAt ? j.closesAt.split('T')[0] : '',
          });
        },
        error: () => this.toast.error('Could not load job.'),
      });
    }
  }

  fieldError(name: 'title' | 'description'): string {
    const ctrl = this.form.get(name);
    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'Required';
    if (ctrl.errors['minlength']) return 'Too short';
    return '';
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.serverError.set('');

    const v = this.form.value;
    const payload: JobOfferRequest = {
      title:           v.title!,
      description:     v.description!,
      requirements:    v.requirements ?? '',
      location:        v.location ?? '',
      remote:          v.remote ?? false,
      contractType:    v.contractType as ContractType,
      experienceLevel: v.experienceLevel as ExperienceLevel,
      salaryMin:       v.salaryMin ?? undefined,
      salaryMax:       v.salaryMax ?? undefined,
      currency:        v.currency ?? 'USD',
      closesAt:        v.closesAt ? new Date(v.closesAt).toISOString() : undefined,
    };

    const req$ = this.isEdit()
      ? this.jobService.update(this.editId()!, payload)
      : this.jobService.create(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.isEdit() ? 'Job updated!' : 'Job posted!');
        this.router.navigate(['/recruiter/jobs']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.serverError.set(this.extractError(err));
      },
    });
  }

  private extractError(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const e = (err as { error?: { message?: string } }).error;
      return e?.message ?? 'Could not save job.';
    }
    return 'Could not save job.';
  }
}
