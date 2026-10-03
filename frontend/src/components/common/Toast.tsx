import { useEffect } from 'react';
import type { ToastMessage, ToastType } from '../../types';
import { APP_TOAST_EVENT } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { hideToast, selectToast, showToast } from '../../store/slices/uiSlice';
import { classNames } from '../../utils';
import { Icon } from './Icon';
import type { IconName } from './Icon';

const TONE_STYLES: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

const TONE_ICONS: Record<ToastType, IconName> = {
  success: 'check',
  error: 'warning',
  info: 'info',
};

const AUTO_DISMISS_MS = 4000;

/**
 * Global toast outlet. It renders the Redux toast and also listens for the
 * window event emitted by the axios layer, so transport level failures show up
 * without any component having to wire them up.
 */
export function Toast() {
  const toast = useAppSelector(selectToast);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastMessage>).detail;
      if (!detail?.message) return;
      dispatch(showToast({ message: detail.message, type: detail.type ?? 'info' }));
    };
    window.addEventListener(APP_TOAST_EVENT, onToast);
    return () => window.removeEventListener(APP_TOAST_EVENT, onToast);
  }, [dispatch]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => dispatch(hideToast()), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4 sm:justify-end sm:pr-6"
      role="status"
      aria-live="polite"
    >
      <div
        className={classNames(
          'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
          TONE_STYLES[toast.type],
        )}
      >
        <Icon name={TONE_ICONS[toast.type]} className="mt-0.5 h-5 w-5" />
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={() => dispatch(hideToast())}
          className="rounded p-1 text-current/70 transition hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-current"
          aria-label="Dismiss notification"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Toast;