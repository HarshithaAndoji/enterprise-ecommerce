import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../services/queryKeys';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  clearError,
  getProfileThunk,
  loginThunk,
  registerThunk,
  resetPasswordThunk,
  forgotPasswordThunk,
  updateProfileThunk,
} from '../../store/slices/authSlice';
import { getErrorMessage } from '../../utils';
import type { User } from '../../types';

/**
 * Authentication hooks built on TanStack Query mutations that dispatch the
 * matching Redux thunks. TanStack owns request state, Redux owns the session.
 * Passwords only ever live in the local closure of the mutation variables and
 * are never written to the store.
 */
export function useLogin() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      dispatch(loginThunk(credentials)).then((result) => result),
    // Errors are cleared by loginStart on the next attempt, not on settle, so a
    // rejected sign in stays visible in the form.
    onMutate: () => {
      dispatch(clearError());
    },
  });
}

export function useRegister() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      dispatch(registerThunk(payload)).then((result) => result),
  });
}

export function useForgotPassword() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (email: string) => dispatch(forgotPasswordThunk(email)).then(() => undefined),
  });
}

export function useResetPassword() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (payload: { token: string; password: string }) =>
      dispatch(resetPasswordThunk(payload)).then(() => undefined),
  });
}

/** Loads the signed in user's profile and mirrors it into Redux. */
export function useProfile() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: async () => dispatch(getProfileThunk()).then((user: User) => user),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useUpdateProfile() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateProfileThunk>[0]) =>
      dispatch(updateProfileThunk(payload)).then((user: User) => user),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.profile.all, user);
    },
  });
}

/** Session helpers for components that only need to know the current user. */
export function useAuthState() {
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const logout = useCallback(() => {
    dispatch({ type: 'auth/logout' });
  }, [dispatch]);

  return { user, isAuthenticated, loading, error, logout };
}

export { getErrorMessage };