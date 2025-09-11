import React, { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// If you see a type error for 'leaflet', run: npm install --save-dev @types/leaflet

const DEFAULT_POSITION: [number, number] = [20.5937, 78.9629]; // Center of India, change as needed

const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (coords: [number, number]) => void }) => {
  const [position, setPosition] = useState<[number, number] | undefined>(undefined);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          onLocationSelect(coords);
        },
        (err) => {
          if (err.code === 1) {
            alert("Permission denied. Please allow location access.");
          } else if (err.code === 2) {
            alert("Location information is unavailable. Please enter your address manually.");
          } else if (err.code === 3) {
            alert("Location request timed out. Try again.");
          } else {
            alert("An unknown error occurred.");
          }
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div>
      <button onClick={handleUseCurrentLocation} style={{ marginBottom: 8 }}>
        Use Current Location
      </button>
      <MapContainer
        center={position ?? DEFAULT_POSITION}
        zoom={position ? 16 : 5}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {position && (
          <Marker
            position={position as [number, number]}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker; 