import { Partner } from "../../types";
interface Props {
  partners: Partner[];
}
const PartnerList = ({ partners }: Props) => {
  if (!partners || partners.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No partners found</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {partners.map((partner) => (
        <div key={partner.id} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg">{partner.name}</h3>
            <span className={`px-2 py-1 rounded text-sm ${
              partner.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {partner.isAvailable ? 'Available' : 'Busy'}
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-sm">{partner.email}</p>
            </div>
            {partner.vehicleNumber && (
              <div>
                <p className="text-sm text-gray-600">Vehicle Number</p>
                <p className="text-sm font-mono">{partner.vehicleNumber}</p>
              </div>
            )}
            {partner.location && (
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-sm">
                  {partner.location.coordinates[1].toFixed(4)}, {partner.location.coordinates[0].toFixed(4)}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700">
              View Details
            </button>
            <button className={`flex-1 py-1 px-3 rounded text-sm ${
              partner.isAvailable 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}>
              {partner.isAvailable ? 'Set Busy' : 'Set Available'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
export default PartnerList;
