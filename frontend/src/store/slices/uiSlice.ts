import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ToastMessage, ToastType } from '../../types';

export interface UiState {
  isMobileMenuOpen: boolean;
  isCartDrawerOpen: boolean;
  toast: ToastMessage | null;
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
      // Opening the nav should never leave the cart drawer on screen.
      if (state.isMobileMenuOpen) state.isCartDrawerOpen = false;
    },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.isMobileMenuOpen = action.payload;
      if (action.payload) state.isCartDrawerOpen = false;
    },
    toggleCartDrawer(state) {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
      if (state.isCartDrawerOpen) state.isMobileMenuOpen = false;
    },
    setCartDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isCartDrawerOpen = action.payload;
      if (action.payload) state.isMobileMenuOpen = false;
    },
    showToast(state, action: PayloadAction<ToastMessage>) {
      state.toast = action.payload;
    },
    hideToast(state) {
      state.toast = null;
    },
  },
});

export const {
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleCartDrawer,
  setCartDrawerOpen,
  showToast,
  hideToast,
} = uiSlice.actions;

/* ------------------------------ helpers ----------------------------------- */

/** Imperative toast helper for code that lives outside React components. */
export function notify(message: string, type: ToastType = 'info'): ToastMessage {
  return { message, type };
}

export const selectMobileMenuOpen = (state: { ui: UiState }): boolean =>
  state.ui.isMobileMenuOpen;
export const selectCartDrawerOpen = (state: { ui: UiState }): boolean =>
  state.ui.isCartDrawerOpen;
export const selectToast = (state: { ui: UiState }): ToastMessage | null => state.ui.toast;

export default uiSlice.reducer;