import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GlowColor = 'violet' | 'pink' | 'cyan' | 'emerald' | 'none';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="glass rounded-2xl transition-all duration-300"
      [class]="cardClasses"
      [style.padding]="padding"
    >
      <ng-content />
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class GlassCardComponent {
  @Input() padding = '1.5rem';
  @Input() glow: GlowColor = 'none';
  @Input() hover = false;
  @Input() large = false;

  get cardClasses(): string {
    const classes: string[] = [];
    if (this.hover) classes.push('glass-hover cursor-pointer');
    if (this.large) classes.push('shadow-glass-lg');
    else classes.push('shadow-glass');

    const glowMap: Record<GlowColor, string> = {
      violet: 'shadow-aurora-violet',
      pink: 'shadow-aurora-pink',
      cyan: 'shadow-aurora-cyan',
      emerald: 'shadow-aurora-emerald',
      none: '',
    };
    if (this.glow !== 'none') classes.push(glowMap[this.glow]);

    return classes.join(' ');
  }
}
