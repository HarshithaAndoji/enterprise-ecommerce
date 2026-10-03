import type { AxiosError } from 'axios';
import type { CartItem, Product, ToastType } from '../types';

/**
 * Joins truthy class names together. Handy for conditional Tailwind classes.
 */
export function classNames(
  ...classes: Array<string | boolean | undefined | null>
): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a number as currency, e.g. 1234.5 -> "$1,234.50".
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a plain number with thousands separators.
 */
export function formatNumber(value: number, locale = 'en-US'): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(locale).format(safe);
}

/**
 * Converts free text into a URL friendly slug.
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncates text and appends an ellipsis when it is shortened.
 */
export function truncate(text: string, length: number): string {
  if (!text) return '';
  if (length <= 0) return '';
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}...`;
}

/**
 * Human readable date formatting used across order and profile screens.
 */
export function formatDate(
  value: string | number | Date,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export const TAX_RATE = 0.08;
export const SHIPPING_FLAT_RATE = 9.99;
export const FREE_SHIPPING_THRESHOLD = 100;

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

/**
 * Single source of truth for cart maths so the cart page, cart drawer and
 * checkout summary can never disagree.
 */
export function calculateCartTotals(
  items: CartItem[],
  discount = 0,
): CartTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + getCartItemPrice(item) * item.quantity,
    0,
  );
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = subtotal - safeDiscount;
  const tax = roundMoney(taxable * TAX_RATE);
  const shipping =
    items.length === 0 || taxable >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT_RATE;
  const total = roundMoney(taxable + tax + shipping);
  return { subtotal: roundMoney(subtotal), tax, shipping, discount: safeDiscount, total };
}

export function getCartItemPrice(item: CartItem): number {
  return item.price ?? item.product?.price ?? 0;
}

export function getCartItemTotal(item: CartItem): number {
  return roundMoney(getCartItemPrice(item) * item.quantity);
}

export function roundMoney(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function isOutOfStock(product: Product): boolean {
  return product.stock <= 0;
}

export function isLowStock(product: Product, threshold = 10): boolean {
  return product.stock > 0 && product.stock <= threshold;
}

export function getDiscountPercentage(
  price: number,
  compareAtPrice?: number | null,
): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * Best-effort, human friendly error message extraction for UI error states.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const data = axiosError?.response?.data;
  if (data?.message) return data.message;
  if (data?.errors) {
    const first = Object.values(data.errors)[0]?.[0];
    if (first) return first;
  }
  if (axiosError?.message && !axiosError.message.includes('Network Error')) {
    return axiosError.message;
  }
  return fallback;
}

export const TOAST_STYLES: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

export const STATUS_TONES: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  paid: 'success',
  pending_payment: 'warning',
  failed: 'danger',
  refunded: 'neutral',
  active: 'success',
  inactive: 'danger',
  admin: 'accent',
  customer: 'info',
};

/**
 * Non-cryptographic pseudo unique id for optimistic UI entries.
 */
export function createId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}