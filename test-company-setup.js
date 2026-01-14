/**
 * Test Company Setup Flow
 * This script tests the company setup API endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test data
const testCompanyData = {
  organisation: '507f1f77bcf86cd799439011', // Replace with actual org ID
  companyName: 'Test Company Ltd',
  industry: 'IT',
  companyType: 'startup',
  employeeCount: '1-50',
  foundedYear: 2020,
  website: 'https://testcompany.com',
  description: 'A test company for development purposes',
  location: {
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '400001'
  },
  branding: {
    logo: 'https://testcompany.com/logo.png',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Arial, sans-serif',
    headerStyle: 'modern',
    footerStyle: 'simple'
  },
  salaryStructure: {
    hraPercentage: 0.1,
    specialAllowancePercentage: 0.113,
    statutoryBonusPercentage: 0.083,
    pfPercentage: 0.12,
    esicPercentage: 0.0075,
    gratuityPercentage: 0.048
  },
  employmentTerms: {
    probationPeriod: 6,
    noticePeriod: 30,
    contractDuration: 365,
    workingHours: '9 AM - 6 PM',
    workDays: 'Monday - Friday'
  },
  benefits: [
    {
      name: 'Health Insurance',
      type: 'insurance',
      value: 'Family coverage',
      isMandatory: true,
      description: 'Comprehensive health insurance'
    }
  ],
  policies: {
    leavePolicy: {
      annualLeave: 20,
      sickLeave: 10,
      maternityLeave: 26,
      paternityLeave: 15,
      otherLeave: 3
    },
    workPolicy: {
      remoteWork: true,
      flexibleHours: true,
      dressCode: 'Casual',
      overtimePolicy: 'Compensatory off'
    }
  }
};

async function testCompanySetup() {
  try {
    console.log('🧪 Testing Company Setup Flow...\n');

    // Step 1: Test company setup endpoint
    console.log('1️⃣ Testing company setup...');
    try {
      const setupResponse = await axios.post(`${BASE_URL}/user/company/setup`, testCompanyData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (setupResponse.data.success) {
        console.log('✅ Company setup successful!');
        console.log('Company ID:', setupResponse.data.data.company.id);
        console.log('Company Name:', setupResponse.data.data.company.profile.companyName);
      } else {
        console.log('❌ Company setup failed:', setupResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Company setup error:', error.response?.data?.message || error.message);
    }

    // Step 2: Test get company by organisation
    console.log('\n2️⃣ Testing get company by organisation...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/user/company/organisation/${testCompanyData.organisation}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (getResponse.data.success) {
        console.log('✅ Get company successful!');
        console.log('Company found:', getResponse.data.data.company.profile.companyName);
      } else {
        console.log('❌ Get company failed:', getResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Get company error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Company setup flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  console.log('⚠️  Note: This test requires authentication. Please set authToken variable.');
  console.log('⚠️  Note: Replace organisation ID with actual ID from your database.');
  
  if (!authToken) {
    console.log('\n🔐 To run this test:');
    console.log('1. Login to get auth token');
    console.log('2. Set authToken variable');
    console.log('3. Update organisation ID in test data');
    console.log('4. Run: node test-company-setup.js');
  } else {
    testCompanySetup();
  }
}

module.exports = { testCompanySetup, testCompanyData };
