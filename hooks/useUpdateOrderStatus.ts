import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import API from '@/utils/api';
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await API.patch(`/partners/orders/${orderId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerOrders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.error || 'Failed to update order status');
    },
  });
};
