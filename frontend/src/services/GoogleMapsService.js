class GoogleMapsService {
  static isLoaded = false;
  static loadPromise = null;
  static API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  static fallbackMode = false;

  /**
   * Load Google Maps JavaScript API
   * Note: In production, you should use a valid Google Maps API key
   * Set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file
   */
  static loadGoogleMaps() {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    // If no API key is provided, use fallback mode
    if (!this.API_KEY) {
      console.warn('Google Maps API key not provided. Using fallback mode.');
      this.fallbackMode = true;
      this.isLoaded = true;
      this.loadPromise = Promise.resolve();
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.API_KEY}&libraries=places,geometry&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Global callback function
      window.initMap = () => {
        this.isLoaded = true;
        resolve();
        // Clean up the global callback
        delete window.initMap;
      };

      script.onerror = (error) => {
        console.error('Google Maps API failed to load:', error);
        console.warn('Falling back to development mode without Google Maps.');
        this.fallbackMode = true;
        this.isLoaded = true;
        resolve();
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Get current GPS location
   */
  static getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Fallback for development
        if (this.fallbackMode) {
          console.warn('Geolocation not supported. Using Ghana center coordinates.');
          resolve({
            lat: 7.9465,
            lng: -1.0232,
            accuracy: 1000
          });
          return;
        }
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Failed to get current location';
              break;
          }
          
          // Fallback for development
          if (this.fallbackMode) {
            console.warn(`${errorMessage}. Using Ghana center coordinates.`);
            resolve({
              lat: 7.9465,
              lng: -1.0232,
              accuracy: 1000
            });
            return;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  /**
   * Create a Google Map instance or fallback placeholder
   */
  static createMap(container, options = {}) {
    if (!container) {
      throw new Error('Container element is required');
    }

    if (!(container instanceof Element)) {
      throw new Error('Container must be a valid DOM element');
    }

    // If in fallback mode, create a placeholder
    if (this.fallbackMode || !window.google) {
      return this.createFallbackMap(container, options);
    }

    // Check if container is visible and has dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      console.warn('Map container has no dimensions. Map may not display correctly.');
    }

    const defaultOptions = {
      zoom: 7,
      center: { lat: 7.9465, lng: -1.0232 }, // Ghana center
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      ...options
    };

    try {
      return new window.google.maps.Map(container, defaultOptions);
    } catch (error) {
      console.error('Failed to create Google Map:', error);
      console.warn('Falling back to placeholder map.');
      return this.createFallbackMap(container, options);
    }
  }

  /**
   * Create a fallback map placeholder for development
   */
  static createFallbackMap(container, options = {}) {
    // Clear container and add fallback content
    container.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px;">Google Maps Preview</h3>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Add your Google Maps API key to enable interactive maps</p>
        <div style="margin-top: 16px; padding: 8px 16px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 12px;">
          Ghana Center: 7.9465°N, 1.0232°W
        </div>
      </div>
    `;

    // Return a mock map object with basic functionality
    return {
      setCenter: (center) => console.log('Mock map setCenter:', center),
      setZoom: (zoom) => console.log('Mock map setZoom:', zoom),
      addListener: (event, callback) => console.log('Mock map addListener:', event),
      getCenter: () => ({ lat: () => 7.9465, lng: () => -1.0232 }),
      getZoom: () => 7,
      panTo: (position) => console.log('Mock map panTo:', position),
      fitBounds: (bounds) => console.log('Mock map fitBounds:', bounds)
    };
  }

  /**
   * Add marker to map
   */
  static addMarker(map, position, options = {}) {
    if (!this.isLoaded || !window.google) {
      throw new Error('Google Maps API not loaded');
    }

    const defaultOptions = {
      position,
      map,
      ...options
    };

    return new window.google.maps.Marker(defaultOptions);
  }

  /**
   * Add info window to marker
   */
  static addInfoWindow(marker, content) {
    if (!this.isLoaded || !window.google) {
      throw new Error('Google Maps API not loaded');
    }

    const infoWindow = new window.google.maps.InfoWindow({
      content
    });

    marker.addListener('click', () => {
      infoWindow.open(marker.get('map'), marker);
    });

    return infoWindow;
  }

  /**
   * Geocode address to coordinates
   */
  static geocodeAddress(address) {
    return new Promise((resolve, reject) => {
      if (!this.isLoaded || !window.google) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            latitude: location.lat(),
            longitude: location.lng(),
            formatted_address: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  /**
   * Reverse geocode coordinates to address
   */
  static reverseGeocode(latitude, longitude) {
    return new Promise((resolve, reject) => {
      if (!this.isLoaded || !window.google) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            formatted_address: results[0].formatted_address,
            address_components: results[0].address_components
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  /**
   * Calculate distance between two points
   */
  static calculateDistance(point1, point2) {
    if (!this.isLoaded || !window.google) {
      throw new Error('Google Maps API not loaded');
    }

    const service = new window.google.maps.DistanceMatrixService();
    
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix({
        origins: [point1],
        destinations: [point2],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      }, (response, status) => {
        if (status === 'OK') {
          const element = response.rows[0].elements[0];
          if (element.status === 'OK') {
            resolve({
              distance: element.distance,
              duration: element.duration
            });
          } else {
            reject(new Error('Route calculation failed'));
          }
        } else {
          reject(new Error(`Distance calculation failed: ${status}`));
        }
      });
    });
  }

  /**
   * Get directions between points
   */
  static getDirections(origin, destination, waypoints = []) {
    if (!this.isLoaded || !window.google) {
      throw new Error('Google Maps API not loaded');
    }

    const directionsService = new window.google.maps.DirectionsService();

    return new Promise((resolve, reject) => {
      directionsService.route({
        origin,
        destination,
        waypoints: waypoints.map(point => ({ location: point, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true
      }, (result, status) => {
        if (status === 'OK') {
          resolve(result);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });
  }

  /**
   * Ghana-specific location utilities
   */
  static getGhanaRegions() {
    return [
      { name: 'Greater Accra', center: { lat: 5.6037, lng: -0.1870 } },
      { name: 'Ashanti', center: { lat: 6.6885, lng: -1.6244 } },
      { name: 'Western', center: { lat: 5.3364, lng: -2.3194 } },
      { name: 'Central', center: { lat: 5.4518, lng: -1.3955 } },
      { name: 'Eastern', center: { lat: 6.1745, lng: -0.8715 } },
      { name: 'Volta', center: { lat: 6.5981, lng: 0.4712 } },
      { name: 'Northern', center: { lat: 9.5450, lng: -0.8400 } },
      { name: 'Upper East', center: { lat: 10.7890, lng: -0.8037 } },
      { name: 'Upper West', center: { lat: 10.3407, lng: -2.3378 } },
      { name: 'Brong Ahafo', center: { lat: 7.7167, lng: -2.3167 } }
    ];
  }

  /**
   * Check if coordinates are within Ghana bounds
   */
  static isInGhana(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    // Ghana approximate bounds
    const bounds = {
      north: 11.17,
      south: 4.74,
      east: 1.19,
      west: -3.26
    };

    return lat >= bounds.south && lat <= bounds.north && 
           lng >= bounds.west && lng <= bounds.east;
  }
}

export default GoogleMapsService;
