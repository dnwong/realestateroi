import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

function roiToColor(score) {
  if (score >= 0.05) return '#22c55e'; // green
  if (score >= 0.02) return '#eab308'; // yellow
  return '#ef4444'; // red
}

export default function PropertyMap({ results, onSelect }) {
  // Only show properties with valid coordinates
  const mappable = results.filter((r) => r.property.latitude != null && r.property.longitude != null);

  if (mappable.length === 0) {
    return (
      <div className="map-empty">
        <p>No properties with location data available for map view.</p>
      </div>
    );
  }

  const center = [mappable[0].property.latitude, mappable[0].property.longitude];

  return (
    <MapContainer center={center} zoom={12} className="property-map" aria-label="Property locations map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mappable.map((result) => (
        <CircleMarker
          key={result.property.id}
          center={[result.property.latitude, result.property.longitude]}
          radius={8}
          pathOptions={{ color: roiToColor(result.roiScore), fillColor: roiToColor(result.roiScore), fillOpacity: 0.8 }}
          eventHandlers={{ click: () => onSelect(result) }}
        >
          <Popup>
            <strong>{result.property.address}</strong><br />
            ${result.property.price?.toLocaleString()}<br />
            ROI: {(result.roiScore * 100).toFixed(2)}%
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
