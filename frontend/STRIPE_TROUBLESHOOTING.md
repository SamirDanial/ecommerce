# Stripe Payment Intent Error - Troubleshooting Guide

## Error: "Failed to create payment intent"

This error occurs when the frontend can't successfully communicate with the backend Stripe endpoint.

## 🔍 **Step-by-Step Debugging**

### **1. Check Backend Server Status**

First, ensure your backend server is running:

```bash
cd backend
npm run dev  # or npm start
```

You should see:
```
Server is running on port 5000
Connected to PostgreSQL database with Prisma
```

### **2. Test Backend API Endpoints**

Test if your backend is accessible:

```bash
# Test basic server
curl http://localhost:5000/health

# Test Stripe route
curl http://localhost:5000/api/stripe/test
```

Expected responses:
```json
// /health
{"status":"OK","timestamp":"2024-01-XX..."}

// /api/stripe/test  
{"message":"Stripe route is working!","timestamp":"2024-01-XX...","stripeConfigured":true}
```

### **3. Check Environment Variables**

#### **Backend (.env):**
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

#### **Frontend (.env):**
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### **4. Verify Stripe Configuration**

Check if Stripe is properly initialized in backend logs:

```
Creating payment intent with data: { amount: 2500, currency: 'usd', payment_method_types: [ 'card' ] }
Creating Stripe payment intent with: { amount: 2500, currency: 'usd', payment_method_types: [ 'card' ] }
Payment intent created successfully: pi_1234567890
```

If you see "Stripe not configured", your `STRIPE_SECRET_KEY` is missing.

### **5. Test Frontend-Backend Connection**

Open browser console and test the API call manually:

```javascript
// Test in browser console
fetch('http://localhost:5000/api/stripe/test')
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

### **6. Check CORS Issues**

Look for CORS errors in browser console:
```
Access to fetch at 'http://localhost:5000/api/stripe/create-payment-intent' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Fix:** Ensure backend CORS is properly configured.

### **7. Verify Network Requests**

In browser DevTools → Network tab:
1. **Try to make a payment**
2. **Look for the request** to `/api/stripe/create-payment-intent`
3. **Check the response** status and body

## 🚨 **Common Issues & Solutions**

### **Issue 1: Backend Server Not Running**
```
Error: Failed to fetch
```
**Solution:** Start your backend server

### **Issue 2: Wrong API URL**
```
Error: HTTP 404: Not Found
```
**Solution:** Check `REACT_APP_API_URL` in frontend `.env`

### **Issue 3: Stripe Not Configured**
```
Error: Stripe is not configured
```
**Solution:** Set `STRIPE_SECRET_KEY` in backend `.env`

### **Issue 4: CORS Blocked**
```
Error: CORS policy blocked
```
**Solution:** Check backend CORS configuration

### **Issue 5: Missing Environment Variables**
```
Error: Cannot read property 'REACT_APP_API_URL'
```
**Solution:** Restart frontend after adding `.env` file

## 🔧 **Quick Fixes**

### **Fix 1: Restart Both Servers**
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend  
npm start
```

### **Fix 2: Check Ports**
- **Backend**: Should run on port 5000
- **Frontend**: Should run on port 3000
- **No port conflicts**

### **Fix 3: Verify File Structure**
```
backend/
  ├── src/
  │   ├── routes/
  │   │   └── stripeRoutes.ts  ✅
  │   └── server.ts            ✅
  └── .env                     ✅

frontend/
  ├── src/
  │   ├── components/
  │   │   └── StripePaymentForm.tsx  ✅
  │   └── lib/
  │       └── axios.ts               ✅
  └── .env                           ✅
```

## 📋 **Debug Checklist**

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Backend `.env` has `STRIPE_SECRET_KEY`
- [ ] Frontend `.env` has `REACT_APP_API_URL`
- [ ] No CORS errors in browser console
- [ ] Network requests show in DevTools
- [ ] Backend logs show incoming requests
- [ ] Stripe configuration logs appear

## 🆘 **Still Having Issues?**

### **1. Check Backend Logs**
Look for detailed error messages in your backend terminal.

### **2. Check Browser Console**
Look for JavaScript errors and network request failures.

### **3. Test API Manually**
Use Postman or curl to test backend endpoints directly.

### **4. Verify Stripe Keys**
Ensure you're using the correct test keys from Stripe Dashboard.

### **5. Check File Changes**
Make sure all updated files are saved and servers restarted.

---

**Most common cause:** Missing environment variables or servers not restarted after changes.

**Quick test:** Visit `http://localhost:5000/api/stripe/test` in your browser - you should see a JSON response.
