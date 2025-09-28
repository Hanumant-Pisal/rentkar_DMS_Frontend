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
      const response = await API.get('/admin/partners');
      setPartners(response.data.partners || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch partners:', err);
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
