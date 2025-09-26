import { useState } from "react";
import { CreateOrderData } from "../../hooks/useOrders";
interface Item {
  name: string;
  qty: number;
}
interface OrderFormData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Item[];
}
interface Props {
  onSubmit?: (orderData: CreateOrderData) => Promise<void>;
  onSuccess?: () => void;
  isSubmitting?: boolean;
}
const NewOrderForm = ({ onSubmit, onSuccess, isSubmitting = false }: Props) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    items: [{ name: "", qty: 1 }]
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [mapVisible, setMapVisible] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", qty: 1 }]
    }));
  };
  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    if (error) setError("");
  };
  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setMapVisible(false);
  };
  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      setError("Customer name is required");
      return false;
    }
    if (!formData.deliveryAddress.trim()) {
      setError("Delivery address is required");
      return false;
    }
    if (!location) {
      setError("Please select a delivery location on the map");
      return false;
    }
    if (formData.items.length === 0) {
      setError("Please add at least one item");
      return false;
    }
    for (const [index, item] of formData.items.entries()) {
      if (!item.name.trim()) {
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const orderData: CreateOrderData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        deliveryAddress: formData.deliveryAddress.trim(),
        deliveryLocation: {
          type: "Point",
          coordinates: [location!.lng, location!.lat]
        },
        items: formData.items.map(item => ({
          name: item.name.trim(),
          qty: item.qty
        }))
      };
      if (onSubmit) {
        await onSubmit(orderData);
      }
      setFormData({
        customerName: "",
        customerPhone: "",
        deliveryAddress: "",
        items: [{ name: "", qty: 1 }]
      });
      setLocation(null);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create order. Please try again.");
      console.error("Order submission error:", err);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Order</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+91XXXXXXXXXX"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
        <textarea
          name="deliveryAddress"
          value={formData.deliveryAddress}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
          placeholder="Full delivery address with landmark"
          required
        />
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Delivery Location *</label>
          <button 
            type="button" 
            onClick={() => setMapVisible(!mapVisible)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {mapVisible ? 'Hide Map' : 'Select on Map'}
          </button>
        </div>
        {mapVisible && (
          <div className="h-64 bg-gray-100 rounded mb-3 flex items-center justify-center">
            <button 
              type="button"
              onClick={() => handleLocationSelect(18.5204, 73.8567)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Click to Set Location
            </button>
          </div>
        )}
        {location && (
          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
            Selected Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}
        {!location && !mapVisible && (
          <div className="text-sm text-yellow-600 p-2 bg-yellow-50 rounded">
            Please select a delivery location on the map
          </div>
        )}
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Order Items *</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Item
          </button>
        </div>
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-7">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={e => handleItemChange(index, "name", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={item.qty}
                  onChange={e => handleItemChange(index, "qty", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="col-span-2">
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [...formData.items];
                      newItems.splice(index, 1);
                      setFormData(prev => ({ ...prev, items: newItems }));
                    }}
                    className="w-full p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setFormData({
              customerName: "",
              customerPhone: "",
              deliveryAddress: "",
              items: [{ name: "", qty: 1 }]
            });
            setLocation(null);
            setError("");
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !location}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
            isSubmitting || !location
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http:
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : 'Create Order'}
        </button>
      </div>
    </form>
  );
};
export default NewOrderForm;
