import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-void flex items-center justify-center p-4">
      <div class="glass rounded-3xl p-8 w-full max-w-md shadow-glass-lg">
        <h1 class="text-3xl font-bold aurora-text mb-2">Welcome back</h1>
        <p class="text-white/50 mb-8">Sign in to your account</p>
        <p class="text-white/40 text-sm text-center">Login form — Sub-phase 5</p>
        <a routerLink="/register" class="block text-center text-aurora-violet mt-4 text-sm hover:text-aurora-violet-light transition-colors">
          Don't have an account? Register
        </a>
      </div>
    </div>
  `,
})
export class LoginComponent {}
