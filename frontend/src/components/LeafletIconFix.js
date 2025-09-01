import L from 'leaflet';

// Fix leaflet default marker icons - centralized solution
const fixLeafletIcons = () => {
  if (typeof window === 'undefined') return;

  // Delete the default icon URL getter to prevent conflicts
  delete L.Icon.Default.prototype._getIconUrl;

  // Set up default icon paths
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

// Safe icon creation with error handling
export const createCustomIcon = (options = {}) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const defaultOptions = {
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    };

    return new L.Icon({
      ...defaultOptions,
      ...options
    });
  } catch (error) {
    console.warn('Failed to create custom icon, using default:', error);
    return null;
  }
};

// Green marker for location selection
export const createLocationIcon = () => {
  return createCustomIcon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  });
};

// Blue marker for customers
export const createCustomerIcon = () => {
  return createCustomIcon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  });
};

// Red marker for warehouses
export const createWarehouseIcon = () => {
  return createCustomIcon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  });
};

// Initialize the fix when module loads
fixLeafletIcons();

export default fixLeafletIcons;
