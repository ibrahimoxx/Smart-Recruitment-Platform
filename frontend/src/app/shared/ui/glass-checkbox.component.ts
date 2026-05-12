import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-glass-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GlassCheckboxComponent), multi: true }],
  template: `
    <label class="inline-flex items-center gap-3 cursor-pointer group">
      <div class="relative flex-shrink-0">
        <input
          type="checkbox"
          [checked]="value()"
          [disabled]="isDisabled"
          (change)="onChange($event)"
          (blur)="onTouched()"
          class="sr-only"
          [attr.aria-label]="label"
        />
        <div
          class="w-5 h-5 rounded-md border transition-all duration-200 flex items-center justify-center"
          [class.bg-aurora-violet]="value()"
          [class.border-aurora-violet]="value()"
          [class.border-glass]="!value()"
          [class.glass]="!value()"
          style="box-shadow: {{ value() ? '0 0 12px rgba(124,58,237,0.4)' : 'none' }}"
        >
          @if (value()) {
            <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          }
        </div>
      </div>
      @if (label) {
        <span class="text-sm text-white/70 group-hover:text-white/90 transition-colors select-none">
          {{ label }}
        </span>
      }
    </label>
  `,
})
export class GlassCheckboxComponent implements ControlValueAccessor {
  @Input() label = '';

  value = signal(false);
  isDisabled = false;

  private _onChange: (v: boolean) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: boolean): void { this.value.set(!!v); }
  registerOnChange(fn: (v: boolean) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onChange(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.value.set(checked);
    this._onChange(checked);
  }
}
