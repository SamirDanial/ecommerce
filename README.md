# E-Commerce Full-Stack Application

A modern, full-stack e-commerce application built with React, Node.js, and Clerk authentication.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI/UX** with Tailwind CSS and shadcn/ui components
- **Responsive Design** optimized for all devices
- **Authentication** via Clerk (OAuth + Email/Password)
- **Product Management** with categories and search
- **Shopping Cart** with persistent state
- **Wishlist** functionality
- **User Profile** with orders, addresses, and preferences
- **Theme Toggle** (Light/Dark mode)

### Backend (Node.js + Express)
- **RESTful API** with Express.js
- **Database** with Prisma ORM and SQLite
- **Authentication** integration with Clerk webhooks
- **User Management** with profile data sync
- **Session Management** for security
- **Webhook Handling** for real-time updates

### Authentication (Clerk)
- **OAuth Providers** (Google, Facebook, Apple)
- **Email/Password** authentication
- **Email Verification** flow
- **Session Management**
- **Webhook Integration**

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- shadcn/ui components
- React Router DOM
- React Query (TanStack Query)
- Zustand (State Management)
- Sonner (Toast notifications)
- Lucide React (Icons)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite Database
- Clerk Webhooks
- JWT Authentication

### Development Tools
- Vite (Frontend build tool)
- ESLint + Prettier
- Git (Version Control)

## 📁 Project Structure

```
e-commerce/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand state stores
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── package.json        # Backend dependencies
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd e-commerce
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Setup**
   
   **Frontend (.env)**
   ```env
   REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   REACT_APP_CLERK_SECRET_KEY=your_clerk_secret_key
   REACT_APP_CLERK_SIGN_IN_URL=/login
   REACT_APP_CLERK_SIGN_UP_URL=/register
   REACT_APP_CLERK_AFTER_SIGN_IN_URL=/
   REACT_APP_CLERK_AFTER_SIGN_UP_URL=/register/verify-email-address
   REACT_APP_CLERK_AFTER_SIGN_OUT_URL=/
   ```
   
   **Backend (.env)**
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db"
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   ```

5. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

6. **Start Development Servers**
   
   **Backend (Terminal 1)**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend (Terminal 2)**
   ```bash
   cd frontend
   npm run dev
   ```

## 🌐 Webhook Setup

For Clerk webhooks to work in development:

1. **Install localtunnel**
   ```bash
   npm install -g localtunnel
   ```

2. **Start tunnel**
   ```bash
   lt --port 5000
   ```

3. **Configure Clerk Dashboard**
   - Add webhook endpoint: `https://your-tunnel-url.loca.lt/webhook`
   - Select events: `user.created`, `user.updated`, `email_address.verified`

## 📱 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript
- `npm start` - Start production server

## 🔐 Authentication Flow

1. **User Registration**
   - User signs up with email/password or OAuth
   - Redirected to email verification page
   - Clerk sends verification email
   - User verifies email address

2. **User Login**
   - User can login with OAuth (Google, Facebook, Apple)
   - Or with email/password
   - Multi-factor authentication handled by Clerk
   - Session management with webhooks

3. **Profile Management**
   - User profile data synced from Clerk
   - Addresses, payment methods, preferences
   - Order history and wishlist

## 🎨 UI Components

Built with shadcn/ui components:
- **Cards** - Product displays, forms
- **Buttons** - Actions, navigation
- **Inputs** - Forms, search
- **Modals** - Login/signup overlays
- **Navigation** - Header, breadcrumbs
- **Feedback** - Toast notifications, loading states

## 🚧 Development Notes

- **State Management**: Zustand for client-side state
- **API Integration**: React Query for server state
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Clerk with custom webhook handling
- **Database**: Prisma ORM with SQLite for development

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues, please open an issue on GitHub.
