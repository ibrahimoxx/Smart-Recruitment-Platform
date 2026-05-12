import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuroraBackgroundComponent } from '../../ui/aurora-background.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AuroraBackgroundComponent],
  template: `
    <div class="min-h-screen flex flex-col relative">
      <app-aurora-background [fixed]="true" />
      <app-navbar />
      <main id="main-content" class="flex-1 pt-16 relative z-10">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class AppShellComponent {}
