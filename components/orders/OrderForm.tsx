import { useState, useEffect } from "react";
import { Order } from "../../types";
import { CreateOrderData, UpdateOrderData } from "../../hooks/useOrders";
import dynamic from "next/dynamic";
import type { Location } from "../../types/map";
const DeliveryMap = dynamic(
  () => import("../map/DeliveryMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-800 rounded-md flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading map...</div>
      </div>
    )
  }
);
type OrderFormData = {
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  items: Array<{ name: string; qty: number }>;
  pickupLocation: { type: 'Point'; coordinates: [number, number] };
  deliveryLocation: { type: 'Point'; coordinates: [number, number] };
};
interface Props {
  onSubmit: (orderData: CreateOrderData | UpdateOrderData) => Promise<void>;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<Order>;
  isSubmitting?: boolean;
  isUpdate?: boolean;
}
const OrderForm = ({
  onSubmit,
  onSuccess,
  onCancel,
  initialData,
  isSubmitting = false,
  isUpdate = false,
}: Props) => {
  const defaultFormData: OrderFormData = {
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    pickupAddress: "",
    items: [{ name: "", qty: 1 }],
    deliveryLocation: {
      type: "Point",
      coordinates: [0, 0]
    },
    pickupLocation: {
      type: "Point",
      coordinates: [0, 0]
    }
  };
  const [formData, setFormData] = useState<OrderFormData>(() => {
    if (initialData) {
      return {
        customerName: initialData.customerName || '',
        customerPhone: initialData.customerPhone || '',
        pickupAddress: initialData.pickupAddress || '',
        deliveryAddress: initialData.deliveryAddress || '',
        items: initialData.items?.length ? [...initialData.items] : [{ name: "", qty: 1 }],
        pickupLocation: initialData.pickupLocation || {
          type: "Point" as const,
          coordinates: [0, 0] as [number, number]
        },
        deliveryLocation: initialData.deliveryLocation || {
          type: "Point" as const,
          coordinates: [0, 0] as [number, number]
        }
      };
    }
    return { ...defaultFormData };
  });
  const [error, setError] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState<boolean>(false);
  const [activeLocationType, setActiveLocationType] = useState<'from' | 'to'>('from');
  const [fromLocation, setFromLocation] = useState<Location | null>(() => {
    if (initialData?.pickupLocation) {
      return {
        lat: initialData.pickupLocation.coordinates[1],
        lng: initialData.pickupLocation.coordinates[0],
        address: initialData.pickupAddress
      };
    }
    return null;
  });
  const [toLocation, setToLocation] = useState<Location | null>(() => {
    if (initialData?.deliveryLocation) {
      return {
        lat: initialData.deliveryLocation.coordinates[1],
        lng: initialData.deliveryLocation.coordinates[0],
        address: initialData.deliveryAddress
      };
    }
    return null;
  });
  const validateForm = (): boolean => {
    const { customerName, pickupAddress, deliveryAddress, items } = formData;
    if (!customerName?.trim()) {
      setError("Customer name is required");
      return false;
    }
    if (!pickupAddress?.trim()) {
      setError("Pickup address is required");
      return false;
    }
    if (!deliveryAddress?.trim()) {
      setError("Delivery address is required");
      return false;
    }
    if (!fromLocation) {
      setError("Please select a pickup location on the map");
      return false;
    }
    if (!toLocation) {
      setError("Please select a delivery location on the map");
      return false;
    }
    if (items.length === 0) {
      setError("Please add at least one item");
      return false;
    }
    for (const [index, item] of items.entries()) {
      if (!item.name?.trim()) {
        setError(`Item #${index + 1} name is required`);
        return false;
      }
      if (item.qty <= 0) {
        setError(`Item #${index + 1} quantity must be greater than 0`);
        return false;
      }
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    if (!validateForm() || !fromLocation || !toLocation) {
      return;
    }
    try {
      const { customerName, customerPhone = '', deliveryAddress, pickupAddress, items } = formData;
      const orderData: CreateOrderData | UpdateOrderData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone?.trim() || '',
        deliveryAddress: deliveryAddress.trim(),
        pickupAddress: pickupAddress.trim(),
        items: items.map(item => ({
          name: item.name.trim(),
          qty: item.qty,
        })),
        pickupLocation: {
          type: "Point" as const,
          coordinates: [fromLocation.lng, fromLocation.lat],
        },
        deliveryLocation: {
          type: "Point" as const,
          coordinates: [toLocation.lng, toLocation.lat],
        },
        ...(isUpdate && initialData ? {
          status: initialData.status,
          assignedTo: initialData.assignedTo
        } : {})
      };
      await onSubmit(orderData);
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error?.response?.data?.error || "An error occurred. Please try again.");
      console.error("Form submission error:", error);
    }
  };
  const addItem = (): void => {
    setFormData((prev: OrderFormData) => ({
      ...prev,
      items: [...prev.items, { name: "", qty: 1 }],
    }));
  };
  const removeItem = (index: number): void => {
    setFormData((prev: OrderFormData) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== index),
    }));
  };
  const updateItem = (
    index: number, 
    field: keyof { name: string; qty: number }, 
    value: string | number
  ): void => {
    setFormData((prev: OrderFormData) => {
      const updatedItems = prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, items: updatedItems };
    });
  };
  const handleLocationSelect = (lat: number, lng: number, address?: string): void => {
    const newLocation: Location = { lat, lng, address };
    if (activeLocationType === 'from') {
      setFromLocation(newLocation);
      setFormData((prev: OrderFormData) => ({
        ...prev,
        pickupLocation: {
          type: 'Point' as const,
          coordinates: [lng, lat]
        },
        pickupAddress: address || prev.pickupAddress || ''
      }));
    } else {
      setToLocation(newLocation);
      setFormData((prev: OrderFormData) => ({
        ...prev,
        deliveryLocation: {
          type: 'Point' as const,
          coordinates: [lng, lat]
        },
        deliveryAddress: address || prev.deliveryAddress || ''
      }));
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
      <h2 className="text-2xl font-bold text-white">
        {isUpdate ? 'Update Order' : 'Create New Order'}
      </h2>
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-100 rounded text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Customer Name</label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="w-full p-2 bg-white/5 border border-white/10 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Customer Phone</label>
          <input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            className="w-full p-2 bg-white/5 border border-white/10 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Address</label>
        <textarea
          value={formData.deliveryAddress}
          onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
          className="w-full p-2 bg-white/5 border border-white/10 text-white rounded h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-4">
        {}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Pickup Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.pickupAddress || ''}
              onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
              placeholder="Enter pickup address"
              className="flex-1 p-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => {
                setActiveLocationType('from');
                setMapVisible(true);
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Map
            </button>
          </div>
          {fromLocation && (
            <div className="text-xs text-gray-400">
              Lat: {fromLocation.lat.toFixed(6)}, Lng: {fromLocation.lng.toFixed(6)}
            </div>
          )}
        </div>
        {}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Delivery Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.deliveryAddress || ''}
              onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
              placeholder="Enter delivery address"
              className="flex-1 p-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => {
                setActiveLocationType('to');
                setMapVisible(true);
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Map
            </button>
          </div>
          {toLocation && (
            <div className="text-xs text-gray-400">
              Lat: {toLocation.lat.toFixed(6)}, Lng: {toLocation.lng.toFixed(6)}
            </div>
          )}
        </div>
        {}
        {mapVisible && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  Select {activeLocationType === 'from' ? 'Pickup' : 'Delivery'} Location
                </h3>
                <button
                  onClick={() => setMapVisible(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 relative">
                <div className="h-full w-full">
                <DeliveryMap
                  key={`${activeLocationType}-${mapVisible}`}
                  onLocationSelect={handleLocationSelect}
                  initialLocation={activeLocationType === 'from' ? fromLocation : toLocation}
                  showRoute={fromLocation && toLocation}
                  fromLocation={fromLocation}
                  toLocation={toLocation}
                />
              </div>
              </div>
              <div className="p-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMapVisible(false)}
                  className="px-4 py-2 text-sm text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setMapVisible(false)}
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-300">Items</label>
          <button
            type="button"
            onClick={addItem}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Add Item
          </button>
        </div>
        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                className="flex-1 p-2 bg-white/5 border border-white/10 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                className="w-20 p-2 bg-white/5 border border-white/10 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                required
                disabled={isSubmitting}
              />
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-md hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Saving...'
          ) : isUpdate ? (
            'Update Order'
          ) : (
            'Create Order'
          )}
        </button>
      </div>
    </form>
  );
};
export default OrderForm;
