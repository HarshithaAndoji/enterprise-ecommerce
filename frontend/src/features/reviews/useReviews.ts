import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as reviewsService from '../../services/reviews.api';
import { queryKeys } from '../../services/queryKeys';
import { useAppDispatch } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';
import { getErrorMessage } from '../../utils';
import type { CreateReviewPayload, UpdateReviewPayload } from '../../types';

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.byProduct(productId ?? ''),
    queryFn: () => reviewsService.getProductReviews(productId as string),
    enabled: Boolean(productId),
    staleTime: 60 * 1000,
  });
}

export function useCreateReview(productId: string) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsService.createReview(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byProduct(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      dispatch(showToast({ message: 'Thanks for your review', type: 'success' }));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });
}

export function useUpdateReview() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReviewPayload }) =>
      reviewsService.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      dispatch(showToast({ message: 'Review updated', type: 'success' }));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });
}

export function useDeleteReview() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      dispatch(showToast({ message: 'Review deleted', type: 'info' }));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });
}