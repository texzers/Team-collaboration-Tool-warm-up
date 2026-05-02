import { useGoogleLogin } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { AuthResponse } from '@teamflow/shared';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post<{ data: AuthResponse }>('/auth/google', { code });
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data);
      navigate('/');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // Here you could trigger a toast notification
    },
  });

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      mutation.mutate(codeResponse.code);
    },
    flow: 'auth-code',
  });

  return {
    login,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      clearAuth();
      navigate('/login');
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
