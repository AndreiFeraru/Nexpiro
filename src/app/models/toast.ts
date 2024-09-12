export interface Toast {
  message: string;
  type: ToastType;
  isSticky?: boolean;
}

export enum ToastType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}
