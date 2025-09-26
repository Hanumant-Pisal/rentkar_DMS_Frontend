import { Partner } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Car } from "lucide-react";

interface Props {
  partner: Partner;
  onClick?: () => void;
}

const PartnerCard = ({ partner, onClick }: Props) => {
  return (
    <Card 
      onClick={onClick}
      className="h-full flex flex-col cursor-pointer transition-all hover:shadow-lg hover:border-primary/20"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{partner.name}</CardTitle>
          <Badge 
            variant={partner.isAvailable ? "default" : "destructive"}
            className="text-xs"
          >
            {partner.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{partner.email}</span>
        </div>
        
        {partner.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{partner.phone}</span>
          </div>
        )}
        
        {partner.vehicleNumber && (
          <div className="flex items-center gap-2 text-muted-foreground mt-2 pt-2 border-t">
            <Car className="h-4 w-4" />
            <span className="font-medium">Vehicle:</span>
            <span>{partner.vehicleNumber}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerCard;