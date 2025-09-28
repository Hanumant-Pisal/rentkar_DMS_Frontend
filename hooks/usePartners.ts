import { useState, useEffect } from 'react';
import { Partner } from '../types';
import API from '../utils/api';
export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      // Update the endpoint to include /api/v1
      const response = await API.get('/admin/partners');
      setPartners(response.data.partners || response.data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch partners:', err);
      // Show error toast
      // if (err.response?.data?.message) {
      //   console.error('Server error:', err.response.data.message);
      // }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchPartners();
  }, []);
  return {
    partners,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchPartners,
    mutate: fetchPartners, // Alias for refetch to match existing code
  };
}
