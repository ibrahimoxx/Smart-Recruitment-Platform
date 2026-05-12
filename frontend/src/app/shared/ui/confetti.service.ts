import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({ providedIn: 'root' })
export class ConfettiService {
  celebrate(): void {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    };

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#7C3AED', '#EC4899'] });
    fire(0.2, { spread: 60, colors: ['#06B6D4', '#10B981'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#7C3AED', '#EC4899', '#06B6D4'] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }

  side(): void {
    const end = Date.now() + 2000;
    const tick = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#7C3AED', '#EC4899', '#06B6D4'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#7C3AED', '#EC4899', '#06B6D4'] });
      if (Date.now() < end) requestAnimationFrame(tick);
    };
    tick();
  }
}
