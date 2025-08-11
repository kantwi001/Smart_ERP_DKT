// Frontend-Backend Connectivity Test Script
// Run this in browser console to diagnose connectivity issues

console.log('🔍 Testing Frontend-Backend Connectivity...');

// Test 1: Basic fetch to backend
async function testBasicConnectivity() {
  console.log('1. Testing basic backend connectivity...');
  try {
    const response = await fetch('http://localhost:2025/api/');
    console.log('✅ Backend is reachable:', response.status);
    const text = await response.text();
    console.log('Response:', text.substring(0, 200) + '...');
    return true;
  } catch (error) {
    console.error('❌ Backend connectivity failed:', error);
    return false;
  }
}

// Test 2: Test CORS headers
async function testCORS() {
  console.log('2. Testing CORS configuration...');
  try {
    const response = await fetch('http://localhost:2025/api/', {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    console.log('✅ CORS preflight response:', response.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    });
    return true;
  } catch (error) {
    console.error('❌ CORS test failed:', error);
    return false;
  }
}

// Test 3: Test specific endpoints
async function testEndpoints() {
  console.log('3. Testing specific API endpoints...');
  const endpoints = [
    '/api/users/',
    '/api/sales/customers/',
    '/api/inventory/products/',
    '/api/hr/employees/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:2025${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status}`);
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Test 4: Check if frontend server is running
function checkFrontendServer() {
  console.log('4. Checking frontend server status...');
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  
  if (window.location.port === '2026') {
    console.log('✅ Frontend server is running on port 2026');
    return true;
  } else {
    console.log('⚠️  Frontend may not be running on expected port 2026');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive connectivity tests...');
  
  const results = {
    basicConnectivity: await testBasicConnectivity(),
    cors: await testCORS(),
    frontendServer: checkFrontendServer()
  };
  
  await testEndpoints();
  
  console.log('📊 Test Results Summary:', results);
  
  // Provide recommendations
  if (!results.basicConnectivity) {
    console.log('🔧 RECOMMENDATION: Backend server may not be running. Start with:');
    console.log('   cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend');
    console.log('   source venv/bin/activate');
    console.log('   python manage.py runserver 0.0.0.0:2025');
  }
  
  if (!results.frontendServer) {
    console.log('🔧 RECOMMENDATION: Frontend server may not be running. Start with:');
    console.log('   cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend');
    console.log('   npm start');
  }
  
  if (!results.cors) {
    console.log('🔧 RECOMMENDATION: CORS configuration may need updating in Django settings');
  }
}

// Execute tests
runAllTests();
