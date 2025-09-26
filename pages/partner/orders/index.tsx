import { useRouter } from 'next/router';
import { useState, ChangeEvent } from 'react';
import { usePartnerOrders } from '@/hooks/usePartnerOrders';
import { useAuth } from '@/hooks/useAuth';
import { withAuth } from '@/components/auth/AuthGuard';
import PartnerLayout from '@/components/layout/PartnerLayout';
import OrderList from '@/components/orders/OrderList';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Search, Filter, Download, Package } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Order } from '@/types';
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];
function PartnerOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { orders: assignedOrders, isLoading } = usePartnerOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const filteredOrders = assignedOrders.filter((order: Order) => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  if (isLoading) {
    return (
      <PartnerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PartnerLayout>
    );
  }
  return (
    <PartnerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Orders</h1>
            <p className="text-gray-300">View and manage your assigned delivery orders</p>
          </div>
        </div>
        {}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {statusOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="hover:bg-gray-700 focus:bg-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <OrderList 
                orders={filteredOrders} 
                partners={[]} 
                onOrderAssigned={() => {}}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <Package className="h-full w-full" />
              </div>
              <p className="mt-1 text-sm text-gray-400">
                {statusFilter === 'all' 
                  ? "You don't have any assigned orders yet."
                  : `No orders with status "${statusOptions.find(o => o.value === statusFilter)?.label}" found.`}
              </p>
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  className="mt-4 text-primary hover:bg-primary/10"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PartnerLayout>
  );
}
export default withAuth(PartnerOrdersPage, 'partner');
