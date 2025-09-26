import useSWR from "swr";
import API from "../utils/api";
import { Order } from "../types";
export const usePartnerOrders = () => {
  const fetcher = (url: string) => API.get(url).then(res => res.data.orders as Order[]);
  const { data, error, isLoading, mutate } = useSWR("/partners/orders", fetcher);
  return {
    orders: data || [],
    isLoading,
    error,
    mutate
  };
};
