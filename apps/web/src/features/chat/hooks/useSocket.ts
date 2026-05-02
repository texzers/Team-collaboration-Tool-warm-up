import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../../store/auth';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) return;

    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
        auth: { token },
        withCredentials: true,
      });

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on unmount of a single component, keep the singleton connection alive
      // while the user is authenticated. We disconnect on logout.
    };
  }, [token]);

  return { socket, isConnected };
};
