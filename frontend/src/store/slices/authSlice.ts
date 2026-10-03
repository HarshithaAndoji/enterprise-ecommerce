import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthResult, UpdateProfilePayload, User } from '../../types';
import { getErrorMessage } from '../../utils';
import {
  clearAuthToken,
  clearStoredUser,
  getAuthToken,
  getStoredUser,
  setAuthToken,
  setStoredUser,
} from '../../services/api';
import * as authService from '../../services/auth.api';
import type { AppDispatch } from '../store';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  /** Non-error feedback, e.g. "reset link sent". */
  message: string | null;
}

const initialToken = getAuthToken();
const initialUser = getStoredUser<User>();

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  loading: false,
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    loginSuccess(state, action: PayloadAction<AuthResult>) {
      state.loading = false;
      state.error = null;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setAuthToken(action.payload.token);
      setStoredUser(action.payload.user);
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    registerStart(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    registerSuccess(state, action: PayloadAction<AuthResult>) {
      state.loading = false;
      state.error = null;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setAuthToken(action.payload.token);
      setStoredUser(action.payload.user);
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.message = null;
      clearAuthToken();
      clearStoredUser();
    },
    clearError(state) {
      state.error = null;
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      setStoredUser(action.payload);
    },
    forgotPasswordStart(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    forgotPasswordSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = null;
      state.message = action.payload;
    },
    resetPasswordStart(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    resetPasswordSuccess(state) {
      state.loading = false;
      state.error = null;
      state.message = 'Your password has been reset. You can sign in now.';
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearError,
  updateUser,
  forgotPasswordStart,
  forgotPasswordSuccess,
  resetPasswordStart,
  resetPasswordSuccess,
} = authSlice.actions;

/* -------------------------------------------------------------------------- */
/*                                  Thunks                                    */
/* -------------------------------------------------------------------------- */

/**
 * Credentials stay inside this closure: the password is never placed in a
 * dispatched action, so it never lands in Redux state or the devtools log.
 */
export const loginThunk =
  (credentials: { email: string; password: string }) =>
  async (dispatch: AppDispatch): Promise<AuthResult> => {
    dispatch(loginStart());
    try {
      const result = await authService.login(credentials.email, credentials.password);
      dispatch(loginSuccess(result));
      return result;
    } catch (error) {
      dispatch(loginFailure(getErrorMessage(error, 'Unable to sign in.')));
      throw error;
    }
  };

export const registerThunk =
  (payload: { name: string; email: string; password: string }) =>
  async (dispatch: AppDispatch): Promise<AuthResult> => {
    dispatch(registerStart());
    try {
      const result = await authService.register(payload.name, payload.email, payload.password);
      dispatch(registerSuccess(result));
      return result;
    } catch (error) {
      dispatch(registerFailure(getErrorMessage(error, 'Unable to create your account.')));
      throw error;
    }
  };

export const forgotPasswordThunk =
  (email: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(forgotPasswordStart());
    try {
      await authService.forgotPassword(email);
      dispatch(
        forgotPasswordSuccess(
          'If an account exists for that email, a reset link is on its way.',
        ),
      );
    } catch (error) {
      dispatch(loginFailure(getErrorMessage(error, 'Unable to send the reset link.')));
      throw error;
    }
  };

export const resetPasswordThunk =
  (payload: { token: string; password: string }) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(resetPasswordStart());
    try {
      await authService.resetPassword(payload.token, payload.password);
      dispatch(resetPasswordSuccess());
    } catch (error) {
      dispatch(loginFailure(getErrorMessage(error, 'Unable to reset your password.')));
      throw error;
    }
  };

export const getProfileThunk =
  () =>
  async (dispatch: AppDispatch): Promise<User> => {
    try {
      const user = await authService.getProfile();
      dispatch(updateUser(user));
      return user;
    } catch (error) {
      dispatch(logout());
      throw error;
    }
  };

export const updateProfileThunk =
  (payload: UpdateProfilePayload) =>
  async (dispatch: AppDispatch): Promise<User> => {
    try {
      const user = await authService.updateProfile(payload);
      dispatch(updateUser(user));
      return user;
    } catch (error) {
      dispatch(loginFailure(getErrorMessage(error, 'Unable to update your profile.')));
      throw error;
    }
  };

export default authSlice.reducer;