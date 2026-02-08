// Test script for API Hub Backend
const API_BASE_URL = 'http://localhost:3000';
const API_KEY = '6b5ef619bc4212854b7b506839fe960cbdca45ba602d9ac1bce511f37e5eaf86';

console.log('🧪 Testing API Hub Backend...\n');

// Test 1: Health Check (no auth required)
async function testHealthCheck() {
    console.log('1️⃣ Testing Health Check...');
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Health Check:', response.status, data);
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
    }
    console.log('');
}

// Test 2: Get All Resources (requires auth)
async function testGetAllResources() {
    console.log('2️⃣ Testing GET /api/accessibility...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/accessibility`, {
            headers: {
                'x-api-key': API_KEY,
            },
        });
        const data = await response.json();
        console.log('✅ GET All Resources:', response.status, data);
    } catch (error) {
        console.error('❌ GET Failed:', error.message);
    }
    console.log('');
}

// Test 3: Test without API key (should fail)
async function testWithoutAuth() {
    console.log('3️⃣ Testing without API key (should fail)...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/accessibility`);
        const data = await response.json();
        console.log('Status:', response.status, data);
    } catch (error) {
        console.error('Error:', error.message);
    }
    console.log('');
}

// Test 4: Create a new resource
async function testCreateResource() {
    console.log('4️⃣ Testing POST /api/accessibility...');
    const testResource = {
        title: 'Test Resource',
        description: 'This is a test accessibility resource',
        url: 'https://example.com',
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/accessibility`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
            body: JSON.stringify(testResource),
        });
        const data = await response.json();
        console.log('✅ POST Create Resource:', response.status, data);
        return data.data?.id; // Return the ID for further tests
    } catch (error) {
        console.error('❌ POST Failed:', error.message);
        return null;
    }
    console.log('');
}

// Run all tests
async function runTests() {
    await testHealthCheck();
    await testWithoutAuth();
    await testGetAllResources();

    // Note: Uncomment below if you have Supabase configured
    // await testCreateResource();

    console.log('✨ Tests completed!\n');
}

runTests();
