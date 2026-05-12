import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-glass-textarea',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GlassTextareaComponent), multi: true }],
  template: `
    <div>
      @if (label) {
        <label [for]="textareaId" class="block text-sm font-medium text-white/70 mb-1.5">
          {{ label }}
          @if (required) { <span class="text-aurora-pink ml-0.5" aria-hidden="true">*</span> }
        </label>
      }
      <textarea
        [id]="textareaId"
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        [rows]="rows"
        [attr.required]="required ? true : null"
        [attr.maxlength]="maxLength ?? null"
        [attr.aria-describedby]="error ? textareaId + '-error' : null"
        [attr.aria-invalid]="!!error"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="input-glass resize-none"
        [class.border-red-500]="!!error"
      >{{ value() }}</textarea>
      <div class="flex items-center justify-between mt-1">
        @if (error) {
          <p [id]="textareaId + '-error'" class="text-xs text-red-400 flex items-center gap-1" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </p>
        } @else { <span></span> }
        @if (maxLength) {
          <span class="text-xs" [class.text-red-400]="value().length > maxLength * 0.9" [class.text-white/30]="value().length <= maxLength * 0.9">
            {{ value().length }}/{{ maxLength }}
          </span>
        }
      </div>
    </div>
  `,
})
export class GlassTextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() maxLength: number | null = null;
  @Input() error = '';
  @Input() required = false;
  @Input() textareaId = `textarea-${Math.random().toString(36).slice(2, 8)}`;

  value = signal('');
  isDisabled = false;

  private _onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: string): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onInput(e: Event): void {
    const val = (e.target as HTMLTextAreaElement).value;
    this.value.set(val);
    this._onChange(val);
  }
}
