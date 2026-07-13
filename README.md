# 📚 ProshnoBank - Online Examination Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff.svg)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-81c784.svg)](https://supabase.io)

## 🌟 Overview

**ProshnoBank** is a comprehensive, modern online examination platform designed to revolutionize digital education. It provides an intuitive interface for students to take exams, teachers to manage question banks, and administrators to oversee the entire system.

### Key Features

**✨ Student Features**

- 📝 Take live and practice exams with real-time tracking
- 📊 View detailed performance analytics and progress
- 🏆 Compete on leaderboards and earn achievements
- 💬 Ask doubts in an integrated forum
- 📱 Responsive design for all devices

**🎓 Teacher Features**

- ❓ Create and manage question banks with category-based organization
- 📋 Setup and configure exam batches
- 👥 Monitor student performance and engagement
- 📈 Generate comprehensive analytics reports
- 🔐 Role-based access control for secure management

**🛡️ Admin Features**

- 👨‍💼 Complete user management system
- 📊 System-wide analytics and monitoring
- 🎨 Theme and configuration management
- 🔒 Advanced security and permission controls
- 📱 Responsive admin dashboard

## 🚀 Tech Stack

### Frontend

- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Next-generation build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Client state management

### Backend

- **Supabase** - Open-source Firebase alternative
- **PostgreSQL** - Robust relational database
- **Row Level Security (RLS)** - Database-level security

### Tools & Services

- **ESLint** - Code quality
- **TypeScript Compiler** - Type checking
- **Vitest** - Unit testing framework
- **Vercel** - Deployment platform

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Creativity-Freaks/proshnobank.git
cd proshnobank
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your values
# Required values:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📚 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Preview production build
npm run preview

# Run ESLint code quality checks
npm run lint

# Type checking without emitting files
npm run typecheck

# Run tests in watch mode
npm run test:watch

# Run all tests once
npm run test
```

## 🏗️ Project Structure

```
proshnobank/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   ├── teacher/        # Teacher-specific components
│   │   ├── routing/        # Route guard components
│   │   └── ui/             # Shared UI components
│   ├── pages/              # Page components
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and helpers
│   ├── integrations/       # Third-party integrations
│   ├── test/               # Test files and utilities
│   └── App.tsx             # Main App component
├── public/                 # Static assets
├── supabase/              # Supabase migrations and functions
├── scripts/               # Database and utility scripts
├── index.html             # HTML entry point
├── package.json           # Project dependencies
└── vite.config.ts         # Vite configuration
```

## 🔐 Authentication & Authorization

### User Roles

- **Admin** - Full system access and management
- **Teacher** - Can create exams and manage questions
- **Student** - Can take exams and view results

### Security Features

- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) on database tables
- Role-based access control (RBAC)
- Secure password hashing
- Protected API endpoints

## 🗄️ Database Schema

Key tables in the PostgreSQL database:

- `users` - User accounts and profile information
- `exam_batches` - Exam collections and metadata
- `questions` - Question bank with multiple types
- `exam_submissions` - Student exam responses
- `student_answers` - Individual answer tracking
- `categories` - Question categorization
- `live_events` - Real-time exam events

## 🌐 Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Vercel will auto-detect and deploy
# Configure environment variables in Vercel dashboard
```

### Deploy to Other Platforms

The project can be deployed to:

- Netlify
- GitHub Pages
- Self-hosted servers
- Docker containers

## 🤝 Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- How to submit issues and feature requests
- Development setup and workflow
- Code style and standards
- Pull request process

## 📝 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for our community standards.

## 🐛 Bug Reports & Feature Requests

Found a bug? Have a feature idea?

- 🐛 **Report bugs** on [GitHub Issues](https://github.com/Creativity-Freaks/proshnobank/issues)
- 💡 **Request features** with detailed descriptions
- 🔄 **Check existing issues** before creating duplicates

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👥 Team & Contributors

### Project Maintainers

- **Creativity-Freaks Team** - Core development team

### Contributors

We appreciate all contributors! Your name will appear here once your PR is merged.

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for a complete list.

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Styling framework
- **React Community** - Excellent tools and libraries
- **All Contributors** - Your time and effort

## 📞 Support & Contact

- 📧 **Email**: [info.proshnobank@gmail.com](mailto:info.proshnobank@gmail.com)
- 💬 **GitHub Discussions**: [Start a discussion](https://github.com/Creativity-Freaks/proshnobank/discussions)
- 🐦 **Facebook**: [@ProshnoBank](https://facebook.com/aacwith10ms)
- 📚 **Documentation**: [Full Docs](https://docs.proshnobank.app)

## 🗺️ Roadmap

### Upcoming Features

- Mobile app (React Native)
- AI-powered question generation
- Advanced analytics dashboard
- Live proctoring capabilities
- Integration with video conferencing
- Multi-language support
- Offline exam mode

## 📊 Statistics

- **⭐ GitHub Stars**: Coming soon
- **👥 Contributors**: Open to all
- **📈 Monthly Users**: Growing community
- **🎓 Active Exams**: Hundreds per month

## 🎉 Getting Started as a Contributor

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

Made with ❤️ by the [Creativity-Freaks](https://github.com/Creativity-Freaks) Team

[⬆ Back to Top](#-proshnobank---online-examination-platform)
