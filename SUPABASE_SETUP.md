# Supabase Setup Guide for Rise for Texas

This guide will help you set up Supabase as your database for the Rise for Texas application.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `rise-for-texas`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### 3. Set Up Environment Variables

1. Copy `env.example` to `.env.local` in your project root
2. Update the values:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 4. Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This will create all necessary tables, indexes, and policies

### 5. Test the Connection

1. Start your development server: `npm run dev`
2. Try signing a petition or sharing content
3. Check the **Table Editor** in Supabase to see if data is being created

## 📊 Database Schema Overview

The schema includes these main tables:

- **`users`** - User accounts and authentication
- **`bills`** - Legislative bills and their details
- **`petitions`** - Advocacy campaigns
- **`signatures`** - Petition signatures
- **`social_shares`** - Social media sharing tracking
- **`stories`** - User testimonials and stories

## 🔐 Row Level Security (RLS)

The schema includes RLS policies that:

- Allow public read access to bills, petitions, and approved stories
- Allow authenticated users to create signatures, shares, and stories
- Restrict admin functions to users with appropriate roles

## 🚀 Deployment

### Vercel Deployment

1. Add environment variables in your Vercel project settings
2. Deploy your application
3. Supabase will work from any domain

### Other Platforms

- **Netlify**: Add environment variables in site settings
- **Railway**: Set environment variables in your service
- **Self-hosted**: Ensure your `.env` file is properly configured

## 🔧 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check that `.env.local` exists and has correct values
   - Restart your development server after adding environment variables

2. **"Database error: relation does not exist"**
   - Run the `supabase-schema.sql` script in Supabase SQL Editor
   - Check that all tables were created successfully

3. **"Permission denied"**
   - Verify RLS policies are set up correctly
   - Check that your Supabase anon key has proper permissions

4. **CORS errors**
   - Supabase handles CORS automatically
   - If you see CORS errors, check your Supabase project settings

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## 📈 Monitoring

### Supabase Dashboard

- **Table Editor**: View and edit data directly
- **Logs**: Monitor API requests and errors
- **Analytics**: Track database performance
- **Auth**: Manage user authentication

### Real-time Features

Supabase provides real-time subscriptions for:
- Live signature counts
- Real-time story updates
- Instant social share tracking

## 🔒 Security Best Practices

1. **Never expose your service role key** in client-side code
2. **Use RLS policies** to control data access
3. **Validate all inputs** before inserting into the database
4. **Monitor your API usage** in the Supabase dashboard
5. **Regularly review** your RLS policies and permissions

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/design)

## 🆘 Support

If you encounter issues:

1. Check the [Supabase Discord](https://discord.supabase.com)
2. Review [Supabase GitHub Issues](https://github.com/supabase/supabase)
3. Check the [Supabase Status Page](https://status.supabase.com)

---

**Note**: This setup replaces your previous backend API with Supabase's managed PostgreSQL database. All data will be stored in Supabase, and the application will communicate directly with the database through the Supabase client.
