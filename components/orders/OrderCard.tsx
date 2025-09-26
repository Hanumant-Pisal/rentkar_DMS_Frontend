import { Order } from "../../types";
interface Props {
  order: Order;
  onStatusUpdate?: (orderId: string, status: string) => void;
  showActions?: boolean;
}
const OrderCard = ({ order, onStatusUpdate, showActions = false }: Props) => {
  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(order._id, newStatus);
    }
  };
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
          order.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
          order.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <p className="text-lg font-medium">{order.customerName}</p>
          {order.customerPhone && (
            <p className="text-gray-600">{order.customerPhone}</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Delivery Address</h3>
          <p className="text-gray-700">{order.deliveryAddress}</p>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Items</h3>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-600">Qty: {item.qty}</span>
            </div>
          ))}
        </div>
      </div>
      {order.assignedTo && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Assigned Partner</h3>
          <p className="text-gray-700">{order.assignedTo.name}</p>
          <p className="text-sm text-gray-500">{order.assignedTo.email}</p>
        </div>
      )}
      {showActions && (
        <div className="flex gap-2 flex-wrap">
          {order.status === 'pending' && (
            <button
              onClick={() => handleStatusChange('assigned')}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Assign
            </button>
          )}
          {order.status === 'assigned' && (
            <button
              onClick={() => handleStatusChange('picked_up')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Mark as Picked Up
            </button>
          )}
          {order.status === 'picked_up' && (
            <button
              onClick={() => handleStatusChange('delivered')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Mark as Delivered
            </button>
          )}
          {!['delivered', 'cancelled'].includes(order.status) && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Cancel Order
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default OrderCard;
