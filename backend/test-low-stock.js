import axios from 'axios';

// Test script to verify low stock notifications
async function testLowStockNotification() {
  const API_BASE = 'http://localhost:5000/api';
  const token = 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDIyMkFBQSIsImtpZCI6Imluc18zMTVzVFF2ZEZDWElPbE1HbUM1d2hkNkN4ejkiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NTYyODEwODksImlhdCI6MTc1NjI3NTA4OSwiaXNzIjoiaHR0cHM6Ly9rbm93aW5nLXBvc3N1bS0zOS5jbGVyay5hY2NvdW50cy5kZXYiLCJqdGkiOiI2YzhlYmI4MTg1ZjY4YjI0NjY5ZiIsIm5iZiI6MTc1NjI3NTA4NCwic3ViIjoidXNlcl8zMWx1emVZQmdleVo1aURYekEyT05FSTBPWUIifQ.cYX4Bc_PRdR84SSunG4r6s4uW7rtkaqRgEwgzNJZzzOIbiTrHRv1IUF5rOHzHjpO0qqTUWeipuSsTYeNXw4DB4gshr46o0JMRVu_vKGoixsrvVXrF7EJR53h3KzL92eOy2g6X55qcAABBMOINIoD0jhvsJd6AMEO50aB9PfcbHYLLndy8EhS8RI3X0ZIG-Wx6RPBG7wJ2WFY3V-bYtO0eboDSMgQzokNlQhuN6_RLOlO1fm3vpThJms7mX03EYlSrzAffj2svrlvoBu4AtwYW345S_LiqUPJvY_8aYej2eKVkd416k0k-63JkAWYz2CQHqcGy4KCL7amBrwbmb6SBQ';

  try {
    console.log('🧪 Testing low stock notification system...');

    // First, let's get some products to work with
    console.log('📦 Fetching products...');
    const productsResponse = await axios.get(`${API_BASE}/admin/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!productsResponse.data.success || !productsResponse.data.products.length) {
      console.log('❌ No products found. Please add some products first.');
      return;
    }

    const products = productsResponse.data.products;
    console.log(`✅ Found ${products.length} products`);

    // Find a product with variants
    let testProduct = null;
    let testVariant = null;

    for (const product of products) {
      if (product.variants && product.variants.length > 0) {
        testProduct = product;
        testVariant = product.variants[0];
        break;
      }
    }

    if (!testProduct || !testVariant) {
      console.log('❌ No products with variants found. Please add product variants first.');
      return;
    }

    console.log(`🎯 Testing with product: ${testProduct.name}`);
    console.log(`🎯 Testing with variant: ${testVariant.size} ${testVariant.color} (Stock: ${testVariant.stock}, Threshold: ${testVariant.lowStockThreshold})`);

    // Set the low stock threshold to a high value to trigger the alert
    console.log('⚙️ Setting low stock threshold to 10...');
    const updateResponse = await axios.put(`${API_BASE}/admin/products/${testProduct.id}/variants/${testVariant.id}`, {
      lowStockThreshold: 10
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!updateResponse.data.success) {
      console.log('❌ Failed to update variant threshold');
      return;
    }

    console.log('✅ Low stock threshold updated');

    // Now create a test order that will deduct stock and trigger the notification
    console.log('🛒 Creating test order to trigger low stock notification...');
    
    const orderData = {
      userId: 1, // Assuming user ID 1 exists
      orderNumber: `TEST-${Date.now()}`,
      subtotal: testVariant.price || 100,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: testVariant.price || 100,
      currency: 'USD',
      language: 'ENGLISH',
      items: [{
        productId: testProduct.id,
        variantId: testVariant.id,
        productName: testProduct.name,
        size: testVariant.size,
        color: testVariant.color,
        quantity: 1,
        price: testVariant.price || 100,
        total: testVariant.price || 100
      }],
      paymentData: {
        amount: testVariant.price || 100,
        currency: 'USD',
        transactionId: `test-${Date.now()}`,
        method: 'TEST'
      }
    };

    const orderResponse = await axios.post(`${API_BASE}/orders/create-from-payment`, orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!orderResponse.data.success) {
      console.log('❌ Failed to create test order:', orderResponse.data.message);
      return;
    }

    console.log('✅ Test order created successfully');
    console.log('📢 Low stock notification should have been triggered!');

    // Check notifications
    console.log('🔔 Checking for low stock notifications...');
    const notificationsResponse = await axios.get(`${API_BASE}/notifications?type=LOW_STOCK_ALERT`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (notificationsResponse.data.success) {
      const lowStockNotifications = notificationsResponse.data.data.notifications;
      console.log(`📊 Found ${lowStockNotifications.length} low stock notifications`);
      
      if (lowStockNotifications.length > 0) {
        const latestNotification = lowStockNotifications[0];
        console.log('🎉 Latest low stock notification:');
        console.log(`   Title: ${latestNotification.title}`);
        console.log(`   Message: ${latestNotification.message}`);
        console.log(`   Priority: ${latestNotification.priority}`);
        console.log(`   Created: ${latestNotification.createdAt}`);
      }
    }

    console.log('✅ Low stock notification test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testLowStockNotification();
