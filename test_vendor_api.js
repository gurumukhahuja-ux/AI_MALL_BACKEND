// Test script to verify vendor API endpoints
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testVendorSystem() {
    console.log('🧪 Testing Vendor System APIs...\n');

    try {
        // Test 1: Create a test agent
        console.log('1️⃣ Testing Agent Creation...');
        const createResponse = await axios.post(`${API_BASE}/agents`, {
            agentName: 'Test AI Assistant',
            description: 'A test AI assistant for productivity',
            category: 'productivity',
            pricingModel: 'free',
            status: 'Draft',
            health: 'All Good'
        });
        console.log('✅ Agent created successfully!');
        console.log('   Agent ID:', createResponse.data._id);
        console.log('   Agent Name:', createResponse.data.agentName);
        console.log('   Status:', createResponse.data.status);
        console.log('   Pricing Model:', createResponse.data.pricingModel);

        const agentId = createResponse.data._id;

        // Test 2: Get all agents
        console.log('\n2️⃣ Testing Get All Agents...');
        const allAgentsResponse = await axios.get(`${API_BASE}/agents`);
        console.log(`✅ Found ${allAgentsResponse.data.length} live agents`);

        // Test 3: Get vendor apps (if vendorId exists)
        if (createResponse.data.vendorId) {
            console.log('\n3️⃣ Testing Get Vendor Apps...');
            const vendorAppsResponse = await axios.get(`${API_BASE}/agents/vendor/${createResponse.data.vendorId}`);
            console.log(`✅ Found ${vendorAppsResponse.data.length} apps for this vendor`);
        }

        // Test 4: Get app details
        console.log('\n4️⃣ Testing Get App Details...');
        const detailsResponse = await axios.get(`${API_BASE}/agents/${agentId}/details`);
        console.log('✅ App details retrieved successfully!');
        console.log('   Total Users:', detailsResponse.data.usage.totalUsers);

        console.log('\n🎉 All tests passed! Vendor system is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        console.error('   Status:', error.response?.status);
        console.error('   Details:', error.response?.data);
    }
}

testVendorSystem();
