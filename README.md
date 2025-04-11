# ConceptAI: Intelligent Concept Mapping with LLM Integration

An interactive knowledge visualization tool that merges graph-based concept mapping with LLM-powered learning assistance.

![ConceptAI](/public/dark_mockup.png)

## Overview

ConceptAI helps you build and visualize conceptual knowledge networks while leveraging AI to deepen your understanding. The application combines interactive graph visualization with natural language processing to create a powerful learning tool that adapts to your learning journey.

## Key Features

### 📊 Visual Concept Mapping

- **Interactive Graph Visualization**: Build and manipulate knowledge networks using XYFlow's dynamic, force-directed graph layout
- **Automatic Layout**: Concepts are automatically arranged in a logical structure that visualizes relationships
- **Responsive Design**: Fully responsive interface that works on both desktop and mobile devices
- **Light/Dark Mode**: Comfortable viewing in any environment with automatic theme detection

### 🧠 LLM-Powered Learning

- **AI-Assisted Exploration**: Ask questions about concepts and get intelligent responses from Llama 4 Scout via Groq API
- **Contextual Understanding**: The system understands the relationships between concepts and builds on previous conversations
- **Knowledge Graph Construction**: AI automatically extracts and visualizes relationships between concepts as you learn
- **Markdown Support**: Rich text formatting in AI responses with support for code blocks and tables

### 🔄 Real-time Interaction

- **Dynamic Graph Updates**: See your knowledge network grow in real-time as you learn and explore concepts
- **Bidirectional Learning**: Ask questions about the graph or build the graph through conversations
- **Resizable Panels**: Customize your workspace with collapsible and resizable chat and graph panels
- **Mobile-First Design**: Seamless experience on both desktop and mobile devices

### 🔒 User Management

- **OAuth Authentication**: Secure login via Google, GitHub, or email/password
- **Guest Access**: Use the application without logging in with rate-limited access
- **Rate Limiting**: Advanced rate limiting for both authenticated users and guests
- **Session Management**: Persistent sessions with chat history management

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **UI/UX**: React Resizable Panels, React Markdown, Framer Motion
- **Graph Visualization**: XYFlow/ReactFlow with Dagre layout algorithm
- **Language Models**: Llama 4 Scout via Groq API
- **Authentication**: NextAuth.js with Prisma adapter
- **Database**: PostgreSQL with Prisma ORM
- **Rate Limiting**: Upstash Redis for API rate limiting
- **Deployment**: Vercel (recommended)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env.local`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/conceptai?schema=public"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# API Keys
GROQ_API_KEY="your-groq-api-key"

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

## Database Setup

### PostgreSQL Setup

1. Install PostgreSQL if you don't have it already:

   - For Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib`
   - For macOS with Homebrew: `brew install postgresql`
   - For Windows: Download from [PostgreSQL website](https://www.postgresql.org/download/windows/)

2. Create a new database:

   ```bash
   # Login to PostgreSQL
   sudo -u postgres psql

   # Create a new database
   CREATE DATABASE conceptai;

   # Create a user with password
   CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword';

   # Grant privileges to the user
   GRANT ALL PRIVILEGES ON DATABASE conceptai TO myuser;

   # Exit PostgreSQL
   \q
   ```

3. Update your `.env.local` file with your database connection string:

   ```
   DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/conceptai?schema=public"
   ```

4. Initialize the database with Prisma:
   ```bash
   npx prisma migrate dev
   ```

## OAuth Configuration

### Setting up OAuth Providers

1. Google OAuth Setup:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Configure the consent screen if needed
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-production-domain.com/api/auth/callback/google` (for production)
   - Copy the Client ID and Client Secret to your `.env.local` file

2. GitHub OAuth Setup:

   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click on "New OAuth App"
   - Fill in the application details
   - Set the Authorization callback URL to:
     - `http://localhost:3000/api/auth/callback/github` (for development)
     - `https://your-production-domain.com/api/auth/callback/github` (for production)
   - Copy the Client ID and Client Secret to your `.env.local` file

3. Generate a NextAuth Secret:
   ```bash
   openssl rand -base64 32
   ```
   - Add this as `NEXTAUTH_SECRET` in your `.env.local` file

## Running the Project

1. Install dependencies:

   ```bash
   npm install
   ```

2. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
4. For production builds:
   ```bash
   npm run build
   npm start
   ```

## Usage Guide

1. **Getting Started**:
   - Sign in or continue as a guest
   - Start by asking a question in the chat panel (e.g., "Explain the concept of machine learning")
2. **Exploring Concepts**:
   - As you chat, the AI will extract key concepts and visualize them in the graph panel
   - Concepts are connected based on their relationships (prerequisite, hierarchy, etc.)
3. **Interacting with the Graph**:
   - Click on nodes to focus on specific concepts
   - Drag nodes to rearrange the graph
   - Use the controls to zoom in/out and fit the view
4. **Customizing Your Experience**:
   - Resize panels by dragging the divider
   - Collapse either panel to focus on chat or graph
   - Toggle between light and dark mode
   - On mobile, switch between chat and graph views

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Graph visualization powered by [XYFlow](https://xyflow.com/)
- LLM capabilities provided by [Groq](https://groq.com/)
