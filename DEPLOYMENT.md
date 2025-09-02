# 🚀 Deployment Guide for Rise for Texas

## 📋 **Pre-Deployment Checklist**

### ✅ **Environment Variables Required**

Add these to your hosting platform's environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zqjatcnqzqnhiivilfaw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxamF0Y25xem9xbmhpdmlsZmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjEyNDMsImV4cCI6MjA3MTYzNzI0M30.ZeRmQJMCshKQe5B6pQ48uJZpwr1gGkqLSQHgbstvES0

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🌐 **Deployment Platforms**

### **Vercel (Recommended)**

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `main` branch

2. **Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from the checklist above

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Your app will be available at `https://your-project.vercel.app`

### **Netlify**

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18 (or higher)

3. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all variables from the checklist above

4. **Deploy**
   - Netlify will automatically deploy on every push to main

### **Railway**

1. **Create Project**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo

2. **Environment Variables**
   - Add all variables in the Variables tab

3. **Deploy**
   - Railway will automatically build and deploy

## 🗄️ **Database Setup**

### **Complete Supabase Setup**

1. **Run Database Schema**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and run the contents of `supabase-schema.sql`

2. **Verify Tables Created**
   - Check Table Editor for:
     - `users`
     - `bills`
     - `petitions`
     - `signatures`
     - `social_shares`
     - `stories`

3. **Test Connection**
   - Your app should now connect to Supabase
   - Trackers should show real-time data

## 🔧 **Post-Deployment Verification**

### **Test These Features:**

1. **Homepage Loads** ✅
2. **Trackers Show Data** ✅
3. **Petition Signing Works** ✅
4. **Social Sharing Works** ✅
5. **Real-time Updates** ✅

### **Check These URLs:**

- `/` - Homepage with trackers
- `/action` - Petition signing page
- `/bills` - Bills overview
- `/stories` - Stories page

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Missing Supabase environment variables"**
   - Check environment variables in your hosting platform
   - Ensure they're exactly as shown above

2. **"Database connection failed"**
   - Verify Supabase project is active
   - Check if database schema was run
   - Verify anon key is correct

3. **"Build failed"**
   - Ensure all environment variables are set
   - Check build logs for specific errors

4. **"Trackers not updating"**
   - Verify Supabase RLS policies are set
   - Check browser console for errors
   - Ensure real-time subscriptions are working

## 📱 **Performance Optimization**

### **Already Implemented:**

- ✅ **Dynamic Imports** - Supabase only loads when needed
- ✅ **Real-time Subscriptions** - Efficient database updates
- ✅ **Optimized Build** - Minimal bundle size
- ✅ **Error Boundaries** - Graceful error handling

### **Additional Optimizations:**

1. **Image Optimization**
   - All images use Next.js Image component
   - Automatic WebP conversion
   - Responsive sizing

2. **Code Splitting**
   - Automatic route-based code splitting
   - Dynamic imports for heavy components

3. **Caching**
   - Static page generation where possible
   - Efficient data fetching patterns

## 🔒 **Security Considerations**

### **Implemented Security:**

- ✅ **Row Level Security (RLS)** - Database access control
- ✅ **Environment Variables** - No secrets in client code
- ✅ **Input Validation** - All user inputs validated
- ✅ **Error Handling** - No sensitive data in error messages

### **Additional Security:**

1. **HTTPS Only** - All modern hosting platforms enforce this
2. **CORS Protection** - Supabase handles CORS automatically
3. **Rate Limiting** - Consider adding if needed

## 📊 **Monitoring & Analytics**

### **Recommended Tools:**

1. **Vercel Analytics** (if using Vercel)
2. **Supabase Dashboard** - Monitor database usage
3. **Browser DevTools** - Check for console errors
4. **Network Tab** - Monitor API calls

## 🎯 **Success Metrics**

### **Track These KPIs:**

- **Page Load Speed** - Should be under 3 seconds
- **Database Response Time** - Under 500ms
- **Real-time Update Latency** - Under 1 second
- **Error Rate** - Should be under 1%

---

## 🚀 **Ready to Deploy!**

Your Rise for Texas application is now fully optimized for production deployment. Follow the steps above for your chosen platform, and you'll have a fully functional, real-time application running with Supabase!

**Need Help?** Check the troubleshooting section or refer to the platform-specific documentation.
