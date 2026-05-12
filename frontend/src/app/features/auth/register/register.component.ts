import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-void flex items-center justify-center p-4">
      <div class="glass rounded-3xl p-8 w-full max-w-md shadow-glass-lg">
        <h1 class="text-3xl font-bold aurora-text mb-2">Create account</h1>
        <p class="text-white/50 mb-8">Join the platform</p>
        <p class="text-white/40 text-sm text-center">Register form — Sub-phase 5</p>
        <a routerLink="/login" class="block text-center text-aurora-violet mt-4 text-sm hover:text-aurora-violet-light transition-colors">
          Already have an account? Sign in
        </a>
      </div>
    </div>
  `,
})
export class RegisterComponent {}
