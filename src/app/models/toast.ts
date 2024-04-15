export interface Toast {
  message: string;
  type: ToastType;
}

export enum ToastType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}
