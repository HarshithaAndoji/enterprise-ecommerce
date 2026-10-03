import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminService from '../../services/admin.api';
import { queryKeys } from '../../services/queryKeys';
import { useAppDispatch } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';
import { getErrorMessage } from '../../utils';
import type {
  Category,
  Order,
  OrderStatus,
  Product,
  User,
} from '../../types';

/* --------------------------------- stats ---------------------------------- */

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: adminService.getDashboardStats,
    staleTime: 60 * 1000,
  });
}

/* -------------------------------- products -------------------------------- */

export function useAdminProducts() {
  return useQuery({
    queryKey: queryKeys.admin.products(),
    queryFn: adminService.getAdminProducts,
    staleTime: 30 * 1000,
  });
}

function useAdminProductMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const onError = (error: unknown) => {
    dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
  };

  return {
    queryClient,
    dispatch,
    onError,
  };
}

export function useCreateProduct() {
  const { queryClient, dispatch, onError } = useAdminProductMutation();

  return useMutation({
    mutationFn: (payload: Partial<Product>) => adminService.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      dispatch(showToast({ message: 'Product created', type: 'success' }));
    },
    onError,
  });
}

export function useUpdateProduct() {
  const { queryClient, dispatch, onError } = useAdminProductMutation();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Product> }) =>
      adminService.updateProduct(id, payload),
    onSuccess: (product: Product) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(product.id) });
      dispatch(showToast({ message: 'Product updated', type: 'success' }));
    },
    onError,
  });
}

export function useDeleteProduct() {
  const { queryClient, dispatch, onError } = useAdminProductMutation();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      dispatch(showToast({ message: 'Product deleted', type: 'success' }));
    },
    onError,
  });
}

/* ------------------------------- categories ------------------------------- */

export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.admin.categories(),
    queryFn: adminService.getAdminCategories,
    staleTime: 60 * 1000,
  });
}

export function useCreateCategory() {
  const { queryClient, dispatch, onError } = useAdminProductMutation();

  return useMutation({
    mutationFn: (payload: Partial<Category>) => adminService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      dispatch(showToast({ message: 'Category created', type: 'success' }));
    },
    onError,
  });
}

export function useUpdateCategory() {
  const { queryClient, dispatch, onError } = useAdminProductMutation();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Category> }) =>
      adminService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      dispatch(showToast({ message: 'Category updated', type: 'success' }));
    },
    onError,
  });
}

export function useDeleteCategory() {
  const { queryClient, dispatch, onError } = useAdminProductMutation();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      dispatch(showToast({ message: 'Category deleted', type: 'success' }));
    },
    onError,
  });
}

/* ---------------------------------- users --------------------------------- */

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: adminService.getAdminUsers,
    staleTime: 60 * 1000,
  });
}

export function useSetUserStatus() {
  const { queryClient, dispatch, onError } = useAdminProductMutation();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.setUserStatus(id, isActive),
    onSuccess: (user: User) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      dispatch(
        showToast({
          message: `${user.name} ${user.isActive ? 'activated' : 'deactivated'}`,
          type: 'success',
        }),
      );
    },
    onError,
  });
}

/* --------------------------------- orders --------------------------------- */

export function useAdminOrders() {
  return useQuery({
    queryKey: queryKeys.admin.orders(),
    queryFn: adminService.getAdminOrders,
    staleTime: 30 * 1000,
  });
}

export function useSetOrderStatus() {
  const { queryClient, dispatch, onError } = useAdminProductMutation();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminService.setOrderStatus(id, status),
    onSuccess: (order: Order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      dispatch(showToast({ message: `${order.orderNumber} set to ${order.status}`, type: 'success' }));
    },
    onError,
  });
}

/* --------------------------------- reviews -------------------------------- */

export function useAdminReviews() {
  return useQuery({
    queryKey: queryKeys.admin.reviews(),
    queryFn: adminService.getReviews,
    staleTime: 30 * 1000,
  });
}

export function useDeleteAdminReview() {
  const { queryClient, dispatch, onError } = useAdminProductMutation();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reviews() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      dispatch(showToast({ message: 'Review removed', type: 'success' }));
    },
    onError,
  });
}