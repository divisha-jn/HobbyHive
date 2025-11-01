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
  onLocationSelect: (locationName: string, lat?: number, lng?: number) => void;
  selectedLocation: string;
  eventCategory: string;
}

function MapController({
  userLocation,
  targetLocation,
}: {
  userLocation: LatLngExpression | null;
  targetLocation: LatLngExpression | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (targetLocation) {
      map.setView(targetLocation, 16);
    } else if (userLocation) {
      map.setView(userLocation, 13);
    }
  }, [userLocation, targetLocation, map]);

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
  const [targetLocation, setTargetLocation] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [parkIcon, setParkIcon] = useState<any>(null);
  const [clubIcon, setClubIcon] = useState<any>(null);
  const [libraryIcon, setLibraryIcon] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
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
      });
    }
  }, []);

  const fetchLocationsData = async () => {
    try {
      setLoading(true);
      setError("");

      const fetchPromises = [];

      if (locationConfig.allowedLocationTypes.includes("parks")) {
        fetchPromises.push(
          fetch("/api/parks")
            .then((res) => res.json())
            .then((data) => ({ type: "parks", data }))
        );
      }
      if (locationConfig.allowedLocationTypes.includes("clubs")) {
        fetchPromises.push(
          fetch("/api/community-clubs")
            .then((res) => res.json())
            .then((data) => ({ type: "clubs", data }))
        );
      }
      if (locationConfig.allowedLocationTypes.includes("libraries")) {
        fetchPromises.push(
          fetch("/api/libraries")
            .then((res) => res.json())
            .then((data) => ({ type: "libraries", data }))
        );
      }

      const results = await Promise.all(fetchPromises);

      results.forEach((result) => {
        if (!result.data.success) return;

        const locations =
          result.type === "parks"
            ? result.data.parks
            : result.type === "clubs"
              ? result.data.clubs
              : result.data.libraries;

        const transformed = locations.map((loc: any) => ({
          name: loc.name,
          address: loc.address,
          coordinates: [loc.latitude, loc.longitude] as [number, number],
        }));

        if (result.type === "parks") setParks(transformed);
        else if (result.type === "clubs") setClubs(transformed);
        else if (result.type === "libraries") setLibraries(transformed);
      });

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching locations:", err);
      setError(err.message || "Failed to load location data.");
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.results) {
        setSearchResults(data.results);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (result: any) => {
    setTargetLocation([result.latitude, result.longitude]);
    onLocationSelect(result.name, result.latitude, result.longitude);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
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

      {/* SEARCH BOX - FIXED Z-INDEX */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 relative z-[1000]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="🔍 Search for any address, building, or postal code..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
          {isSearching && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* DROPDOWN - FIXED POSITIONING AND Z-INDEX */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-[1001] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full text-left px-4 py-3 hover:bg-teal-50 border-b border-gray-100 last:border-b-0 transition"
                >
                  <p className="font-semibold text-gray-800">{result.name}</p>
                  <p className="text-xs text-gray-600">{result.address}</p>
                  {result.postalCode && <p className="text-xs text-teal-600">📮 {result.postalCode}</p>}
                </button>
              ))}
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 3 && (
            <div className="absolute z-[1001] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="h-96 relative z-0">
        <MapContainer center={userLocation || defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
          <TileLayer
            attribution='<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/> <a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> © contributors | <a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
            url="https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={11}
          />
          <MapController userLocation={userLocation} targetLocation={targetLocation} />
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
                  <button 
                    onClick={() => onLocationSelect(park.name, park.coordinates[0], park.coordinates[1])} 
                    className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-sm w-full"
                  >
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
                  <button 
                    onClick={() => onLocationSelect(club.name, club.coordinates[0], club.coordinates[1])}
                    className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-sm w-full"
                  >
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
                  <button 
                    onClick={() => onLocationSelect(lib.name, lib.coordinates[0], lib.coordinates[1])}
                    className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-sm w-full"
                  >
                    Use This Location
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t border-gray-300">
        <p>💡 <strong>Tip:</strong> Search for any Singapore address above, or click markers. Green = Parks, Orange = Community Clubs, Purple = Libraries. {totalCount > 0 && `(${totalCount} locations available)`}</p>
      </div>
    </div>
  );
}
