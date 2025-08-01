// Test script to debug department dropdown issue
// This script will test the frontend API call to departments endpoint

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

async function testDepartmentsAPI() {
  try {
    console.log('🔐 Step 1: Getting JWT token...');
    
    // Get JWT token
    const loginResponse = await axios.post(`${API_BASE_URL}/token/`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.access;
    console.log('✅ JWT token obtained:', token.substring(0, 20) + '...');
    
    console.log('\n🏢 Step 2: Testing departments API...');
    
    // Test departments API with token
    const departmentsResponse = await axios.get(`${API_BASE_URL}/hr/departments/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Departments API Response:');
    console.log('Status:', departmentsResponse.status);
    console.log('Data:', JSON.stringify(departmentsResponse.data, null, 2));
    console.log('Total departments:', departmentsResponse.data.length);
    
    // Test if data is array
    console.log('\n🔍 Data validation:');
    console.log('Is array:', Array.isArray(departmentsResponse.data));
    console.log('Has length:', departmentsResponse.data.length > 0);
    
    // Show each department
    console.log('\n📋 Department list:');
    departmentsResponse.data.forEach((dept, i) => {
      console.log(`  ${i + 1}. ${dept.name} (ID: ${dept.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testDepartmentsAPI();
