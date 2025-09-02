# 🏛️ Rise for Texas

A civic engagement platform empowering Texans to fight against harmful legislation through petitions, stories, and community action.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account

### Local Development
```bash
# Clone the repository
git clone https://github.com/vk9-1/Rise4Texas.git
cd rise-for-texas

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Production Deployment
```bash
# Run deployment preparation script
./scripts/deploy.sh

# Or manually build
npm run build
```

## 🌟 Features

- **📝 Petition System** - Sign and track petitions against harmful bills
- **📊 Real-time Trackers** - Live updates for signatures, shares, and stories
- **📖 Bill Information** - Comprehensive details about Texas legislation
- **💬 Community Stories** - Share how bills affect your community
- **📱 Mobile Optimized** - Responsive design for all devices
- **⚡ Real-time Updates** - Instant data synchronization with Supabase

## 🏗️ Architecture

- **Frontend**: Next.js 15 with React 19
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Real-time**: Supabase real-time subscriptions

## 📁 Project Structure

```
rise-for-texas/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── action/            # Petition signing pages
│   ├── bills/             # Bill information pages
│   └── stories/           # Community stories
├── components/             # Reusable UI components
├── lib/                   # Utility functions and Supabase client
├── store/                 # Zustand state management
├── public/                # Static assets
└── scripts/               # Deployment and utility scripts
```

## 🔧 Configuration

### Environment Variables

Required for production:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NODE_ENV=production
```

### Database Setup

1. Create a Supabase project
2. Run the schema from `supabase-schema.sql`
3. Configure Row Level Security policies
4. Set up environment variables

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push to main

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`

### Other Platforms
See `DEPLOYMENT.md` for detailed instructions.

## 📊 Performance

- **Build Size**: Optimized bundle with code splitting
- **Load Time**: < 3 seconds on average connection
- **Database**: Real-time updates with < 500ms latency
- **SEO**: Optimized for search engines

## 🔒 Security

- **Row Level Security** - Database access control
- **Environment Variables** - No secrets in client code
- **Input Validation** - All user inputs validated
- **HTTPS Only** - Secure connections enforced

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [Supabase Setup](SUPABASE_SETUP.md)
- [API Documentation](docs/api.md)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/vk9-1/Rise4Texas/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vk9-1/Rise4Texas/discussions)
- **Documentation**: Check the docs folder

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Made with ❤️ for Texas**
