import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toast } from './components/common/Toast';
import AppRoutes from './routes/AppRoutes';
import { AUTH_UNAUTHORIZED_EVENT } from './services/api';
import store, { useAppDispatch } from './store/store';
import { logout } from './store/slices/authSlice';

/**
 * One QueryClient for the whole app. Server state is owned by TanStack Query,
 * session and UI state by Redux.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Watches for the 401 event emitted by the axios layer and clears the session.
 * Keeping this outside the store avoids a circular import.
 */
function AuthEventBridge() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, [dispatch]);

  return null;
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthEventBridge />
          <AppRoutes />
          <Toast />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;