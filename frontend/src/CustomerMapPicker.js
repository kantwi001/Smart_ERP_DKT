import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createCustomerIcon } from './components/LeafletIconFix';

// Fix default marker icon for leaflet in React
// const DefaultIcon = L.icon({
//   iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
//   iconAnchor: [12, 41],
// });
// L.Marker.prototype.options.icon = DefaultIcon;

const MapClickMarker = ({ value, onChange }) => {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    const customerIcon = createCustomerIcon();
    setIcon(customerIcon);
  }, []);

  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  
  return value && icon ? <Marker position={value} icon={icon} /> : null;
};

const CustomerMapPicker = ({ value, onChange, height = 250 }) => {
  const center = value && value[0] && value[1] ? value : [0, 0];
  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer center={center} zoom={value[0] && value[1] ? 10 : 2} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickMarker value={value} onChange={onChange} />
      </MapContainer>
    </div>
  );
};

export default CustomerMapPicker;
