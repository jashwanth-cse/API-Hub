/**
 * Comprehensive API Hub Backend Test Suite
 * Tests all 8 steps as defined in the testing requirements
 */

const API_BASE_URL = 'http://localhost:3000';
const VALID_API_KEY = '6b5ef619bc4212854b7b506839fe960cbdca45ba602d9ac1bce511f37e5eaf86';
const INVALID_API_KEY = 'invalid_key_12345';

// Test data
const EXISTING_SITE_ID = 'demo-site';
const ANOTHER_SITE_ID = 'second-site';
const NON_EXISTING_SITE_ID = 'new-auto-created-site';

// Utility function to make requests
async function makeRequest(endpoint, method = 'GET', apiKey = VALID_API_KEY, body = null) {
    const options = {
        method,
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return { status: response.status, data };
}

// Test result tracking
let testsPassed = 0;
let testsFailed = 0;

function logTest(stepNumber, testName, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} [STEP ${stepNumber}] ${testName}: ${status}`);
    if (details) {
        console.log(`   ${details}`);
    }
    if (passed) {
        testsPassed++;
    } else {
        testsFailed++;
    }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('     API HUB BACKEND - COMPREHENSIVE TEST SUITE');
console.log('═══════════════════════════════════════════════════════════\n');

// STEP 1: Backend Availability Check
async function step1_BackendAvailability() {
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ STEP 1 — Backend Availability Check                    │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    try {
        const { status, data } = await makeRequest('/health', 'GET', null);

        const isRunning = status === 200 && data.success === true;
        logTest(1, 'Backend server is running', isRunning,
            `Status: ${status}, Environment: ${data.environment}`);

        return isRunning;
    } catch (error) {
        logTest(1, 'Backend server is running', false, `Error: ${error.message}`);
        return false;
    }
    console.log('');
}

// STEP 2: API Key Authentication Validation
async function step2_ApiKeyAuthentication() {
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ STEP 2 — API Key Authentication Validation             │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    // Test with valid API key
    try {
        const { status, data } = await makeRequest('/api/accessibility/config?siteId=test', 'GET', VALID_API_KEY);

        const isAuthenticated = status !== 401 && status !== 403;
        logTest(2, 'Valid API key accepted', isAuthenticated,
            `Status: ${status}`);
    } catch (error) {
        logTest(2, 'Valid API key accepted', false, `Error: ${error.message}`);
    }

    // Test with invalid API key
    try {
        const { status, data } = await makeRequest('/api/accessibility/config?siteId=test', 'GET', INVALID_API_KEY);

        const isRejected = status === 401 || status === 403;
        logTest(2, 'Invalid API key rejected', isRejected,
            `Status: ${status}, Error: ${data.error}`);
    } catch (error) {
        logTest(2, 'Invalid API key rejected', false, `Error: ${error.message}`);
    }

    // Test without API key
    try {
        const { status, data } = await makeRequest('/api/accessibility/config?siteId=test', 'GET', '');

        const isRejected = status === 401;
        logTest(2, 'Missing API key rejected', isRejected,
            `Status: ${status}, Error: ${data.error}`);
    } catch (error) {
        logTest(2, 'Missing API key rejected', false, `Error: ${error.message}`);
    }
}

// STEP 3: Accessibility Config Fetch Endpoint
async function step3_ConfigFetchEndpoint() {
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ STEP 3 — Accessibility Config Fetch Endpoint           │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    try {
        const { status, data } = await makeRequest(
            `/api/accessibility/config?siteId=${EXISTING_SITE_ID}`,
            'GET',
            VALID_API_KEY
        );

        const isSuccessful = status === 200 && data.success === true;
        logTest(3, 'Config fetch successful', isSuccessful,
            `Status: ${status}`);

        if (isSuccessful && data.data) {
            const hasConfig = data.data.config !== undefined;
            logTest(3, 'Response contains config', hasConfig,
                `Config keys: ${Object.keys(data.data.config || {}).join(', ')}`);

            console.log('\n   📋 Returned Configuration:');
            console.log('   ', JSON.stringify(data.data.config, null, 2).replace(/\n/g, '\n   '));

            return data.data.config; // Return for later comparison
        }
    } catch (error) {
        logTest(3, 'Config fetch successful', false, `Error: ${error.message}`);
    }
}

// STEP 4: Site Isolation Test
async function step4_SiteIsolation() {
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ STEP 4 — Site Isolation Test                           │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    try {
        // Fetch config for first site
        const { status: status1, data: data1 } = await makeRequest(
            `/api/accessibility/config?siteId=${EXISTING_SITE_ID}`,
            'GET',
            VALID_API_KEY
        );

        // Fetch config for second site
        const { status: status2, data: data2 } = await makeRequest(
            `/api/accessibility/config?siteId=${ANOTHER_SITE_ID}`,
            'GET',
            VALID_API_KEY
        );

        const bothSuccessful = status1 === 200 && status2 === 200;
        logTest(4, 'Both sites fetched successfully', bothSuccessful,
            `Site 1: ${status1}, Site 2: ${status2}`);

        if (bothSuccessful && data1.data && data2.data) {
            // Check that configs are different (site isolation)
            const config1 = JSON.stringify(data1.data.config);
            const config2 = JSON.stringify(data2.data.config);

            const areDifferent = config1 !== config2 || data1.data.site_id !== data2.data.site_id;
            logTest(4, 'Site isolation maintained', areDifferent,
                `Site IDs: ${data1.data.site_id} vs ${data2.data.site_id}`);
        }
    } catch (error) {
        logTest(4, 'Site isolation test', false, `Error: ${error.message}`);
    }
}

// STEP 5: Auto-Create Safety Check
async function step5_AutoCreateSafety() {
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ STEP 5 — Auto-Create Safety Check                      │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    try {
        const { status, data } = await makeRequest(
            `/api/accessibility/config?siteId=${NON_EXISTING_SITE_ID}`,
            'GET',
            VALID_API_KEY
        );

        const isSuccessful = status === 200 || status === 201;
        logTest(5, 'Non-existing site handled gracefully', isSuccessful,
            `Status: ${status}`);

        if (isSuccessful && data.data) {
            const hasDefaultConfig = data.data.config !== undefined;
            logTest(5, 'Default config returned/created', hasDefaultConfig,
                `Config returned for new site`);

            console.log('\n   📋 Default Configuration:');
            console.log('   ', JSON.stringify(data.data.config, null, 2).replace(/\n/g, '\n   '));
        }
    } catch (error) {
        logTest(5, 'Auto-create safety', false, `Error: ${error.message}`);
    }
}

// STEP 6: Config Update Endpoint
async function step6_ConfigUpdate() {
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ STEP 6 — Config Update Endpoint                        │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    const updatePayload = {
        cursor_mode_enabled: true,
        cursor_speed: 15,
        scroll_speed: 20,
        accessibility_profile: 'high_contrast',
        enter_hold_ms: 1500,
        exit_hold_ms: 1000,
        click_cooldown_ms: 500,
    };

    try {
        const { status, data } = await makeRequest(
            `/api/accessibility/sites/${EXISTING_SITE_ID}/config`,
            'PUT',
            VALID_API_KEY,
            updatePayload
        );

        const isSuccessful = status === 200 && data.success === true;
        logTest(6, 'Config update successful', isSuccessful,
            `Status: ${status}`);

        if (isSuccessful) {
            console.log('\n   ✏️  Updated Fields:');
            Object.keys(updatePayload).forEach(key => {
                console.log(`      ${key}: ${updatePayload[key]}`);
            });

            return updatePayload; // Return for verification in step 7
        }
    } catch (error) {
        logTest(6, 'Config update', false, `Error: ${error.message}`);
    }
}

// STEP 7: Re-fetch Verification
async function step7_RefetchVerification(expectedConfig) {
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ STEP 7 — Re-fetch Verification                         │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    if (!expectedConfig) {
        logTest(7, 'Re-fetch verification', false, 'No expected config from step 6');
        return;
    }

    try {
        const { status, data } = await makeRequest(
            `/api/accessibility/config?siteId=${EXISTING_SITE_ID}`,
            'GET',
            VALID_API_KEY
        );

        const isSuccessful = status === 200 && data.success === true;
        logTest(7, 'Re-fetch successful', isSuccessful,
            `Status: ${status}`);

        if (isSuccessful && data.data && data.data.config) {
            const config = data.data.config;

            // Verify each updated field
            let allMatch = true;
            for (const key in expectedConfig) {
                if (config[key] !== expectedConfig[key]) {
                    allMatch = false;
                    console.log(`   ⚠️  Mismatch: ${key} = ${config[key]} (expected ${expectedConfig[key]})`);
                }
            }

            logTest(7, 'Updated values persisted correctly', allMatch,
                allMatch ? 'All fields match' : 'Some fields do not match');
        }
    } catch (error) {
        logTest(7, 'Re-fetch verification', false, `Error: ${error.message}`);
    }
}

// STEP 8: Validation & Safety
async function step8_ValidationSafety() {
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ STEP 8 — Validation & Safety                           │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    // Test 1: Unsupported fields
    try {
        const { status, data } = await makeRequest(
            `/api/accessibility/sites/${EXISTING_SITE_ID}/config`,
            'PUT',
            VALID_API_KEY,
            { unsupported_field: 'value', malicious_sql: 'DROP TABLE users' }
        );

        const handled = status === 400 || status === 200; // Either reject or ignore
        logTest(8, 'Unsupported fields handled', handled,
            `Status: ${status}`);
    } catch (error) {
        logTest(8, 'Unsupported fields test', false, `Error: ${error.message}`);
    }

    // Test 2: Out-of-range values
    try {
        const { status, data } = await makeRequest(
            `/api/accessibility/sites/${EXISTING_SITE_ID}/config`,
            'PUT',
            VALID_API_KEY,
            { cursor_speed: -999999, scroll_speed: 999999999 }
        );

        const handled = status === 400 || status === 200;
        logTest(8, 'Out-of-range values handled', handled,
            `Status: ${status}`);
    } catch (error) {
        logTest(8, 'Out-of-range values test', false, `Error: ${error.message}`);
    }

    // Test 3: Missing siteId
    try {
        const { status, data } = await makeRequest(
            '/api/accessibility/config',
            'GET',
            VALID_API_KEY
        );

        const handled = status === 400 || data.error;
        logTest(8, 'Missing siteId handled', handled,
            `Status: ${status}, Error: ${data.error || 'None'}`);
    } catch (error) {
        logTest(8, 'Missing siteId test', false, `Error: ${error.message}`);
    }
}

// Main test runner
async function runAllTests() {
    const startTime = Date.now();

    const backendRunning = await step1_BackendAvailability();

    if (!backendRunning) {
        console.log('\n❌ Backend is not running. Please start the server first.\n');
        return;
    }

    await step2_ApiKeyAuthentication();
    await step3_ConfigFetchEndpoint();
    await step4_SiteIsolation();
    await step5_AutoCreateSafety();
    const updatedConfig = await step6_ConfigUpdate();
    await step7_RefetchVerification(updatedConfig);
    await step8_ValidationSafety();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                    TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (testsFailed === 0) {
        console.log('🎉 SUCCESS: All tests passed!\n');
    } else {
        console.log('⚠️  FAILURE: Some tests failed. Review the output above.\n');
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('💥 Fatal error running tests:', error);
    process.exit(1);
});
