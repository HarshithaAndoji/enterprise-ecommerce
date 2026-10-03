import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Cart, CartItem } from '../../types';
import { getCartItemCount, getErrorMessage } from '../../utils';
import * as cartService from '../../services/cart.api';
import type { AppDispatch } from '../store';

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

function itemsFromCart(cart: Cart): CartItem[] {
  return cart?.items ?? [];
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemStart(state) {
      state.loading = true;
      state.error = null;
    },
    addItemSuccess(state, action: PayloadAction<CartItem[]>) {
      state.loading = false;
      state.error = null;
      state.items = action.payload;
    },
    addItemFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateItemSuccess(state, action: PayloadAction<CartItem[]>) {
      state.loading = false;
      state.error = null;
      state.items = action.payload;
    },
    removeItemSuccess(state, action: PayloadAction<CartItem[]>) {
      state.loading = false;
      state.error = null;
      state.items = action.payload;
    },
    clearCartSuccess(state) {
      state.loading = false;
      state.error = null;
      state.items = [];
    },
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  addItemStart,
  addItemSuccess,
  addItemFailure,
  updateItemSuccess,
  removeItemSuccess,
  clearCartSuccess,
  setCart,
} = cartSlice.actions;

/* -------------------------------------------------------------------------- */
/*                                  Thunks                                    */
/* -------------------------------------------------------------------------- */

export const fetchCartThunk =
  () =>
  async (dispatch: AppDispatch): Promise<CartItem[]> => {
    const cart = await cartService.getCart();
    const items = itemsFromCart(cart);
    dispatch(setCart(items));
    return items;
  };

export const addToCartThunk =
  (productId: string, quantity = 1) =>
  async (dispatch: AppDispatch): Promise<CartItem[]> => {
    dispatch(addItemStart());
    try {
      const cart = await cartService.addToCart(productId, quantity);
      const items = itemsFromCart(cart);
      dispatch(addItemSuccess(items));
      return items;
    } catch (error) {
      dispatch(addItemFailure(getErrorMessage(error, 'Unable to add this item to your cart.')));
      throw error;
    }
  };

export const updateCartItemThunk =
  (itemId: string, quantity: number) =>
  async (dispatch: AppDispatch): Promise<CartItem[]> => {
    try {
      const cart = await cartService.updateCartItem(itemId, quantity);
      const items = itemsFromCart(cart);
      dispatch(updateItemSuccess(items));
      return items;
    } catch (error) {
      dispatch(addItemFailure(getErrorMessage(error, 'Unable to update this item.')));
      throw error;
    }
  };

export const removeCartItemThunk =
  (itemId: string) =>
  async (dispatch: AppDispatch): Promise<CartItem[]> => {
    try {
      const cart = await cartService.removeCartItem(itemId);
      const items = itemsFromCart(cart);
      dispatch(removeItemSuccess(items));
      return items;
    } catch (error) {
      dispatch(addItemFailure(getErrorMessage(error, 'Unable to remove this item.')));
      throw error;
    }
  };

export const clearCartThunk =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      await cartService.clearCart();
      dispatch(clearCartSuccess());
    } catch (error) {
      dispatch(addItemFailure(getErrorMessage(error, 'Unable to empty your cart.')));
      throw error;
    }
  };

/* ------------------------------- selectors -------------------------------- */

export const selectCartItems = (state: { cart: CartState }): CartItem[] => state.cart.items;
export const selectCartLoading = (state: { cart: CartState }): boolean => state.cart.loading;
export const selectCartError = (state: { cart: CartState }): string | null => state.cart.error;
export const selectCartCount = (state: { cart: CartState }): number =>
  getCartItemCount(state.cart.items);

export default cartSlice.reducer;