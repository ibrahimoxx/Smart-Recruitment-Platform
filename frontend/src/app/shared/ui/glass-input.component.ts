import {
  Component, Input, forwardRef, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-glass-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GlassInputComponent), multi: true }],
  template: `
    <div class="relative">
      @if (label) {
        <label [for]="inputId" class="block text-sm font-medium text-white/70 mb-1.5">
          {{ label }}
          @if (required) { <span class="text-aurora-pink ml-0.5" aria-hidden="true">*</span> }
        </label>
      }
      <div class="relative">
        @if (iconLeft) {
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
            <ng-content select="[iconLeft]" />
          </span>
        }
        <input
          [id]="inputId"
          [type]="showPassword() ? 'text' : type"
          [placeholder]="placeholder"
          [disabled]="isDisabled"
          [attr.required]="required ? true : null"
          [attr.autocomplete]="autocomplete"
          [attr.aria-describedby]="error ? inputId + '-error' : null"
          [attr.aria-invalid]="!!error"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="input-glass"
          [class.pl-10]="iconLeft"
          [class.pr-10]="type === 'password'"
          [class.border-red-500]="!!error"
          [class.focus:border-red-500]="!!error"
        />
        @if (type === 'password') {
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            (click)="showPassword.set(!showPassword())"
            [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
          >
            @if (showPassword()) {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          </button>
        }
      </div>
      @if (error) {
        <p [id]="inputId + '-error'" class="mt-1 text-xs text-red-400 flex items-center gap-1" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </p>
      }
      @if (hint && !error) {
        <p class="mt-1 text-xs text-white/40">{{ hint }}</p>
      }
    </div>
  `,
})
export class GlassInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() error = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() autocomplete = 'off';
  @Input() iconLeft = false;
  @Input() inputId = `input-${Math.random().toString(36).slice(2, 8)}`;

  value = signal('');
  showPassword = signal(false);
  isDisabled = false;

  private _onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: string): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.value.set(val);
    this._onChange(val);
  }
}
