import React, { useContext, useEffect, useRef } from 'react';
import { Box, Typography, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tabs, Tab } from '@mui/material';
import { AuthContext } from '../AuthContext';

const CustomerHeatMap = ({ customers = [] }) => {
  const { user } = useContext(AuthContext);
  const mapRef = useRef(null);
  const [tabValue, setTabValue] = React.useState(0);

  // Sample customer data with GPS coordinates for Ghana
  const sampleCustomers = [
    {
      id: 1,
      name: "Accra Medical Center",
      customer_type: "wholesaler",
      email: "info@accramedical.com",
      phone: "+233 20 123 4567",
      address: "Ring Road Central, Accra",
      latitude: 5.6037,
      longitude: -0.1870
    },
    {
      id: 2,
      name: "Kumasi Health Clinic",
      customer_type: "retailer", 
      email: "contact@kumasiclinic.com",
      phone: "+233 32 456 7890",
      address: "Kejetia, Kumasi",
      latitude: 6.6885,
      longitude: -1.6244
    },
    {
      id: 3,
      name: "Tema Pharmacy Ltd",
      customer_type: "distributor",
      email: "sales@temapharm.com", 
      phone: "+233 30 987 6543",
      address: "Community 1, Tema",
      latitude: 5.6698,
      longitude: -0.0166
    },
    {
      id: 4,
      name: "Cape Coast Medical Supplies",
      customer_type: "wholesaler",
      email: "orders@ccmedical.com",
      phone: "+233 33 234 5678",
      address: "Commercial Street, Cape Coast", 
      latitude: 5.1053,
      longitude: -1.2466
    },
    {
      id: 5,
      name: "Takoradi Drug Store",
      customer_type: "retailer",
      email: "info@takoradidrugs.com",
      phone: "+233 31 345 6789",
      address: "Market Circle, Takoradi",
      latitude: 4.8845,
      longitude: -1.7554
    },
    {
      id: 6,
      name: "Ho Regional Hospital Pharmacy",
      customer_type: "distributor", 
      email: "pharmacy@horegional.com",
      phone: "+233 36 456 7890",
      address: "Ho Municipal, Volta Region",
      latitude: 6.6000,
      longitude: 0.4700
    },
    {
      id: 7,
      name: "Tamale Medical Center",
      customer_type: "wholesaler",
      email: "procurement@tamalemedical.com",
      phone: "+233 37 567 8901", 
      address: "Central Market Area, Tamale",
      latitude: 9.4034,
      longitude: -0.8424
    },
    {
      id: 8,
      name: "Sunyani Health Services",
      customer_type: "retailer",
      email: "orders@sunyanihealth.com",
      phone: "+233 35 678 9012",
      address: "Bono Regional Capital, Sunyani",
      latitude: 7.3392,
      longitude: -2.3265
    },
    {
      id: 9,
      name: "Bolgatanga Clinic Supplies",
      customer_type: "distributor",
      email: "supplies@bolgaclinic.com", 
      phone: "+233 38 789 0123",
      address: "Upper East Regional Capital",
      latitude: 10.7856,
      longitude: -0.8506
    },
    {
      id: 10,
      name: "Wa Medical Distributors",
      customer_type: "wholesaler",
      email: "distribution@wamedical.com",
      phone: "+233 39 890 1234",
      address: "Upper West Regional Capital, Wa",
      latitude: 10.0601,
      longitude: -2.5057
    }
  ];

  // Combine backend customers with sample data, prioritizing real customers
  const allCustomers = [...customers, ...sampleCustomers];

  // Check if user has superadmin access
  const isSuperAdmin = () => {
    return user?.is_superuser || user?.role === 'superadmin';
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

  // Filter customers with valid GPS coordinates
  const validCustomers = allCustomers.filter(customer => 
    (customer.latitude && customer.longitude) &&
    !isNaN(parseFloat(customer.latitude)) && !isNaN(parseFloat(customer.longitude))
  );

  // Initialize map
  useEffect(() => {
    if (tabValue === 0 && validCustomers.length > 0) {
      initializeMap();
    }
  }, [tabValue, validCustomers]);

  const initializeMap = async () => {
    try {
      // Dynamically import Leaflet to avoid SSR issues
      const L = await import('leaflet');
      
      // Clear existing map
      if (mapRef.current) {
        mapRef.current.remove();
      }

      // Create map centered on Ghana
      const map = L.map('customer-map').setView([7.9465, -1.0232], 7);
      mapRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
      }).addTo(map);

      // Add customer markers
      validCustomers.forEach(customer => {
        const lat = parseFloat(customer.latitude);
        const lng = parseFloat(customer.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const color = getCustomerTypeColor(customer.customer_type);
          
          // Create custom marker
          const marker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map);

          // Add popup
          marker.bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: ${color};">${customer.name || customer.company_name}</h4>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${customer.customer_type || 'Unknown'}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${customer.email || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Address:</strong> ${customer.address || 'N/A'}</p>
            </div>
          `);
        }
      });

      // Fit map to show all markers
      if (validCustomers.length > 0) {
        const group = new L.featureGroup(map._layers);
        if (Object.keys(group._layers).length > 0) {
          map.fitBounds(group.getBounds().pad(0.1));
        }
      }

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // Restrict access to superadmin only
  if (!isSuperAdmin()) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Access Restricted: Customer location data is only available to Superadmin users.
      </Alert>
    );
  }

  // Show message if no valid GPS data
  if (validCustomers.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No customer location data available for visualization.
        </Alert>
        <Typography variant="body2" color="textSecondary">
          To display customer locations, customers need to have GPS coordinates (latitude and longitude) in their profiles.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Found {allCustomers.length} customers total, but none have GPS coordinates.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
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
      
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
        <Tab label="Map View" />
        <Tab label="Table View" />
      </Tabs>

      {tabValue === 0 ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Interactive Customer Heat Map</Typography>
          <Box 
            id="customer-map" 
            sx={{ 
              height: '500px', 
              width: '100%', 
              border: '1px solid #ddd', 
              borderRadius: 1 
            }} 
          />
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Interactive Map:</strong> Click on markers to view customer details. 
              Use mouse wheel to zoom and drag to pan around the map.
            </Typography>
          </Alert>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Customer Locations Table</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Customer Name</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Latitude</strong></TableCell>
                  <TableCell><strong>Longitude</strong></TableCell>
                  <TableCell><strong>Address</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {customer.name || customer.company_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={customer.customer_type || 'Unknown'}
                        size="small"
                        sx={{ 
                          bgcolor: getCustomerTypeColor(customer.customer_type),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {customer.email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {customer.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {parseFloat(customer.latitude).toFixed(6)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {parseFloat(customer.longitude).toFixed(6)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {customer.address || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default CustomerHeatMap;
