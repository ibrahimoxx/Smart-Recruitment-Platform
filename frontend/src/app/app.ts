import { Component, OnInit, Renderer2, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <a class="skip-to-content" href="#main-content">Skip to content</a>
    <main id="main-content">
      <router-outlet />
    </main>
  `,
  styles: [],
})
export class App implements OnInit {
  private renderer = inject(Renderer2);

  ngOnInit(): void {
    this.renderer.addClass(document.documentElement, 'dark');
  }
}
