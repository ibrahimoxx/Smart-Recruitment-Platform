import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-void p-8">
      <h1 class="text-4xl font-bold aurora-text mb-4">Post a Job</h1>
      <p class="text-white/40 text-sm">Job form — Sub-phase 8</p>
    </div>
  `,
})
export class JobFormComponent {}
