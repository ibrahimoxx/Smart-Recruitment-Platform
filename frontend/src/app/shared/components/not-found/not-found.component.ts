import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-void flex flex-col items-center justify-center p-8 text-center">
      <div class="text-8xl font-black aurora-text mb-4">404</div>
      <h1 class="text-2xl font-bold text-white/80 mb-2">Lost in the aurora</h1>
      <p class="text-white/40 mb-8">This page doesn't exist.</p>
      <a routerLink="/jobs" class="btn-primary">Back to Jobs</a>
    </div>
  `,
})
export class NotFoundComponent {}
