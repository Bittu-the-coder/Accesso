# Accesso - Modern SaaS File & Text Sharing Platform

A comprehensive, production-ready SaaS platform built with Next.js 14, featuring temporary file sharing, text sharing (pastebin), and URL shortener with extraordinary SEO optimization.

## 🚀 Features

### 📝 Text Sharing

- Share code snippets, notes, or any text content
- Syntax highlighting support for 10+ programming languages
- Unique 8-character access codes
- Automatic expiration (24 hours for free tier)
- View count tracking
- Direct URL access

### 📁 File Transfer

- Upload multiple files with a single code
- Support for files up to 10MB each (free tier)
- Powered by ImageKit CDN for fast delivery
- Download tracking
- Secure temporary storage
- All files under one shareable code

### 🔗 URL Shortener

- Create short, memorable links
- Custom aliases support
- Click analytics and tracking
- No expiration by default
- QR code generation (coming soon)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes (Edge Functions)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: ImageKit CDN
- **Deployment**: Vercel (recommended)
- **Package Manager**: pnpm

## 📦 Installation

### Prerequisites

- Node.js 18+ and pnpm installed
- Supabase account and project
- ImageKit account

### 1. Clone and Install

```bash
# Navigate to project directory
cd Accesso

# Install dependencies
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ImageKit Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
FREE_TIER_EXPIRY_HOURS=24
MAX_FILE_SIZE_MB=10
MAX_TEXT_LENGTH=50000
```

### 3. Database Setup

Run the SQL schema in your Supabase project:

```bash
# Copy the schema from supabase-schema.sql and run it in Supabase SQL Editor
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` 🎉

## 🏗️ Project Structure

```
Accesso/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── text/          # Text sharing endpoints
│   │   │   ├── files/         # File upload/download
│   │   │   └── links/         # URL shortener
│   │   ├── text/              # Text sharing page
│   │   ├── files/             # File transfer page
│   │   ├── links/             # URL shortener page
│   │   ├── l/[code]/          # Short URL redirect
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── navigation.tsx
│   │   ├── footer.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   └── lib/                   # Utilities & configurations
│       ├── supabase.ts        # Supabase client
│       ├── imagekit.ts        # ImageKit integration
│       ├── database.types.ts  # TypeScript types
│       └── utils.ts           # Helper functions
├── backup-old-project/        # Old project backup
├── supabase-schema.sql        # Database schema
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔐 Security Features

- Row Level Security (RLS) enabled on all tables
- IP logging for abuse prevention
- Automatic content expiration
- File size limits
- Content length validation
- No authentication required (anonymous sharing)

## 🎨 SEO Optimization

- Comprehensive meta tags
- Open Graph and Twitter Card support
- Semantic HTML structure
- Optimized images with Next.js Image
- Structured data markup
- Mobile-responsive design
- Fast page load times with Edge Functions
- Server-side rendering for SEO-critical pages

## 📊 Database Schema

### Tables

- `text_shares` - Text/code snippet storage
- `file_shares` - File metadata and URLs
- `short_urls` - Shortened URL mappings
- `url_clicks` - Click analytics

See `supabase-schema.sql` for complete schema.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
pnpm install -g vercel
vercel
```

### Environment Variables on Vercel

Add all variables from `.env.local` to your Vercel project settings.

## 🔧 Configuration

### Free Tier Limits

- Text: 50,000 characters
- Files: 10MB per file
- Expiration: 24 hours
- No authentication required

### Upgrade Options

- Increase file size limits
- Longer expiration times
- Custom domains
- Advanced analytics
- API access

## 📝 API Documentation

### Text Sharing API

**Create Text Share**

```http
POST /api/text/create
Content-Type: application/json

{
  "title": "My Code",
  "content": "console.log('Hello')",
  "language": "javascript"
}
```

**Get Text Share**

```http
GET /api/text/{code}
```

### File Sharing API

**Upload File**

```http
POST /api/files/upload
Content-Type: multipart/form-data

file: [binary]
code: [optional existing code]
```

**List Files**

```http
GET /api/files/{code}
```

### URL Shortener API

**Create Short URL**

```http
POST /api/links/create
Content-Type: application/json

{
  "url": "https://example.com",
  "customAlias": "mylink",
  "title": "My Website"
}
```

**Get Stats**

```http
GET /api/links/{code}/stats
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

Built with:

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [ImageKit](https://imagekit.io/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📧 Support

For support, email support@accesso.com or open an issue on GitHub.

---

**Note**: This is the upgraded version 2.0 of the original project. Old files are backed up in `backup-old-project/` folder.
