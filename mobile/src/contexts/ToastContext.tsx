import React, { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react';
import { ToastStack } from '@/components/ui/Toast';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  duration: number;
};

export type ShowToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

type ToastContextType = {
  show: (options: ShowToastOptions) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string, options?: Partial<ShowToastOptions>) => string;
  error: (title: string, description?: string, options?: Partial<ShowToastOptions>) => string;
  warning: (title: string, description?: string, options?: Partial<ShowToastOptions>) => string;
  info: (title: string, description?: string, options?: Partial<ShowToastOptions>) => string;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 3200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const show = useCallback(
    (options: ShowToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastItem = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? 'info',
        icon: options.icon,
        actionLabel: options.actionLabel,
        onAction: options.onAction,
        duration: options.duration ?? DEFAULT_DURATION,
      };
      setItems((prev) => [...prev, item].slice(-MAX_VISIBLE));
      timers.current[id] = setTimeout(() => dismiss(id), item.duration);
      return id;
    },
    [dismiss],
  );

  const makeShorthand = useCallback(
    (variant: ToastVariant) =>
      (title: string, description?: string, options?: Partial<ShowToastOptions>) =>
        show({ title, description, variant, ...options }),
    [show],
  );

  const value = useMemo<ToastContextType>(
    () => ({
      show,
      dismiss,
      success: makeShorthand('success'),
      error: makeShorthand('error'),
      warning: makeShorthand('warning'),
      info: makeShorthand('info'),
    }),
    [show, dismiss, makeShorthand],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
