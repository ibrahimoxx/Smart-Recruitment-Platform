import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-glass-select',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GlassSelectComponent), multi: true }],
  template: `
    <div>
      @if (label) {
        <label [for]="selectId" class="block text-sm font-medium text-white/70 mb-1.5">
          {{ label }}
          @if (required) { <span class="text-aurora-pink ml-0.5" aria-hidden="true">*</span> }
        </label>
      }
      <div class="relative">
        <select
          [id]="selectId"
          [disabled]="isDisabled"
          [attr.required]="required ? true : null"
          [attr.aria-invalid]="!!error"
          (change)="onChange($event)"
          (blur)="onTouched()"
          class="input-glass appearance-none pr-10"
          [class.border-red-500]="!!error"
        >
          @if (placeholder) {
            <option value="" [selected]="!value()" disabled>{{ placeholder }}</option>
          }
          @for (opt of options; track opt.value) {
            <option [value]="opt.value" [selected]="opt.value === value()" style="background:#12121C;color:white;">
              {{ opt.label }}
            </option>
          }
        </select>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      @if (error) {
        <p [id]="selectId + '-error'" class="mt-1 text-xs text-red-400" role="alert">{{ error }}</p>
      }
    </div>
  `,
})
export class GlassSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: SelectOption[] = [];
  @Input() error = '';
  @Input() required = false;
  @Input() selectId = `select-${Math.random().toString(36).slice(2, 8)}`;

  value = signal('');
  isDisabled = false;

  private _onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: string): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.value.set(val);
    this._onChange(val);
  }
}
