import AdminLayout from "@/components/layout/AdminLayout";
import PartnerList from "@/components/layout/partners/PartnerList";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import API from "@/utils/api";
import { Partner } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export default function PartnersPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const res = await API.get("/partners");
        setPartners(res.data.partners || []);
      } catch (error: any) {
        console.error('Error fetching partners:', error);
        setError('Failed to load partners. Please try again.');
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        } else {
          toast.error(error.response?.data?.message || 'Failed to load partners');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, [user, router, logout]);
  useEffect(() => {
    let result = [...partners];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(partner => 
        partner.name.toLowerCase().includes(term) ||
        partner.email.toLowerCase().includes(term) ||
        (partner.phone && partner.phone.includes(term)) ||
        (partner.vehicleNumber && partner.vehicleNumber.toLowerCase().includes(term))
      );
    }
    if (statusFilter !== 'all') {
      const isAvailable = statusFilter === 'available';
      result = result.filter(partner => partner.isAvailable === isAvailable);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
    setFilteredPartners(result);
  }, [partners, searchTerm, statusFilter, sortBy]);
  const handleAddNewPartner = useCallback(() => {
    toast.info('Add new partner functionality coming soon');
  }, []);
  const handlePartnerSelect = useCallback(async (partner: Partner) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Your session has expired. Please log in again.');
        router.push('/auth/login');
        return;
      }
      router.push(`/admin/partners/${partner.id}`);
    } catch (error: any) {
      console.error('Error selecting partner:', error);
      toast.error('Failed to load partner details. Please try again.');
      if (error?.response?.status === 401) {
        logout();
      }
    }
  }, [router, logout]);
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http:
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your delivery partners and their information</p>
          </div>
          <Button 
            onClick={handleAddNewPartner} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add New Partner
          </Button>
        </div>
        <Card className="p-6 mb-6">
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                type="text"
                className="pl-10"
                placeholder="Search partners by name, email, or vehicle..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading partners...</p>
            </div>
          ) : (
            <PartnerList 
              partners={filteredPartners} 
              onSelect={handlePartnerSelect}
              onAddNew={handleAddNewPartner}
              loading={loading}
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
