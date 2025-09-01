// Debug Authentication Issues
// Run with: node debug_auth.js

console.log('🔍 Authentication Debug Script');
console.log('==============================');

// Check environment variables
console.log('Environment Variables:');
console.log('- REACT_APP_MOBILE_MODE:', process.env.REACT_APP_MOBILE_MODE);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);

// Mock user objects for testing
const testUsers = [
  { id: 1, username: 'admin', is_superuser: true, role: 'admin' },
  { id: 2, username: 'superuser', is_superuser: true, role: 'superadmin' },
  { id: 3, username: 'manager', is_superuser: false, role: 'manager' },
  { id: 4, username: 'employee', is_superuser: false, role: 'employee' }
];

// Test superuser detection
const isSuperUser = (user) => {
  if (!user) return false;
  return user?.is_superuser === true || 
         user?.role === 'superadmin' || 
         user?.role === 'admin' ||
         user?.username === 'admin';
};

console.log('\nSuperuser Detection Tests:');
testUsers.forEach(user => {
  const result = isSuperUser(user);
  console.log(`- ${user.username}: ${result ? '✅ SUPERUSER' : '❌ Regular User'}`);
});

console.log('\n✅ Debug script completed');
