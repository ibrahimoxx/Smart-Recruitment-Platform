import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-void flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">

      <!-- Floating aurora orbs -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 animate-pulse"
           style="background: radial-gradient(circle, #7C3AED, transparent); filter: blur(60px); animation-duration: 3s;"></div>
      <div class="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-10 animate-pulse"
           style="background: radial-gradient(circle, #EC4899, transparent); filter: blur(50px); animation-duration: 4s; animation-delay: 1s;"></div>
      <div class="absolute top-1/2 right-1/3 w-32 h-32 rounded-full opacity-8 animate-pulse"
           style="background: radial-gradient(circle, #06B6D4, transparent); filter: blur(40px); animation-duration: 5s; animation-delay: 0.5s;"></div>

      <!-- SVG Illustration: concentric rings -->
      <div class="relative mb-8">
        <svg width="180" height="180" viewBox="0 0 180 180" class="mx-auto" aria-hidden="true">
          <defs>
            <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#7C3AED"/>
              <stop offset="50%" style="stop-color:#EC4899"/>
              <stop offset="100%" style="stop-color:#06B6D4"/>
            </linearGradient>
            <linearGradient id="ring2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#EC4899"/>
              <stop offset="100%" style="stop-color:#10B981"/>
            </linearGradient>
            <linearGradient id="ring3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#06B6D4"/>
              <stop offset="100%" style="stop-color:#7C3AED"/>
            </linearGradient>
          </defs>

          <!-- Ring 1 - outer, slow rotate -->
          <circle cx="90" cy="90" r="80" fill="none" stroke="url(#ring1)" stroke-width="1.5"
                  stroke-dasharray="80 420" opacity="0.6"
                  style="transform-origin: 90px 90px; animation: spin 12s linear infinite;"/>
          <!-- Ring 2 - middle, reverse -->
          <circle cx="90" cy="90" r="62" fill="none" stroke="url(#ring2)" stroke-width="1.5"
                  stroke-dasharray="60 330" opacity="0.5"
                  style="transform-origin: 90px 90px; animation: spin-reverse 8s linear infinite;"/>
          <!-- Ring 3 - inner, fast -->
          <circle cx="90" cy="90" r="44" fill="none" stroke="url(#ring3)" stroke-width="1.5"
                  stroke-dasharray="40 236" opacity="0.4"
                  style="transform-origin: 90px 90px; animation: spin 5s linear infinite;"/>

          <!-- Center dot -->
          <circle cx="90" cy="90" r="4" fill="url(#ring1)" opacity="0.9"/>
        </svg>

        <!-- 404 overlaid on SVG -->
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-5xl font-black aurora-text" style="animation: pulse 2s ease-in-out infinite;">404</span>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-white/90 mb-2">Lost in the aurora</h1>
      <p class="text-white/40 mb-8 max-w-xs text-sm leading-relaxed">
        This page drifted beyond the event horizon. Let's navigate you back.
      </p>

      <a routerLink="/jobs" class="btn-primary">
        Back to Jobs
      </a>

      <!-- Keyboard hint -->
      <p class="mt-6 text-white/20 text-xs font-mono">
        Press <kbd class="px-1.5 py-0.5 rounded border border-white/10 text-white/30">g j</kbd> to jump to jobs
      </p>
    </div>
  `,
  styles: [`
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes spin-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; }
    }
  `],
})
export class NotFoundComponent {}
