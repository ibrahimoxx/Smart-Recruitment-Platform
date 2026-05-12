import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(message: string, description?: string): void {
    toast.success(message, { description });
  }

  error(message: string, description?: string): void {
    toast.error(message, { description });
  }

  info(message: string, description?: string): void {
    toast.info(message, { description });
  }

  warning(message: string, description?: string): void {
    toast.warning(message, { description });
  }

  loading(message: string): string | number {
    return toast.loading(message);
  }

  dismiss(id?: string | number): void {
    toast.dismiss(id);
  }

  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ): void {
    toast.promise(promise, messages);
  }
}
