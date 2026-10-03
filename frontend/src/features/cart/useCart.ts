import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as cartService from '../../services/cart.api';
import { queryKeys } from '../../services/queryKeys';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  addItemFailure,
  clearCartSuccess,
  selectCartCount,
  setCart,
} from '../../store/slices/cartSlice';
import { showToast } from '../../store/slices/uiSlice';
import { getErrorMessage } from '../../utils';
import type { Cart } from '../../types';

const EMPTY_CART: Cart = {
  id: 'cart',
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
};

/**
 * Cart server state. TanStack Query is the source of truth; the Redux cart
 * slice mirrors the item list so the header badge can read it synchronously.
 */
export function useCart() {
  const dispatch = useAppDispatch();

  const query = useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: cartService.getCart,
    staleTime: 15 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) dispatch(setCart(query.data.items));
  }, [query.data, dispatch]);

  return { ...query, cart: query.data ?? EMPTY_CART };
}

/** Synchronous item count for the header badge, straight from Redux. */
export function useCartCount(): number {
  return useAppSelector(selectCartCount);
}

export interface AddToCartVariables {
  productId: string;
  quantity?: number;
}

export function useAddToCart() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity = 1 }: AddToCartVariables) =>
      cartService.addToCart(productId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.all, cart);
      dispatch(setCart(cart.items));
      dispatch(showToast({ message: 'Added to your cart', type: 'success' }));
    },
    onError: (error) => {
      dispatch(addItemFailure(getErrorMessage(error)));
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });
}

export function useUpdateCartItem() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateCartItem(itemId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.all, cart);
      dispatch(setCart(cart.items));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });
}

export function useRemoveCartItem() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeCartItem(itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.all, cart);
      dispatch(setCart(cart.items));
      dispatch(showToast({ message: 'Item removed from your cart', type: 'info' }));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });
}

export function useClearCart() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.cart.all, EMPTY_CART);
      dispatch(clearCartSuccess());
      dispatch(showToast({ message: 'Cart emptied', type: 'info' }));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });
}