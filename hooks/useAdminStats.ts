import { useQuery } from '@tanstack/react-query';
import API from '@/utils/api';
export interface MonthlyOrderData {
  month: string;
  orders: number;
  revenue: number;
}
export interface OrderStatusData {
  status: string;
  count: number;
}
export interface AdminStats {
  totalOrders: number;
  activePartners: number;
  totalPartners: number;
  pendingRequests: number;
  pendingOrders: number;
  totalRevenue: number;
  statsChange: {
    ordersChange: number;
    partnersChange: number;
    totalPartnersChange: number;
    requestsChange: number;
    pendingOrdersChange: number;
    revenueChange: number;
  };
  monthlyOrders: MonthlyOrderData[];
  orderStatus: OrderStatusData[];
}
export const useAdminStats = () => {
  return useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await API.get('/admin/stats');
      return response.data;
    },
    refetchInterval: 300000, 
  });
};
