# Backend Route Organization

## Overview
This document explains how routes are organized to prevent conflicts and improve maintainability.

## Route Structure

### 1. Admin Routes Hierarchy
```
/api/admin/orders/*         → adminOrderRoutes.ts (SPECIFIC - comes FIRST)
/api/admin/products/*       → adminProductRoutes.ts (SPECIFIC - comes FIRST)
/api/admin/categories/*     → adminCategoryRoutes.ts (SPECIFIC - comes FIRST)
/api/admin/localization/*   → adminLocalizationRoutes.ts (SPECIFIC - comes FIRST)
/api/admin/*                → adminRoutes.ts (GENERAL - comes LAST)
```

**CRITICAL:** Specific routes MUST be registered before general routes in `server.ts`

### 2. Admin Order Routes (`/api/admin/orders`)
**File:** `backend/src/routes/adminOrderRoutes.ts`
**Mount Point:** `/api/admin/orders`

| Method | Route | Description |
|--------|--------|-------------|
| GET | `/` | Get all orders (with pagination & filters) |
| GET | `/:orderId` | Get single order details |
| PUT | `/:orderId/status` | Update order status |
| PUT | `/:orderId/shipping-company` | Update shipping company |
| PUT | `/bulk-status` | Bulk update order statuses |
| GET | `/sales/metrics` | Get sales metrics |
| GET | `/sales/analytics` | Get analytics data |
| GET | `/stats` | Get order statistics |

### 3. General Admin Routes (`/api/admin`)
**File:** `backend/src/routes/adminRoutes.ts`
**Mount Point:** `/api/admin`

| Method | Route | Description |
|--------|--------|-------------|
| GET | `/role` | Check admin role |
| GET | `/orders/:orderId/tracking` | Get order tracking info |
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create new category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

## Route Registration Order in server.ts

```typescript
// ✅ CORRECT ORDER - Specific routes first
app.use('/api/admin/orders', adminOrderRoutes);        // SPECIFIC
app.use('/api/admin/products', adminProductRoutes);     // SPECIFIC  
app.use('/api/admin/categories', adminCategoryRoutes);  // SPECIFIC
app.use('/api/admin/localization', adminLocalizationRoutes); // SPECIFIC
app.use('/api/admin', adminRoutes);                     // GENERAL (LAST)

// ❌ WRONG ORDER - Would cause conflicts
app.use('/api/admin', adminRoutes);                     // GENERAL (catches everything)
app.use('/api/admin/orders', adminOrderRoutes);        // NEVER REACHED
```

## Debugging Route Conflicts

### Symptoms:
- Routes returning unexpected data structure
- 404 errors on valid endpoints
- Wrong route handler being called

### Diagnosis:
1. Check route registration order in `server.ts`
2. Search for duplicate routes: `grep -r "router\.get.*orders" src/routes/`
3. Verify mount points match expected URLs
4. Check middleware application order

### Prevention:
1. Keep specific routes in dedicated files
2. Register specific routes before general ones
3. Document route responsibilities clearly
4. Use consistent naming conventions

## Response Format Standards

### Admin Order List Response:
```json
{
  "success": true,
  "orders": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Single Order Response:
```json
{
  "success": true,
  "data": { ... }
}
```

## Lessons Learned

**The 4-Hour Debug Session:**
- **Problem:** Duplicate `/orders` routes in `adminRoutes.ts` and `adminOrderRoutes.ts`
- **Cause:** Route precedence - general route caught requests before specific route
- **Solution:** Remove duplicate, fix registration order, consolidate functionality
- **Prevention:** This documentation and clear route organization

**Key Takeaways:**
1. Route order matters in Express.js
2. Specific routes must come before general routes
3. Consolidate related functionality in dedicated files
4. Document route responsibilities clearly
5. Use consistent response formats
