"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Order } from "../../types";
// Fix for leaflet marker icons in Next.js
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore - _getIconUrl is a known property but not in the type definitions
delete L.Icon.Default.prototype._getIconUrl;

// Configure default icon
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icons
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    html: `
      <div style="position: relative; width: 30px; height: 30px;">
        <svg viewBox="0 0 24 24" style="width: 100%; height: 100%;">
          <path 
            fill="${color}" 
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          />
          <circle cx="12" cy="9" r="3" fill="white" />
        </svg>
      </div>
    `,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const pickupIcon = createCustomIcon('#EF4444'); // Red
const deliveryIcon = createCustomIcon('#10B981'); // Green
const currentLocationIcon = createCustomIcon('#3B82F6'); // Blue
interface Location {
  lat: number;
  lng: number;
  address?: string;
}
export interface Props {
  orders?: Order[];
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  initialLocation?: Location | null;
  showRoute?: boolean;
  fromLocation?: Location | null;
  toLocation?: Location | null;
}
const LocationMarker = ({ 
  onLocationSelect, 
  initialLocation 
}: { 
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  initialLocation?: Location | null;
}) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  );
  const map = useMap();
  useEffect(() => {
    if (initialLocation) {
      const newPos: [number, number] = [initialLocation.lat, initialLocation.lng];
      setPosition(newPos);
      map.setView(newPos, 15);
    }
  }, [initialLocation, map]);
  const mapEvents = useMemo(() => ({
    click(e: L.LeafletMouseEvent) {
      if (!onLocationSelect) return;
      const { lat, lng } = e.latlng;
      const newPos: [number, number] = [lat, lng];
      setPosition(newPos);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
        .then((response: Response) => response.json())
        .then((data: { display_name?: string }) => {
          const address = data.display_name || '';
          onLocationSelect(lat, lng, address);
        })
        .catch(() => {
          onLocationSelect(lat, lng, '');
        });
    },
  }), [onLocationSelect]);
  useMapEvents(mapEvents);
  if (!position) return null;
  return (
    <Marker position={position} icon={currentLocationIcon}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
};
const OrderMarkers = ({ orders = [] }: { orders: Order[] }) => {
  return (
    <>
      {orders.map((order) => {
        if (!order.deliveryLocation?.coordinates) return null;
        const position: [number, number] = [
          order.deliveryLocation.coordinates[1],
          order.deliveryLocation.coordinates[0]
        ];
        return (
          <Marker 
            key={order._id} 
            position={position}
            icon={deliveryIcon}
          >
            <Popup>
              <div>
                <p className="font-semibold">Order #{order.orderNumber}</p>
                <p>{order.customerName}</p>
                <p className="text-sm text-gray-600">{order.status}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
const Route = ({ from, to }: { from: Location | null; to: Location | null }) => {
  const map = useMap();
  useEffect(() => {
    if (from && to) {
      const bounds = L.latLngBounds(
        [from.lat, from.lng],
        [to.lat, to.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [from, to, map]);
  if (!from || !to) return null;
  const positions: [number, number][] = [
    [from.lat, from.lng],
    [to.lat, to.lng]
  ];
  return (
    <Polyline 
      positions={positions} 
      color="#3b82f6" 
      weight={4} 
      opacity={0.7}
      dashArray="10, 10"
    />
  );
};
const DeliveryMap = ({ 
  orders = [], 
  onLocationSelect, 
  initialLocation, 
  showRoute = false,
  fromLocation = null,
  toLocation = null
}: Props) => {
  const mapRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);
  const defaultCenter: [number, number] = [12.9716, 77.5946];
  const center = useMemo(() => {
    if (initialLocation) return [initialLocation.lat, initialLocation.lng];
    if (fromLocation) return [fromLocation.lat, fromLocation.lng];
    if (toLocation) return [toLocation.lat, toLocation.lng];
    return defaultCenter;
  }, [initialLocation, fromLocation, toLocation]);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-800 rounded-md flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading map...</div>
      </div>
    );
  }
  return (
    <div className="h-full w-full rounded-md overflow-hidden">
      <MapContainer
        center={center as [number, number]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {}
        {showRoute && fromLocation && toLocation && (
          <Route from={fromLocation} to={toLocation} />
        )}
        {}
        {fromLocation && (
          <Marker 
            position={[fromLocation.lat, fromLocation.lng]} 
            icon={pickupIcon}
          >
            <Popup>Pickup Location</Popup>
          </Marker>
        )}
        {}
        {toLocation && (
          <Marker 
            position={[toLocation.lat, toLocation.lng]} 
            icon={deliveryIcon}
          >
            <Popup>Delivery Location</Popup>
          </Marker>
        )}
        {}
        {onLocationSelect && (
          <LocationMarker 
            onLocationSelect={onLocationSelect} 
            initialLocation={initialLocation || undefined}
          />
        )}
        {}
        <OrderMarkers orders={orders} />
      </MapContainer>
    </div>
  );
};
export default DeliveryMap;
