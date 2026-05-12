import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-void p-8">
      <h1 class="text-4xl font-bold aurora-text mb-4">My Applications</h1>
      <p class="text-white/40 text-sm">Applications list — Sub-phase 7</p>
    </div>
  `,
})
export class MyApplicationsComponent {}
