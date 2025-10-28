"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import { useMap } from "react-leaflet";

interface Park {
  name: string;
  coordinates: [number, number]; // [lat, lng]
}

interface LocationMapPickerProps {
  onLocationSelect: (locationName: string) => void;
  selectedLocation: string;
}

function MapController({ userLocation }: { userLocation: LatLngExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 13);
    }
  }, [userLocation, map]);

  return null;
}

export default function LocationMapPicker({
  onLocationSelect,
  selectedLocation,
}: LocationMapPickerProps) {
  const [parks, setParks] = useState<Park[]>([]);
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customIcon, setCustomIcon] = useState<any>(null);

  // Default center: Singapore
  const defaultCenter: LatLngExpression = [1.3521, 103.8198];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }

    fetchParksData();

    if (typeof window !== "undefined") {
      const L = require("leaflet");
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const parkIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setCustomIcon(parkIcon);
    }
  }, []);

  const fetchParksData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch from our API route
      const response = await fetch('/api/parks');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch parks data');
      }

      console.log(`Successfully loaded ${data.count} parks`); // Debug log

      const parksData: Park[] = data.parks.map((park: any) => ({
        name: park.name,
        coordinates: [park.latitude, park.longitude], // [lat, lng] for Leaflet
      }));

      setParks(parksData);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching parks:", err);
      setError(err.message || "Failed to load parks data. Please try again.");
      setLoading(false);
    }
  };

  const handleLocationSelect = (parkName: string) => {
    onLocationSelect(parkName);
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map and parks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="font-semibold mb-2">Error loading map</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchParksData}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border-2 border-gray-300">
      <div className="h-96">
        <MapContainer
          center={userLocation || defaultCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='© <a href="https://www.onemap.gov.sg/" target="_blank">OneMap</a> | Map data © contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
            url="https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={11}
          />

          {userLocation && <MapController userLocation={userLocation} />}

          {/* User location marker (blue) */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Park markers (green) */}
          {parks.map((park, index) => (
            <Marker
              key={index}
              position={park.coordinates}
              icon={customIcon}
            >
              <Popup>
                <div className="text-center p-2">
                  <p className="font-semibold mb-2">{park.name}</p>
                  <button
                    onClick={() => handleLocationSelect(park.name)}
                    className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-sm"
                  >
                    Use This Location
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600">
        <p>
          💡 <strong>Tip:</strong> Click on green markers to select a park location, or toggle
          to manual entry to type your own address. {parks.length > 0 && `(${parks.length} parks loaded)`}
        </p>
      </div>
    </div>
  );
}
