import { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { useOrders, CreateOrderData, UpdateOrderData } from "../../hooks/useOrders";
import { usePartners } from "../../hooks/usePartners";
import OrderForm from "../../components/orders/OrderForm";
import OrderList from "../../components/orders/OrderList";
import { withAuth } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import { Plus, Package, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types";
import API from "@/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];
function OrdersPage() {
  const { orders, createOrder, updateOrder, deleteOrder, isLoading, mutate } = useOrders();
  const { partners, isLoading: isLoadingPartners } = usePartners();
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const handleCreateOrder = async (orderData: CreateOrderData) => {
    try {
      setIsSubmitting(true);
      await createOrder(orderData);
      toast.success("Order created successfully");
      await mutate("/orders");
      setShowForm(false);
    } catch (error: unknown) {
      console.error("Failed to create order:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateOrder = async (orderId: string, updateData: UpdateOrderData) => {
    try {
      setIsSubmitting(true);
      await updateOrder(orderId, updateData);
      toast.success("Order updated successfully");
      await mutate("/orders");
      setEditingOrder(null);
    } catch (error: unknown) {
      console.error(`Failed to update order ${orderId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowForm(true);
  };
  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingOrder(null);
  };
  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        toast.success('Order deleted successfully');
        await mutate('/api/orders');
      } catch (error: unknown) {
        console.error('Failed to delete order:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete order';
        toast.error(errorMessage);
      }
    }
  };
  const handleAssignOrder = async (orderId: string, partnerId: string): Promise<void> => {
    try {
      setIsAssigning(true);
      await API.post(`/orders/${orderId}/assign`, { partnerId });
      await Promise.all([
        mutate('/api/orders'),
        mutate('/admin/partners')
      ]);
      toast.success('Order assigned successfully');
    } catch (error: unknown) {
      console.error(`Failed to assign order ${orderId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign order';
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: unknown } };
        console.error('Error details:', apiError.response?.data);
      }
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsAssigning(false);
    }
  };
  const handleOrderAssigned = () => {
    mutate('/api/orders');
    mutate('/admin/partners');
  };
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Orders</h1>
            <p className="text-gray-300">Manage and track all customer orders</p>
          </div>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          )}
        </div>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-8"
          >
            <OrderForm 
              onSubmit={async (orderData) => {
                if (editingOrder) {
                  await handleUpdateOrder(editingOrder._id, orderData);
                } else {
                  await handleCreateOrder(orderData as CreateOrderData);
                }
              }}
              onSuccess={() => {
                setShowForm(false);
                setEditingOrder(null);
              }}
              onCancel={handleCancelEdit}
              initialData={editingOrder || undefined}
              isSubmitting={isSubmitting}
              isUpdate={!!editingOrder}
            />
          </motion.div>
        )}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">
                  All Orders
                </CardTitle>
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
            </div>
          </CardHeader>
          <CardContent>
            <OrderList 
              orders={orders.filter((order: Order) => {
                const matchesSearch = 
                  order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
                return matchesSearch && matchesStatus;
              })} 
              partners={partners}
              isLoading={isLoading || isLoadingPartners}
              isAssigning={isAssigning}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
              onAssignOrder={handleAssignOrder}
              onOrderAssigned={handleOrderAssigned}
            />
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
export default withAuth(OrdersPage, 'admin');
