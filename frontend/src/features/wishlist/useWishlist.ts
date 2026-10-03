import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as wishlistService from '../../services/wishlist.api';
import { queryKeys } from '../../services/queryKeys';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';
import { getErrorMessage } from '../../utils';

/** Wishlist query, only enabled for a signed in user. */
export function useWishlist() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.wishlist.all,
    queryFn: wishlistService.getWishlist,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

/** Heart state for a single product card. */
export function useIsInWishlist(productId: string) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.wishlist.check(productId),
    queryFn: () => wishlistService.checkWishlist(productId),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useToggleWishlist() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const sync = (products: Awaited<ReturnType<typeof wishlistService.getWishlist>>) => {
    queryClient.setQueryData(queryKeys.wishlist.all, products);
    queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    return products;
  };

  const add = useMutation({
    mutationFn: (productId: string) => wishlistService.addToWishlist(productId),
    onSuccess: (products) => {
      sync(products);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      dispatch(showToast({ message: 'Saved to your wishlist', type: 'success' }));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });

  const remove = useMutation({
    mutationFn: (productId: string) => wishlistService.removeFromWishlist(productId),
    onSuccess: (products) => {
      sync(products);
      dispatch(showToast({ message: 'Removed from your wishlist', type: 'info' }));
    },
    onError: (error) => {
      dispatch(showToast({ message: getErrorMessage(error), type: 'error' }));
    },
  });

  return { add, remove };
}

export function useAddToWishlist() {
  return useToggleWishlist().add;
}

export function useRemoveFromWishlist() {
  return useToggleWishlist().remove;
}