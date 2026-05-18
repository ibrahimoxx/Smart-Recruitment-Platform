import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ThemeService } from './shared/ui/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  template: `
    <a class="skip-to-content" href="#main-content">Skip to content</a>
    <router-outlet />
    <ngx-sonner-toaster
      position="top-center"
      [richColors]="true"
      [closeButton]="true"
      [duration]="5000"
      [expand]="true"
    />
  `,
})
export class App implements OnInit {
  private theme = inject(ThemeService);

  ngOnInit(): void {
    /* ThemeService constructor handles class on documentElement */
  }
}
