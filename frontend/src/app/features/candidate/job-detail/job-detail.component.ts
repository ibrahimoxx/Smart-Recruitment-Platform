import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-void p-8">
      <h1 class="text-4xl font-bold aurora-text mb-4">Job Detail</h1>
      <p class="text-white/40 text-sm">Job detail — Sub-phase 6</p>
    </div>
  `,
})
export class JobDetailComponent {}
