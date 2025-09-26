import PartnerCard from "./PartnerCard";
import { Partner } from "@/types";
import { Button } from "@/components/ui/button";

interface Props {
  partners: Partner[];
  onSelect?: (partner: Partner) => void;
  onAddNew?: () => void;
  loading?: boolean;
}

const PartnerList = ({ partners, onSelect, onAddNew, loading = false }: Props) => {
  if (loading) {
    return <p>Loading partners...</p>;
  }

  if (partners.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No partners found.</p>
        {onAddNew && (
          <Button onClick={onAddNew} variant="outline">
            Add New Partner
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onAddNew && (
        <div className="flex justify-end mb-4">
          <Button onClick={onAddNew}>
            Add New Partner
          </Button>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {partners.map(partner => (
          <PartnerCard 
            key={partner.id} 
            partner={partner} 
            onClick={() => onSelect?.(partner)} 
          />
        ))}
      </div>
    </div>
  );
};

export default PartnerList;