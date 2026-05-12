import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="relative mt-24 border-t border-glass" role="contentinfo">
      <div class="absolute top-0 left-0 right-0 h-px"
        style="background: linear-gradient(90deg, transparent, #7C3AED, #EC4899, #06B6D4, transparent);">
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center"
            style="background: linear-gradient(135deg, #7C3AED, #EC4899);">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            </svg>
          </div>
          <span class="text-sm text-white/40">Aurora Recruitment &copy; {{ year }}</span>
        </div>
        <nav class="flex items-center gap-6" aria-label="Footer navigation">
          <a routerLink="/jobs" class="text-xs text-white/30 hover:text-white/60 transition-colors">Browse Jobs</a>
          <a routerLink="/login" class="text-xs text-white/30 hover:text-white/60 transition-colors">Sign in</a>
          <a routerLink="/register" class="text-xs text-white/30 hover:text-white/60 transition-colors">Register</a>
        </nav>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
