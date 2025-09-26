import AdminLayout from "@/components/layout/AdminLayout";
import { useState, useEffect, useCallback } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/router";
import API from "@/utils/api";
import { Partner } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function PartnersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  interface PartnerResponse {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    isAvailable: boolean;
    location?: {
      type: "Point";
      coordinates: [number, number];
      address?: string;
    };
  }

  const transformPartners = useCallback((data: PartnerResponse[]): Partner[] => {
    return data.map(partner => ({
      _id: partner._id ?? partner.id ?? "", 
      id: partner._id ?? partner.id ?? "",  
      name: partner.name,
      email: partner.email,
      isAvailable: partner.isAvailable,
      location: partner.location
    }));
  }, []);
  
  const handleDeletePartner = useCallback(async (partnerId: string) => {
    if (!window.confirm('Are you sure you want to delete this partner')) {
      return;
    }
    try {
      setDeletingId(partnerId);
      await API.delete(`/admin/partners/${partnerId}`);
      setPartners(prev => prev.filter(p => p.id !== partnerId));
      toast.success('Partner deleted successfully');
    } catch (error) {
      interface AxiosErrorResponse {
        status?: number;
        data?: {
          message?: string;
          [key: string]: unknown;
        };
      }

      interface AxiosError extends Error {
        code?: string;
        response?: AxiosErrorResponse;
        message: string;
      }

      const axiosError = error as AxiosError;
      console.error('Error deleting partner:', error);
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        if (logout) logout();
      } else {
        toast.error(axiosError.response?.data?.message || 'Failed to delete partner');
      }
    } finally {
      setDeletingId(null);
    }
  }, [logout]);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/admin/partners");
      setPartners(transformPartners(res.data.partners || []));
    } catch (error: unknown) {
      interface AxiosErrorResponse {
        status?: number;
        data?: {
          message?: string;
          [key: string]: unknown;
        };
      }

      interface AxiosError extends Error {
        code?: string;
        response?: AxiosErrorResponse;
        message: string;
      }

      const axiosError = error as AxiosError;
      console.error('Error fetching partners:', error);
      if (axiosError.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your internet connection.');
      } else if (!axiosError.response) {
        setError('Unable to connect to the server. Please try again later.');
      } else if (axiosError.response.status === 401 || axiosError.response.status === 403) {
        setError('Your session has expired. Please log in again.');
        if (logout) logout();
      } else {
        setError('Failed to load partners. ' + (axiosError.response.data?.message || 'Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchPartners();
  }, [authLoading, user, router, fetchPartners]);

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Delivery Partners</h1>
            <p className="text-gray-400">Manage your delivery partners and their details</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 rounded-lg bg-gray-800/50">
            <div className="animate-pulse text-gray-400">Loading partners...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                  {partners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {partner.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{partner.name}</div>
                            
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {partner.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          partner.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {partner.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePartner(partner.id);
                          }}
                          disabled={deletingId === partner.id}
                          className={`flex items-center space-x-1 ${
                            deletingId === partner.id ? 'text-gray-500' : 'text-red-400 hover:text-red-300'
                          } transition-colors`}
                        >
                          {deletingId === partner.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {partners.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-400">No partners found. Add your first partner to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
