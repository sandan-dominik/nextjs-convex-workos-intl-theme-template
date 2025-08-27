# Next.js Starter with Authentication & Real-time Database

A modern, full-stack starter template built with Next.js 15, featuring authentication with WorkOS AuthKit, real-time database with Convex, and a beautiful UI with Tailwind CSS and shadcn/ui.

## 🚀 Features

- **⚡ Next.js 15** - Latest React framework with App Router
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🧩 shadcn/ui** - Beautiful, accessible UI components
- **🔐 WorkOS AuthKit** - Enterprise-grade authentication
- **⚡ Convex** - Real-time database and backend
- **🌍 Internationalization** - Multi-language support with next-intl
- **🌙 Dark Mode** - Built-in theme switching
- **📱 Responsive Design** - Mobile-first approach
- **⚡ TypeScript** - Full type safety

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: WorkOS AuthKit
- **Database**: Convex (real-time)
- **Internationalization**: next-intl
- **Theme**: next-themes
- **Package Manager**: pnpm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/sandan-dominik/nextjs-convex-workos-intl-theme-template.git
cd nextjs-convex-workos-intl-theme-template
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up WorkOS AuthKit

#### 3.1 Create WorkOS Account
1. Sign up for a free WorkOS account at [workos.com/sign-up](https://workos.com/sign-up)
2. Navigate to **Authentication** → **AuthKit** in your WorkOS Dashboard
3. Click **Set up AuthKit** to enable AuthKit in your account

#### 3.2 Configure AuthKit
1. Click **Begin setup** with **Use AuthKit's customizable hosted UI** selected / We will have a custom ui
2. Fill out the setup options (you can customize these later)
3. **Important**: Set the **Redirect URI** to `http://localhost:3000/auth/callback` for development
4. Complete the AuthKit setup

#### 3.3 Get Your Credentials
1. Copy your `WORKOS_CLIENT_ID` from the **Quick start** section
2. Navigate to **Authentication** → **Sessions** → **JWT Template**
3. Click **Manage** and add an `aud` claim with your Client ID:
   ```json
   {
     "aud": "<YOUR_CLIENT_ID>"
   }
   ```

#### 3.4 Configure CORS
1. In your WorkOS Dashboard, click **Manage** under "Cross-Origin Resource Sharing (CORS)"
2. Add `http://localhost:3000` to the allowed origins
3. Add your production domain when you deploy

### 4. Set up Convex

#### 4.1 Initialize Convex
```bash
npx convex dev --configure
```

#### 4.2 Start Convex Development Server
```bash
npx convex dev
```

This will:
- Create a `convex.json` configuration file
- Set up your Convex project
- Generate the necessary TypeScript types
- Start the development server

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory or copy `.env.example` and rename it:

```env
# WorkOS Configuration
WORKOS_API_KEY=sk_test_your_workos_api_key_here
WORKOS_CLIENT_ID=client_01your_workos_client_id_here
WORKOS_COOKIE_PASSWORD=your_secure_password_here_must_be_at_least_32_characters_long
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
```

**Important Notes:**
- Generate a secure cookie password: `openssl rand -base64 32`
- The cookie password must be at least 32 characters long
- Use `sk_test_...` for development and `sk_live_...` for production
- The `NEXT_PUBLIC_CONVEX_URL` will be provided by Convex when you run `npx convex dev`

### 6. Set up Convex Auth Configuration

The project includes a pre-configured `convex/auth.config.ts` file that sets up WorkOS AuthKit integration with Convex. This file:

- Configures JWT validation for WorkOS tokens
- Sets up the necessary providers for authentication
- Enables seamless integration between WorkOS and Convex

### 7. Run the development server

```bash
# Start both frontend and backend
pnpm dev

# Or start them separately
pnpm dev:frontend  # Next.js frontend
pnpm dev:backend   # Convex backend
```

Open [http://localhost:3000](http://localhost:3000) to view your application.

## 📁 Project Structure

```
nextjs-convex-workos-intl-theme-template/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   └── verify/
│   │   ├── (protected)/       # Protected routes
│   │   │   └── dashboard/
│   │   ├── actions/           # Server actions
│   │   │   └── auth.ts
│   │   └── api/               # API routes
│   │       └── auth/
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── common/           # Common components
│   │   └── task-example.tsx  # Example component
│   ├── convex/               # Convex functions
│   │   └── tasks.ts
│   ├── i18n/                 # Internationalization
│   ├── lib/                  # Utility functions
│   ├── provider/             # Context providers
│   └── schemas/              # Zod schemas
├── convex/                   # Convex configuration
│   ├── auth.config.ts        # Auth configuration
│   └── tasks.ts              # Example functions
├── messages/                 # Translation files
├── public/                   # Static assets
├── middleware.ts             # Next.js middleware
└── .env.example              # Environment variables template
```

## 🔐 Authentication Flow

This starter includes a complete authentication system with WorkOS AuthKit:

1. **Sign Up**: Users can create accounts with email/password
2. **Email Verification**: Required email verification flow
3. **Sign In**: Secure login with WorkOS AuthKit
4. **Protected Routes**: Automatic route protection
5. **Session Management**: Persistent sessions with secure cookies

### Authentication Routes

- `/sign-up` - User registration
- `/sign-in` - User login
- `/verify` - Email verification
- `/dashboard` - Protected dashboard

### Using Authentication in Components

```typescript
import { useAuth } from '@workos-inc/authkit-nextjs/components';

export default function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? (
    <div>Welcome, {user.firstName}!</div>
  ) : (
    <div>Please sign in</div>
  );
}
```

## 🗄️ Database (Convex)

The project uses Convex for real-time data with WorkOS authentication integration.

### Example: Task Management

```typescript
// Query all tasks (requires authentication)
const tasks = useQuery(api.tasks.getAllTasks);

// Add a new task
const addTask = useMutation(api.tasks.addTask);
await addTask({ text: "New task" });

// Complete a task
const setTaskCompleted = useMutation(api.tasks.setTaskCompleted);
await setTaskCompleted({ taskId, completed: true });
```

### Available Functions

- `getAllTasks` - Get all tasks (authenticated)
- `addTask` - Create a new task
- `setTaskCompleted` - Mark task as complete/incomplete
- `deleteTask` - Remove a task

### Using Authentication in Convex Functions

```typescript
import { query } from "./_generated/server";

export const getMyTasks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
  },
});
```

## 🎨 UI Components

Built with shadcn/ui and Tailwind CSS:

### Available Components

- Button, Input, Card
- Dropdown Menu, Popover
- Theme Toggle, Language Switcher
- Form components with validation

### Customization

1. **Themes**: Modify `src/app/globals.css`
2. **Components**: Edit files in `src/components/ui/`
3. **Colors**: Update Tailwind config

## 🌍 Internationalization

Supports multiple languages using next-intl:

### Adding New Languages

1. Create translation file in `messages/`
2. Update `src/i18n/request.ts`
3. Add language to the switcher

### Example Translation

```json
{
  "SignInPage": {
    "title": "Sign In",
    "enterCredentials": "Enter your credentials"
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
# WorkOS Production Configuration
WORKOS_API_KEY=sk_live_your_production_key
WORKOS_CLIENT_ID=client_01your_production_client_id
WORKOS_COOKIE_PASSWORD=your_secure_production_password

# Convex Production Configuration
NEXT_PUBLIC_CONVEX_URL=your_production_convex_url

# Next.js Production Configuration
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://your-domain.com/callback
```

### Configuring Production Instances

#### 1. WorkOS Production Setup
1. Create a production application in WorkOS Dashboard
2. Update CORS settings with your production domain
3. Use production API keys (`sk_live_...`)

#### 2. Convex Production Setup
1. In Convex Dashboard, switch to production deployment
2. Set `WORKOS_CLIENT_ID` to your production WorkOS Client ID
3. Run `npx convex deploy` to update the configuration

## 📝 Available Scripts

```bash
# Development
pnpm dev          # Start both frontend and backend
pnpm dev:frontend # Start Next.js development server
pnpm dev:backend  # Start Convex development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Convex
npx convex dev    # Start Convex development server
npx convex deploy # Deploy Convex functions
```

## 🔧 Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `convex.json` - Convex configuration
- `convex/auth.config.ts` - Convex authentication configuration
- `tsconfig.json` - TypeScript configuration

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Not Working**
   - Verify `WORKOS_CLIENT_ID` matches your WorkOS application
   - Check that CORS is configured correctly
   - Ensure JWT template has the correct `aud` claim

2. **Convex Functions Not Deploying**
   - Run `npx convex dev` to sync changes
   - Check environment variables in Convex dashboard
   - Verify `convex/auth.config.ts` is properly configured

3. **Environment Variables Issues**
   - Ensure all variables are set in `.env.local`
   - Check that production variables are set in your hosting platform
   - Verify variable names match exactly

### Debugging Authentication

If users can log in but `useConvexAuth()` returns `isAuthenticated: false`:

1. Check your `convex/auth.config.ts` configuration
2. Verify `WORKOS_CLIENT_ID` in Convex environment
3. Ensure JWT template includes the `aud` claim
4. Run `npx convex dev` to sync configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review [WorkOS AuthKit documentation](https://workos.com/docs/authkit)
3. Check [Convex documentation](https://docs.convex.dev/)
4. Open an issue in this repository

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [WorkOS](https://workos.com/) for enterprise-grade authentication
- [Convex](https://convex.dev/) for the real-time database
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the styling system

## 📚 Additional Resources

- [WorkOS AuthKit + Convex Integration Guide](https://docs.convex.dev/auth/authkit#nextjs)
- [Convex Documentation](https://docs.convex.dev/)
- [WorkOS AuthKit Documentation](https://workos.com/docs/authkit)
- [Next.js Documentation](https://nextjs.org/docs)