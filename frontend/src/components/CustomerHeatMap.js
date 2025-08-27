import React, { useEffect, useContext, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Box, Typography, Chip, Alert } from '@mui/material';
import { AuthContext } from '../AuthContext';
import L from 'leaflet';

// Fix leaflet default marker icons - ensure no Google Maps conflicts
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom red marker for heat map visualization
const createRedIcon = () => {
  if (typeof window === 'undefined') return null;
  
  return new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Customer type colors
const getCustomerTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'wholesaler': return '#FF5722';
    case 'distributor': return '#FF9800';
    case 'retailer': return '#4CAF50';
    default: return '#2196F3';
  }
};

const CustomerHeatMap = ({ customers = [] }) => {
  const { user } = useContext(AuthContext);
  const [mapCenter, setMapCenter] = useState([5.6037, -0.1870]); // Default to Accra, Ghana
  const [mapZoom, setMapZoom] = useState(10);
  const [redIcon, setRedIcon] = useState(null);
  const [mapError, setMapError] = useState(null);

  // Check if user has superadmin access
  const isSuperAdmin = () => {
    return user?.is_superuser || user?.role === 'superadmin';
  };

  useEffect(() => {
    // Initialize red icon safely
    try {
      const icon = createRedIcon();
      setRedIcon(icon);
    } catch (error) {
      console.warn('Could not create custom marker icon:', error);
      setMapError('Map markers may not display correctly');
    }
  }, []);

  useEffect(() => {
    // Calculate map center based on customer locations
    if (customers.length > 0) {
      const validCustomers = customers.filter(c => c.gps_lat && c.gps_lng);
      if (validCustomers.length > 0) {
        try {
          const avgLat = validCustomers.reduce((sum, c) => sum + parseFloat(c.gps_lat), 0) / validCustomers.length;
          const avgLng = validCustomers.reduce((sum, c) => sum + parseFloat(c.gps_lng), 0) / validCustomers.length;
          
          if (!isNaN(avgLat) && !isNaN(avgLng)) {
            setMapCenter([avgLat, avgLng]);
            setMapZoom(12);
          }
        } catch (error) {
          console.warn('Error calculating map center:', error);
        }
      }
    }
  }, [customers]);

  // Restrict access to superadmin only
  if (!isSuperAdmin()) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Access Restricted: Customer location heat map is only available to Superadmin users.
      </Alert>
    );
  }

  // Filter customers with valid coordinates
  const validCustomers = customers.filter(customer => 
    customer.gps_lat && customer.gps_lng &&
    !isNaN(parseFloat(customer.gps_lat)) && !isNaN(parseFloat(customer.gps_lng))
  );

  return (
    <Box sx={{ height: 600, width: '100%', position: 'relative' }}>
      {mapError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {mapError}
        </Alert>
      )}
      
      {validCustomers.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No customer location data available for heat map visualization.
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`Total Customers: ${validCustomers.length}`} 
              color="primary" 
              size="small" 
            />
            <Chip 
              label={`Wholesalers: ${validCustomers.filter(c => c.customer_type === 'wholesaler').length}`} 
              sx={{ bgcolor: '#FF5722', color: 'white' }}
              size="small" 
            />
            <Chip 
              label={`Distributors: ${validCustomers.filter(c => c.customer_type === 'distributor').length}`} 
              sx={{ bgcolor: '#FF9800', color: 'white' }}
              size="small" 
            />
            <Chip 
              label={`Retailers: ${validCustomers.filter(c => c.customer_type === 'retailer').length}`} 
              sx={{ bgcolor: '#4CAF50', color: 'white' }}
              size="small" 
            />
          </Box>
          
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            whenCreated={(mapInstance) => {
              // Ensure map is properly initialized
              setTimeout(() => {
                mapInstance.invalidateSize();
              }, 100);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            
            {validCustomers.map((customer) => (
              <React.Fragment key={customer.id}>
                {/* Customer marker */}
                <Marker 
                  position={[parseFloat(customer.gps_lat), parseFloat(customer.gps_lng)]}
                  icon={redIcon || undefined}
                >
                  <Popup>
                    <Box sx={{ minWidth: 200 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {customer.name || customer.company_name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Type:</strong> {customer.customer_type || 'Not specified'}
                        </Typography>
                        
                        {customer.email && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Email:</strong> {customer.email}
                          </Typography>
                        )}
                        
                        {customer.phone && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Phone:</strong> {customer.phone}
                          </Typography>
                        )}
                        
                        {customer.address && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Address:</strong> {customer.address}
                          </Typography>
                        )}
                        
                        <Chip 
                          label={customer.customer_type || 'Unknown'}
                          size="small"
                          sx={{ 
                            mt: 1,
                            bgcolor: getCustomerTypeColor(customer.customer_type),
                            color: 'white',
                            alignSelf: 'flex-start'
                          }}
                        />
                      </Box>
                    </Box>
                  </Popup>
                </Marker>
                
                {/* Heat circle around customer location */}
                <Circle
                  center={[parseFloat(customer.gps_lat), parseFloat(customer.gps_lng)]}
                  radius={500} // 500 meter radius
                  pathOptions={{
                    color: getCustomerTypeColor(customer.customer_type),
                    fillColor: getCustomerTypeColor(customer.customer_type),
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </>
      )}
    </Box>
  );
};

export default CustomerHeatMap;
