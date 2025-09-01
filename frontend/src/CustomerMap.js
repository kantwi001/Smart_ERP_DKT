import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createCustomerIcon } from './components/LeafletIconFix';

const CustomerMap = ({ customers, height = 400 }) => {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    const customerIcon = createCustomerIcon();
    setIcon(customerIcon);
  }, []);

  // Defensive: always use array
  const safeCustomers = Array.isArray(customers) ? customers : [];
  // Default to a center if no customers
  const defaultCenter = safeCustomers.length
    ? [safeCustomers[0].gps_lat || 0, safeCustomers[0].gps_lng || 0]
    : [0, 0];

  if (safeCustomers.length === 0) {
    return <div style={{ height: height, width: '100%' }}><b>No customer locations to display.</b></div>;
  }

  return (
    <div style={{ height: height, width: '100%' }}>
      <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {icon && safeCustomers.map(cust =>
          cust.gps_lat && cust.gps_lng ? (
            <Marker key={cust.id} position={[cust.gps_lat, cust.gps_lng]} icon={icon}>
              <Popup>
                <b>{cust.name}</b><br />
                {cust.email}<br />
                {cust.phone}<br />
                GPS: {cust.gps_lat}, {cust.gps_lng}
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
};

export default CustomerMap;
