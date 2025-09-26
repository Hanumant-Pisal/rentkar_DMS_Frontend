import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import API from '@/utils/api';
import { getUser, setUser } from '@/utils/auth';
import type { User } from '@/types';
interface PartnerUser extends User {
  isAvailable: boolean;
}
interface UpdateAvailabilityResponse {
  message: string;
  partner: PartnerUser;
}
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation<UpdateAvailabilityResponse, Error, boolean>({
    mutationFn: async (isAvailable: boolean) => {
      const response = await API.patch<UpdateAvailabilityResponse>('/partners/availability', { isAvailable });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], (oldData: User | undefined) => {
        if (!oldData) return oldData;
        const updatedUser = {
          ...oldData,
          isAvailable: data.partner.isAvailable
        } as PartnerUser;
        try {
          setUser(updatedUser);
        } catch (error) {
          console.error('Failed to update stored user data:', error);
        }
        return updatedUser;
      });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      const availabilityStatus = data.partner.isAvailable ? 'available' : 'unavailable';
      toast.success(`You are now ${availabilityStatus}`);
    },
    onError: (error: any) => {
      console.error('Error updating availability:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update availability';
      toast.error(errorMessage);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};
