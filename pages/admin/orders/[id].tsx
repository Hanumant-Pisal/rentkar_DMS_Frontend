import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/layout/AdminLayout";
import OrderCard from "@/components/orders/OrderCard";
import API from "@/utils/api";
import { Order } from "@/types";

interface OrderDetailsProps {
  order: Order | null;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const router = useRouter();
  
  if (router.isFallback) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p>The requested order could not be found.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Order Details</h1>
        <OrderCard order={order} />
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { id } = context.params as { id: string };
    const response = await API.get(`/orders/${id}`);
    
    if (!response.data) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        order: response.data,
      },
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return {
      notFound: true,
    };
  }
};