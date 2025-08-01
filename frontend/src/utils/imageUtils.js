/**
 * Utility functions for handling image URLs in the ERP system
 */

const API_BASE_URL = 'http://localhost:2025';

/**
 * Converts a relative or absolute profile picture URL to a fully qualified URL
 * @param {string|null} profilePictureUrl - The profile picture URL from the backend
 * @returns {string|null} - Fully qualified URL or null if no image
 */
export const getProfilePictureUrl = (profilePictureUrl) => {
  if (!profilePictureUrl) {
    return null;
  }
  
  // If already absolute URL, return as is
  if (profilePictureUrl.startsWith('http://') || profilePictureUrl.startsWith('https://')) {
    return profilePictureUrl;
  }
  
  // If relative URL, prepend the base URL
  if (profilePictureUrl.startsWith('/')) {
    return `${API_BASE_URL}${profilePictureUrl}`;
  }
  
  // If no leading slash, add it
  return `${API_BASE_URL}/${profilePictureUrl}`;
};

/**
 * Gets user initials for avatar fallback
 * @param {Object} user - User object with first_name and last_name
 * @returns {string} - User initials (e.g., "JD" for John Doe)
 */
export const getUserInitials = (user) => {
  if (!user) return '';
  
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  
  return `${firstInitial}${lastInitial}`;
};

/**
 * Validates if an image file is acceptable for profile pictures
 * @param {File} file - The file to validate
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateProfilePicture = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' 
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'Image size must be less than 5MB' 
    };
  }
  
  return { isValid: true, error: null };
};
