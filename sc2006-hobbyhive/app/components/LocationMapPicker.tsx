"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getLocationConfigForCategory } from "@/app/config/categoryLocationMapping";

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

interface Location {
  name: string;
  address?: string;
  coordinates: [number, number];
}

interface LocationMapPickerProps {
  onLocationSelect: (locationName: string) => void;
  selectedLocation: string;
  eventCategory: string; // NEW: Category passed from parent
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
  eventCategory,
}: LocationMapPickerProps) {
  const [parks, setParks] = useState<Location[]>([]);
  const [clubs, setClubs] = useState<Location[]>([]);
  const [libraries, setLibraries] = useState<Location[]>([]);
  
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [parkIcon, setParkIcon] = useState<any>(null);
  const [clubIcon, setClubIcon] = useState<any>(null);
  const [libraryIcon, setLibraryIcon] = useState<any>(null);

  const defaultCenter: LatLngExpression = [1.3521, 103.8198];
  const locationConfig = getLocationConfigForCategory(eventCategory);

  useEffect(() => {
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

    fetchLocationsData();

    if (typeof window !== "undefined") {
      const L = require("leaflet");
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const greenIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const orangeIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const violetIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setParkIcon(greenIcon);
      setClubIcon(orangeIcon);
      setLibraryIcon(violetIcon);
    }
  }, []);

  const fetchLocationsData = async () => {
    try {
      setLoading(true);
      setError("");

      const fetchPromises = [];
      
      // Only fetch APIs needed for this category
      if (locationConfig.allowedLocationTypes.includes('parks')) {
        fetchPromises.push(
          fetch('/api/parks').then(res => res.json()).then(data => ({ type: 'parks', data }))
        );
      }
      if (locationConfig.allowedLocationTypes.includes('clubs')) {
        fetchPromises.push(
          fetch('/api/community-clubs').then(res => res.json()).then(data => ({ type: 'clubs', data }))
        );
      }
      if (locationConfig.allowedLocationTypes.includes('libraries')) {
        fetchPromises.push(
          fetch('/api/libraries').then(res => res.json()).then(data => ({ type: 'libraries', data }))
        );
      }

      const results = await Promise.all(fetchPromises);
      
      results.forEach(result => {
        if (!result.data.success) return;
        
        const locations = result.type === 'parks' ? result.data.parks :
                         result.type === 'clubs' ? result.data.clubs :
                         result.data.libraries;
        
        const transformed = locations.map((loc: any) => ({
          name: loc.name,
          address: loc.address,
          coordinates: [loc.latitude, loc.longitude] as [number, number],
        }));

        if (result.type === 'parks') setParks(transformed);
        else if (result.type === 'clubs') setClubs(transformed);
        else if (result.type === 'libraries') setLibraries(transformed);
      });

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching locations:", err);
      setError(err.message || "Failed to load location data.");
      setLoading(false);
    }
  };

  const handleLocationSelect = (locationName: string) => {
    onLocationSelect(locationName);
  };

  const totalCount = parks.length + clubs.length + libraries.length;

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {locationConfig.description}...</p>
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
          <button onClick={fetchLocationsData} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border-2 border-gray-300">
      <div className="bg-teal-50 px-4 py-3 border-b border-teal-200">
        <p className="text-sm text-teal-800">
          <strong>📍 {eventCategory}:</strong> {locationConfig.description}
        </p>
      </div>

      <div className="h-96">
        <MapContainer center={userLocation || defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
          <TileLayer
            attribution='<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/> <a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> © contributors | <a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
            url="https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={11}
          />
          {userLocation && <MapController userLocation={userLocation} />}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup><div className="text-center"><p className="font-semibold">Your Location</p></div></Popup>
            </Marker>
          )}

          {parks.map((park, idx) => (
            <Marker key={`park-${idx}`} position={park.coordinates} icon={parkIcon}>
              <Popup>
                <div className="text-center p-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold mb-2 inline-block">🌳 PARK</span>
                  <p className="font-semibold mb-2">{park.name}</p>
                  <button onClick={() => handleLocationSelect(park.name)} className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-sm w-full">
                    Use This Location
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {clubs.map((club, idx) => (
            <Marker key={`club-${idx}`} position={club.coordinates} icon={clubIcon}>
              <Popup>
                <div className="text-center p-2">
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-semibold mb-2 inline-block">🏢 CLUB</span>
                  <p className="font-semibold mb-1">{club.name}</p>
                  {club.address && <p className="text-xs text-gray-600 mb-2">{club.address}</p>}
                  <button onClick={() => handleLocationSelect(club.name)} className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-sm w-full">
                    Use This Location
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {libraries.map((lib, idx) => (
            <Marker key={`lib-${idx}`} position={lib.coordinates} icon={libraryIcon}>
              <Popup>
                <div className="text-center p-2">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-semibold mb-2 inline-block">📚 LIBRARY</span>
                  <p className="font-semibold mb-1">{lib.name}</p>
                  {lib.address && <p className="text-xs text-gray-600 mb-2">{lib.address}</p>}
                  <button onClick={() => handleLocationSelect(lib.name)} className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-sm w-full">
                    Use This Location
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t border-gray-300">
        <p>💡 <strong>Tip:</strong> Green = Parks (outdoor), Orange = Community Clubs (indoor), Purple = Libraries (study/learning). {totalCount > 0 && `(${totalCount} locations available)`}</p>
      </div>
    </div>
  );
}
