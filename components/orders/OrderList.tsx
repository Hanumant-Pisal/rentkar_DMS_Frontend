import { useState } from 'react';
import { Order, Partner, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import dynamic from 'next/dynamic';
const DeliveryMap = dynamic(
  () => import('@/components/map/DeliveryMap'),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, UserPlus, Check, ChevronDown, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useUpdateOrderStatus } from "@/hooks/useUpdateOrderStatus";
interface Props {
  orders: Order[];
  partners?: Partner[];
  isLoading?: boolean;
  isAssigning?: boolean;
  onEdit?: (order: Order) => void;
  onDelete?: (orderId: string) => Promise<void>;
  onAssignOrder?: (orderId: string, partnerId: string) => Promise<void>;
  onOrderAssigned?: () => void;
}
const statusVariantMap = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  assigned: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  picked_up: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  in_transit: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};
const formatStatus = (status: string) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
const OrderList: React.FC<Props> = ({ 
  orders = [],
  partners = [],
  isLoading = false, 
  isAssigning = false,
  onEdit, 
  onDelete, 
  onAssignOrder,
  onOrderAssigned,
}: Props) => {
  const { user } = useAuth();
  const isPartner = user?.role === 'partner';
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const statusOptions = [
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'delivered', label: 'Delivered' },
  ] as const;
  const handleStatusChange = (orderId: string, status: string) => {
    updateStatus({ orderId, status });
  };
  const handleDelete = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    setDeletingId(orderId);
    try {
      await onDelete(orderId);
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setDeletingId(null);
    }
  };
  const handleAssignOrder = async (orderId: string, partnerId: string) => {
    if (!onAssignOrder) return;
    setSelectedOrderId(orderId);
    try {
      await onAssignOrder(orderId, partnerId);
      toast.success('Order assigned successfully');
      onOrderAssigned?.();
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Failed to assign order');
    } finally {
      setSelectedOrderId(null);
    }
  };
  const renderPartnerAssignment = (order: Order) => {
    if (!onAssignOrder || !partners?.length) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-green-400 hover:bg-green-500/10 hover:text-green-300"
            disabled={isAssigning && selectedOrderId === order._id}
          >
            {isAssigning && selectedOrderId === order._id ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-white">
          <div className="px-2 py-1.5 text-sm font-medium text-gray-400">Assign to Partner</div>
          {partners.map((partner) => (
            <DropdownMenuItem 
              key={partner._id} 
              className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
              onSelect={() => handleAssignOrder(order._id, partner._id)}
              disabled={isAssigning && selectedOrderId === order._id}
            >
              {partner.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Package className="h-12 w-12 mb-4" />
        <p>No orders found</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors overflow-hidden">
          <CardHeader className="pb-3 space-y-2 border-b border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-semibold text-white">
                  Order #{order.orderNumber}
                </CardTitle>
                <p className="text-sm text-gray-400">
                  {order.createdAt ? format(
                    typeof order.createdAt === 'string' ? parseISO(order.createdAt) : order.createdAt, 
                    'MMM d, yyyy h:mm a'
                  ) : 'N/A'}
                </p>
              </div>
              {isPartner ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-6 px-2 text-xs font-medium ${statusVariantMap[order.status as keyof typeof statusVariantMap] || statusVariantMap.default} hover:bg-opacity-80`}
                  >
                    {formatStatus(order.status)}
                    <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-blue-800 border border-gray-700 rounded-lg shadow-xl py-1">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700/80 transition-colors ${
                        order.status === option.value ? 'font-medium text-white' : ''
                      }`}
                      onClick={() => handleStatusChange(order._id, option.value)}
                    >
                      <span>{option.label}</span>
                      {order.status === option.value && <Check className="h-4 w-4 text-blue-400" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge 
                variant="outline"
                className={`h-6 px-2 text-xs font-medium ${statusVariantMap[order.status as keyof typeof statusVariantMap] || statusVariantMap.default}`}
              >
                {formatStatus(order.status)}
              </Badge>
            )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Customer Details</h3>
                  <div className="space-y-1">
                    <p className="text-white font-medium">{order.customerName}</p>
                    {order.customerPhone && (
                      <p className="text-sm text-gray-300">{order.customerPhone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {renderPartnerAssignment(order)}
                  {onEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 border-blue-500/30 h-8 px-2.5"
                      onClick={() => onEdit(order)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">Edit</span>
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-300 border-red-500/30 h-8 px-2.5"
                      onClick={(e) => handleDelete(order._id, e)}
                      disabled={deletingId === order._id}
                    >
                      {deletingId === order._id ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      <span className="text-xs">Delete</span>
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg h-full">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Delivery Address</h3>
                  <p className="text-white mb-3">{order.deliveryAddress}</p>
                  <div className="h-40 rounded-md overflow-hidden border border-white/10 bg-black/20">
                    <DeliveryMap 
                      orders={[{
                        ...order,
                        pickupLocation: order.pickupLocation,
                        deliveryLocation: order.deliveryLocation,
                        deliveryAddress: order.deliveryAddress
                      }]} 
                      initialLocation={{
                        lat: order.deliveryLocation.coordinates[1],
                        lng: order.deliveryLocation.coordinates[0],
                        address: order.deliveryAddress
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Order Items</h3>
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item: { name: string; qty: number }, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 px-2.5 py-1 text-xs"
                    >
                      {item.name} × {item.qty}
                    </Badge>
                  ))}
                </div>
              </div>
              {order.assignedTo && (
                <div className="p-3 bg-white/5 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Assigned Partner</h3>
                  <p className="text-white font-medium">{order.assignedTo.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    );
  };
  export default OrderList;
