import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import PartnerLayout from "../../components/layout/PartnerLayout";
import { useOrders } from "../../hooks/useOrders";

// Dynamically import the DeliveryMap component with SSR disabled
const DeliveryMap = dynamic(
  () => import('../../components/map/DeliveryMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function PartnerMap() {
  const { orders } = useOrders();
  const assignedOrders = orders.filter(o => o.assignedTo?.id === "partner-id");
  
  return (
    <PartnerLayout>
      <h1 className="text-2xl font-bold mb-4">Delivery Map</h1>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <DeliveryMap orders={assignedOrders} />
      </Suspense>
    </PartnerLayout>
  );
}