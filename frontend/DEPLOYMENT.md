# 🚀 Production Deployment Guide

## **Environment Configuration**

### **1. Create Environment File**
Create `.env.production` in your frontend directory:

```bash
# Production API URL
REACT_APP_API_URL=https://your-api-domain.com

# Environment
NODE_ENV=production

# App Configuration
REACT_APP_APP_NAME=E-commerce App
REACT_APP_VERSION=1.0.0
```

### **2. Build for Production**
```bash
npm run build
```

## **Deployment Options**

### **Option 1: Static Hosting (Netlify, Vercel, etc.)**
1. Set environment variable `REACT_APP_API_URL` in your hosting platform
2. Deploy the `build` folder
3. API calls will use the configured base URL

### **Option 2: VPS/Server**
1. Upload `build` folder to your server
2. Set up nginx/apache to serve static files
3. Configure `REACT_APP_API_URL` environment variable

### **Option 3: Docker**
```dockerfile
FROM nginx:alpine
COPY build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## **Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | **REQUIRED** - Your backend API URL | `https://api.yourdomain.com` |
| `NODE_ENV` | Environment (auto-set) | `production` |

## **Testing Configuration**

Check browser console for:
```
🌐 API Configuration:
  Environment: production
  Base URL: https://your-api-domain.com
  Timeout: 15000
  REACT_APP_API_URL: https://your-api-domain.com
```

## **Common Issues**

### **404 Errors in Production**
- ✅ Check `REACT_APP_API_URL` is set correctly
- ✅ Verify backend is accessible from frontend domain
- ✅ Check CORS configuration on backend

### **CORS Errors**
- Backend must allow your frontend domain
- Update backend CORS origin in production

## **Security Notes**

- Never commit `.env.production` to git
- Use HTTPS in production
- Set appropriate CORS origins on backend
- Consider API rate limiting
