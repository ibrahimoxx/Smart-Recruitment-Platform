import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-aurora-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="aurora-bg-wrapper" [class.fixed]="fixed" [class.absolute]="!fixed"
      [class.light-mode]="!theme.isDark()">
      <div class="aurora-orb aurora-orb-1"></div>
      <div class="aurora-orb aurora-orb-2"></div>
      <div class="aurora-orb aurora-orb-3"></div>
      <div class="aurora-mesh"></div>
      <div class="aurora-noise"></div>
    </div>
  `,
  styles: [`
    .aurora-bg-wrapper {
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }
    .fixed { position: fixed; }
    .absolute { position: absolute; }

    .aurora-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.35;
      animation: aurora-pulse 8s ease-in-out infinite;
    }
    .aurora-orb-1 {
      width: 600px; height: 600px;
      background: radial-gradient(circle, #7C3AED 0%, transparent 70%);
      top: -200px; left: -100px;
      animation-delay: 0s;
    }
    .aurora-orb-2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #EC4899 0%, transparent 70%);
      top: 30%; right: -100px;
      animation-delay: -3s;
    }
    .aurora-orb-3 {
      width: 700px; height: 700px;
      background: radial-gradient(circle, #06B6D4 0%, transparent 70%);
      bottom: -200px; left: 30%;
      animation-delay: -5s;
    }
    .aurora-mesh {
      position: absolute;
      inset: 0;
      background:
        conic-gradient(from 0deg at 20% 30%, rgba(124,58,237,0.08) 0deg, transparent 60deg),
        conic-gradient(from 180deg at 80% 70%, rgba(6,182,212,0.06) 0deg, transparent 60deg);
    }
    .aurora-noise {
      position: absolute;
      inset: 0;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    }

    /* Light mode: solid light base + barely-visible pastel orbs */
    .light-mode {
      background: linear-gradient(135deg, #F0EEFF 0%, #EEF6FF 50%, #F5EEFF 100%);
    }
    .light-mode .aurora-orb { opacity: 0.10; filter: blur(100px); }
    .light-mode .aurora-orb-1 { background: radial-gradient(circle, #A78BFA 0%, transparent 70%); }
    .light-mode .aurora-orb-2 { background: radial-gradient(circle, #F9A8D4 0%, transparent 70%); }
    .light-mode .aurora-orb-3 { background: radial-gradient(circle, #67E8F9 0%, transparent 70%); }
    .light-mode .aurora-mesh {
      background:
        conic-gradient(from 0deg at 20% 30%, rgba(167,139,250,0.05) 0deg, transparent 60deg),
        conic-gradient(from 180deg at 80% 70%, rgba(103,232,249,0.04) 0deg, transparent 60deg);
    }
    .light-mode .aurora-noise { opacity: 0.015; }

    @keyframes aurora-pulse {
      0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.35; }
      33% { transform: scale(1.1) translate(20px, -20px); opacity: 0.5; }
      66% { transform: scale(0.9) translate(-20px, 20px); opacity: 0.3; }
    }

    @media (prefers-reduced-motion: reduce) {
      .aurora-orb { animation: none; }
    }
  `],
})
export class AuroraBackgroundComponent {
  @Input() fixed = true;
  theme = inject(ThemeService);
}
