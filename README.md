# DevNovate Blog Platform

A modern, full-featured blog platform built with Next.js 14, TypeScript, and Tailwind CSS. Share your knowledge, discover insights from the community, and build your professional network.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/registration with JWT tokens
- **Blog Management**: Create, edit, publish, and manage blog posts
- **Content Discovery**: Browse blogs by category, search, and trending
- **User Profiles**: Personal profiles with blog collections and stats
- **Admin Panel**: Content moderation and platform management
- **Responsive Design**: Mobile-first design that works on all devices

### Technical Features
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui component library
- **State Management**: React Context for auth and theme
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Updates**: Optimistic UI updates and real-time interactions
- **SEO Optimized**: Meta tags, Open Graph, and structured data

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **UI Components**: Shadcn/ui, Radix UI primitives
- **Forms**: React Hook Form, Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications
- **Authentication**: JWT-based auth system

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard
│   ├── blog/              # Blog viewing
│   ├── blogs/             # Blog listing
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profiles
│   ├── trending/          # Trending content
│   ├── write/             # Blog editor
│   ├── error.tsx          # Error boundary
│   ├── loading.tsx        # Loading states
│   ├── not-found.tsx      # 404 page
│   └── layout.tsx         # Root layout
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   ├── blog/              # Blog-specific components
│   ├── layout/            # Layout components
│   └── common/            # Common utilities
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and API
└── types/                  # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/devnovate-blog.git
   cd devnovate-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   JWT_SECRET=your-secret-key
   DATABASE_URL=your-database-url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Available Pages

### Public Pages
- **Home** (`/`) - Landing page with featured content
- **Blogs** (`/blogs`) - Browse all published blogs
- **Trending** (`/trending`) - Popular and trending content
- **Blog View** (`/blog/[slug]`) - Individual blog posts
- **User Profile** (`/profile/[username]`) - Public user profiles

### Authentication Pages
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration
- **Forgot Password** (`/forgot-password`) - Password recovery

### Protected Pages
- **Dashboard** (`/dashboard`) - User's personal dashboard
- **Write** (`/write`) - Blog creation and editing
- **Settings** (`/settings`) - User preferences
- **Admin** (`/admin`) - Admin panel (admin users only)

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS with a custom configuration. You can modify `tailwind.config.ts` to customize colors, fonts, and other design tokens.

### Theme System
The platform includes a dark/light theme system that can be toggled by users. Theme preferences are stored in localStorage.

### Component Library
UI components are built using Shadcn/ui, which provides a consistent design system. You can customize components in the `src/components/ui/` directory.

## 📊 API Integration

The frontend is designed to work with a RESTful API. Key endpoints include:

- **Authentication**: `/api/auth/*`
- **Blogs**: `/api/blogs/*`
- **Users**: `/api/users/*`
- **Comments**: `/api/comments/*`
- **Admin**: `/api/admin/*`

## 🎨 Customization

### Styling
- Modify `src/app/globals.css` for global styles
- Update `tailwind.config.ts` for design system changes
- Customize component styles in individual component files

### Components
- Add new UI components in `src/components/ui/`
- Create page-specific components in their respective directories
- Extend existing components by modifying their props and functionality

### Pages
- Add new routes by creating directories and `page.tsx` files in `src/app/`
- Implement new features by extending existing pages
- Add new API endpoints by creating route handlers

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible UI primitives
- [Lucide](https://lucide.dev/) - Beautiful icons

## 📞 Support

If you have any questions or need help:
- Create an issue on GitHub
- Check the documentation
- Join our community discussions

---

Built with ❤️ by the DevNovate team
