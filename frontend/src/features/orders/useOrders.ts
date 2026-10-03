import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ordersService from '../../services/orders.api';
import { queryKeys } from '../../services/queryKeys';
import { useAppDispatch } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';
import { getErrorMessage } from '../../utils';
import type { CreateOrderPayload } from '../../types';

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders.list(),
    queryFn: ordersService.getOrders,
    staleTime: 30 * 1000,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: () => ordersService.getOrder(id as string),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useCreateOrder() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersService.createOrder(payload),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      // Placing an order empties the cart server side.
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      dispatch(showToast({ message: `Order ${order.orderNumber} placed`, type: 'success' }));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });
}

export function useCancelOrder() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.cancelOrder(id),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      dispatch(showToast({ message: 'Order cancelled', type: 'success' }));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });
}