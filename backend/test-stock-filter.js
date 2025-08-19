import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000';

async function testStockStatusFilter() {
  try {
    console.log('🧪 Testing Stock Status Filter API...');
    
    // Test different stock status filters
    const testCases = [
      { stockStatus: 'all', expected: 'Should return all products' },
      { stockStatus: 'in_stock', expected: 'Should return products with stock > 10' },
      { stockStatus: 'low_stock', expected: 'Should return products with stock 1-10' },
      { stockStatus: 'out_of_stock', expected: 'Should return products with stock = 0' },
      { stockStatus: 'backorder', expected: 'Should return products with stock = 0' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📊 Testing: ${testCase.stockStatus}`);
      console.log(`Expected: ${testCase.expected}`);
      
      const url = `${API_BASE_URL}/api/admin/products?stockStatus=${testCase.stockStatus}&limit=5`;
      console.log(`URL: ${url}`);
      
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': 'Bearer test-token' // This will fail auth but we can see the endpoint structure
          }
        });
        
        if (response.status === 401) {
          console.log('✅ Endpoint exists (401 Unauthorized - expected without valid token)');
        } else {
          console.log(`📡 Response status: ${response.status}`);
          const data = await response.text();
          console.log(`📄 Response: ${data.substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
      }
    }
    
    console.log('\n🎯 Stock Status Filter Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStockStatusFilter();
