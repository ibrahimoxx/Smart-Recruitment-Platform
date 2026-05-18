import {
  Component, inject, signal, computed, OnInit, ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CandidateService, CandidateProfileRequest } from '../../../core/services/candidate.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { CandidateProfile } from '../../../core/models/user.model';
import { GlassInputComponent } from '../../../shared/ui/glass-input.component';
import { GlassTextareaComponent } from '../../../shared/ui/glass-textarea.component';
import { MagneticButtonComponent } from '../../../shared/ui/magnetic-button.component';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule, ReactiveFormsModule,
    GlassInputComponent, GlassTextareaComponent, MagneticButtonComponent,
  ],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-3xl font-black text-white mb-1">My Profile</h1>
        <p class="text-white/40 text-sm">Manage your professional information and CV</p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div class="lg:col-span-1 h-64 rounded-2xl bg-white/[0.04]"></div>
          <div class="lg:col-span-2 h-64 rounded-2xl bg-white/[0.04]"></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- ── Identity card ── -->
          <div class="glass rounded-2xl p-6 border border-glass flex flex-col items-center text-center gap-4">
            <!-- Avatar -->
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
              style="background: linear-gradient(135deg, #7C3AED, #EC4899)">
              {{ initials() }}
            </div>
            <div>
              <p class="font-bold text-white text-lg">{{ fullName() }}</p>
              <p class="text-sm text-white/40 mt-0.5">{{ auth.currentUser()?.email }}</p>
            </div>
            <div class="w-full pt-4 border-t border-glass space-y-2 text-left">
              @if (profile()?.location) {
                <div class="flex items-center gap-2 text-sm text-white/60">
                  <svg class="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ profile()!.location }}
                </div>
              }
            </div>
            <span class="self-start inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
              style="background:rgba(16,185,129,0.15);color:#34D399;border:1px solid rgba(16,185,129,0.25)">
              CANDIDATE
            </span>
          </div>

          <!-- ── Main form ── -->
          <div class="lg:col-span-2 space-y-5">
            <div class="glass rounded-2xl p-6 border border-glass">
              <div class="flex items-center justify-between mb-5">
                <h2 class="text-base font-bold text-white">Personal information</h2>
                @if (!editMode()) {
                  <button type="button" (click)="startEdit()"
                    class="flex items-center gap-1.5 text-xs text-aurora-violet hover:text-aurora-violet-light transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edit
                  </button>
                }
              </div>

              @if (editMode()) {
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" novalidate class="space-y-4">
                  <app-glass-input formControlName="headline" label="Headline" placeholder="e.g. Senior Full-Stack Engineer" />
                  <app-glass-input formControlName="location" label="Location" placeholder="Paris, France" />
                  <app-glass-input formControlName="yearsOfExperience" label="Years of experience" type="number" placeholder="3" />
                  <app-glass-textarea formControlName="summary" label="Summary" placeholder="A short introduction about yourself…" [rows]="3" />
                  <app-glass-input formControlName="linkedinUrl" label="LinkedIn URL" placeholder="https://linkedin.com/in/..." />
                  <app-glass-input formControlName="githubUrl" label="GitHub URL" placeholder="https://github.com/..." />
                  <app-glass-input formControlName="portfolioUrl" label="Portfolio URL" placeholder="https://yoursite.com" />
                  <div class="flex gap-3 pt-2">
                    <button type="button" (click)="cancelEdit()" class="flex-1 btn-glass py-2.5 text-sm">Cancel</button>
                    <app-magnetic-button type="submit" variant="primary" size="md" [loading]="saving()" class="flex-1 block">
                      Save changes
                      <span loading>Saving…</span>
                    </app-magnetic-button>
                  </div>
                </form>
              } @else {
                <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
                  @for (field of displayFields(); track field.label) {
                    <div>
                      <dt class="text-xs text-white/30 mb-0.5">{{ field.label }}</dt>
                      <dd class="text-sm text-white/80">{{ field.value || '—' }}</dd>
                    </div>
                  }
                </dl>
                @if (profile()?.summary) {
                  <div class="mt-4 pt-4 border-t border-glass">
                    <p class="text-xs text-white/30 mb-1">Summary</p>
                    <p class="text-sm text-white/70 leading-relaxed">{{ profile()!.summary }}</p>
                  </div>
                }
              }
            </div>
          </div>
        </div>

        <!-- ── Skills cloud ── -->
        <div class="mt-6 glass rounded-2xl p-6 border border-glass">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-bold text-white">Skills</h2>
            @if (!addingSkill()) {
              <button type="button" (click)="addingSkill.set(true)"
                class="flex items-center gap-1.5 text-xs text-aurora-violet hover:text-aurora-violet-light transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add skill
              </button>
            }
          </div>

          @if (addingSkill()) {
            <form (ngSubmit)="addSkill()" class="flex gap-2 mb-4">
              <input #skillInput
                type="text" [(ngModel)]="newSkill" name="skill"
                placeholder="e.g. TypeScript, Docker, Python…"
                class="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/30 border border-glass outline-none focus:border-aurora-violet/50 transition-colors"
                style="background:rgba(255,255,255,0.04)"
                (keydown.escape)="addingSkill.set(false)"
              >
              <button type="submit" class="btn-primary px-4 py-2 text-xs">Add</button>
              <button type="button" (click)="addingSkill.set(false)" class="btn-glass px-3 py-2 text-xs">Cancel</button>
            </form>
          }

          @if (skills().length) {
            <div class="flex flex-wrap gap-2">
              @for (skill of skills(); track skill) {
                <span class="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/70 transition-all hover:border-aurora-violet/30 hover:text-white"
                  style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2)">
                  {{ skill }}
                  <button type="button" (click)="removeSkill(skill)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400 leading-none">
                    ×
                  </button>
                </span>
              }
            </div>
          } @else {
            <p class="text-sm text-white/30 italic">No skills added yet. Add your first skill above.</p>
          }
        </div>

        <!-- ── CV upload ── -->
        <div class="mt-6 glass rounded-2xl p-6 border border-glass">
          <h2 class="text-base font-bold text-white mb-5">Curriculum Vitae</h2>

          @if (profile()?.hasCv) {
            <div class="flex items-center gap-4 p-4 rounded-xl mb-4"
              style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2)">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style="background:rgba(16,185,129,0.15)">
                <svg class="w-5 h-5 text-aurora-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white">CV on file</p>
                <p class="text-xs text-white/40">Uploaded {{ profile()!.cvUploadedAt | date:'mediumDate' }} — recruiters can view your parsed profile</p>
              </div>
            </div>
          }

          <!-- Drop zone -->
          <div
            class="relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer"
            [class.border-aurora-violet]="dragOver()"
            [style]="dragOver() ? 'background:rgba(124,58,237,0.08);border-color:rgba(124,58,237,0.5)' : 'border-color:rgba(255,255,255,0.1);background:rgba(255,255,255,0.02)'"
            (dragover)="onDragOver($event)"
            (dragleave)="dragOver.set(false)"
            (drop)="onDrop($event)"
            (click)="fileInput.click()"
            role="button"
            aria-label="Upload CV"
          >
            @if (uploadProgress() > 0 && uploadProgress() < 100) {
              <div class="w-full max-w-xs">
                <div class="h-1.5 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.08)">
                  <div class="h-full rounded-full transition-all duration-300"
                    [style]="'width:' + uploadProgress() + '%;background:linear-gradient(90deg,#7C3AED,#EC4899)'"></div>
                </div>
                <p class="text-xs text-white/40 text-center mt-2">Uploading {{ uploadProgress() }}%…</p>
              </div>
            } @else {
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
                style="background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.25)">
                <svg class="w-6 h-6 text-aurora-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>
              <div class="text-center">
                <p class="text-sm text-white/70">
                  <span class="text-aurora-violet font-medium">Click to upload</span> or drag and drop
                </p>
                <p class="text-xs text-white/30 mt-1">PDF, DOC, DOCX — max 10 MB</p>
              </div>
            }
            <input #fileInput type="file" accept=".pdf,.doc,.docx" class="sr-only"
              (change)="onFileSelected($event)">
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class CandidateProfileComponent implements OnInit {
  private candidateService = inject(CandidateService);
  auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  profile = signal<CandidateProfile | null>(null);
  loading = signal(true);
  editMode = signal(false);
  saving = signal(false);
  addingSkill = signal(false);
  newSkill = '';
  dragOver = signal(false);
  uploadProgress = signal(0);

  profileForm = this.fb.group({
    headline:         [''],
    summary:          [''],
    location:         [''],
    yearsOfExperience:[null as number | null],
    linkedinUrl:      [''],
    githubUrl:        [''],
    portfolioUrl:     [''],
  });

  fullName = computed(() => {
    const u = this.auth.currentUser();
    return `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() || 'You';
  });

  initials = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  });

  skills = computed(() => {
    const raw = this.profile()?.skills;
    if (!raw) return [];
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  });

  displayFields = computed(() => {
    const p = this.profile();
    return [
      { label: 'First name',  value: p?.firstName ?? '' },
      { label: 'Last name',   value: p?.lastName ?? '' },
      { label: 'Location',    value: p?.location ?? '' },
      { label: 'Experience',  value: p?.yearsOfExperience != null ? `${p.yearsOfExperience} yrs` : '' },
      { label: 'Level',       value: p?.experienceLevel ?? '' },
    ];
  });

  ngOnInit(): void {
    this.candidateService.getMyProfile().subscribe({
      next: res => { this.profile.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  startEdit(): void {
    const p = this.profile();
    this.profileForm.patchValue({
      headline:          p?.headline ?? '',
      summary:           p?.summary ?? '',
      location:          p?.location ?? '',
      yearsOfExperience: p?.yearsOfExperience ?? null,
      linkedinUrl:       p?.linkedinUrl ?? '',
      githubUrl:         p?.githubUrl ?? '',
      portfolioUrl:      p?.portfolioUrl ?? '',
    });
    this.editMode.set(true);
  }

  cancelEdit(): void { this.editMode.set(false); }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving.set(true);
    const v = this.profileForm.value;
    const data: CandidateProfileRequest = {
      headline:          v.headline          ?? undefined,
      summary:           v.summary           ?? undefined,
      location:          v.location          ?? undefined,
      yearsOfExperience: v.yearsOfExperience ?? undefined,
      linkedinUrl:       v.linkedinUrl       ?? undefined,
      githubUrl:         v.githubUrl         ?? undefined,
      portfolioUrl:      v.portfolioUrl      ?? undefined,
    };
    const save$ = this.candidateService.updateProfile(data);

    save$.subscribe({
      next: res => {
        this.profile.set(res.data);
        this.saving.set(false);
        this.editMode.set(false);
        this.toast.success('Profile updated!');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Could not save profile.');
      },
    });
  }

  addSkill(): void {
    const skill = this.newSkill.trim();
    if (!skill || this.skills().includes(skill)) { this.newSkill = ''; return; }
    const updated = [...this.skills(), skill];
    this.saveSkills(updated);
    this.newSkill = '';
  }

  removeSkill(skill: string): void {
    this.saveSkills(this.skills().filter(s => s !== skill));
  }

  private saveSkills(skills: string[]): void {
    this.candidateService.updateProfile({ skills: skills.join(',') }).subscribe({
      next: res => this.profile.set(res.data),
      error: () => this.toast.error('Could not update skills.'),
    });
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.uploadFile(file);
  }

  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.uploadFile(file);
  }

  private uploadFile(file: File): void {
    const allowedTypes = ['application/pdf'];
    const maxBytes = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      this.toast.error('Invalid file type', 'CV must be a PDF file.');
      return;
    }
    if (file.size > maxBytes) {
      this.toast.error('File too large', 'CV file must not exceed 10 MB.');
      return;
    }

    this.uploadProgress.set(10);
    const interval = setInterval(() => {
      if (this.uploadProgress() < 80) this.uploadProgress.update(v => v + 15);
    }, 300);

    this.candidateService.uploadCv(file).subscribe({
      next: () => {
        clearInterval(interval);
        this.uploadProgress.set(100);
        this.candidateService.getMyProfile().subscribe({
          next: profileRes => this.profile.set(profileRes.data),
        });
        setTimeout(() => this.uploadProgress.set(0), 800);
        this.toast.success('CV uploaded!', 'Your profile is being parsed by AI.');
      },
      error: () => {
        clearInterval(interval);
        this.uploadProgress.set(0);
        this.toast.error('CV upload failed', 'Please try again or contact support.');
      },
    });
  }
}
