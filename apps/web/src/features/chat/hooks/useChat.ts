import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { SendMessageInput } from '@teamflow/shared';

export const useChannels = () => {
  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get(`/channels`);
      return response.data.data;
    },
  });
};

export const useMessages = (channelId: string) => {
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const response = await api.get(`/channels/${channelId}/messages`);
      return response.data.data;
    },
    enabled: !!channelId,
  });
};

export const useSendMessage = (channelId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageInput) => {
      const response = await api.post(`/channels/${channelId}/messages`, data);
      return response.data.data;
    },
    // We let the socket event handle the actual UI update to avoid duplicates if possible,
    // or optimistically append it here and ignore the socket event if it's our own message.
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', channelId], (old: any) => {
        if (!old) return [newMessage];
        // Ensure we don't duplicate if socket beat us to it
        if (old.some((m: any) => m.id === newMessage.id)) return old;
        return [...old, newMessage];
      });
    },
  });
};
