# ConceptAI: Intelligent Concept Mapping with LLM Integration

An interactive knowledge visualization tool that merges graph-based concept mapping with LLM-powered learning assistance.

![ConceptAI](https://i.imgur.com/4FyIXax.png)

## Overview

ConceptAI helps you build and visualize conceptual knowledge networks while leveraging AI to deepen your understanding. The application combines interactive graph visualization with natural language processing to create a powerful learning tool.

## Key Features

### 📊 Visual Concept Mapping

- **Interactive Graph Visualization**: Build and manipulate knowledge networks using a dynamic, force-directed graph layout
- **Automatic Layout**: Concepts are automatically arranged in a logical, hierarchical structure
- **Light/Dark Mode**: Comfortable viewing in any environment

### 🧠 LLM-Powered Learning

- **AI-Assisted Exploration**: Ask questions about concepts and get intelligent responses
- **Contextual Understanding**: The system understands the relationships between concepts
- **Concept Generation**: Get suggestions for related concepts to expand your knowledge network

### 🔄 Real-time Interaction

- **Dynamic Graph Updates**: See your knowledge network grow in real-time as you learn
- **Bidirectional Learning**: Ask questions about the graph or build the graph through conversations

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Graph Visualization**: XYFlow/ReactFlow
- **Language Models**: Groq API Integration
- **Layout Algorithm**: Dagre for hierarchical graph layouts

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env` and add your Groq API key)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication and Database Setup

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

3. Update your `.env` file with your database connection string:

   ```
   DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/conceptai?schema=public"
   ```

4. Run database migrations to create tables:
   ```bash
   npx prisma migrate dev --name init
   ```

### OAuth Configuration

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
   - Copy the Client ID and Client Secret to your `.env` file

2. GitHub OAuth Setup:

   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click on "New OAuth App"
   - Fill in the application details
   - Set the Authorization callback URL to:
     - `http://localhost:3000/api/auth/callback/github` (for development)
     - `https://your-production-domain.com/api/auth/callback/github` (for production)
   - Copy the Client ID and Client Secret to your `.env` file

3. Generate a NextAuth Secret:
   ```bash
   openssl rand -base64 32
   ```
   - Add this as `NEXTAUTH_SECRET` in your `.env` file

## Running the Project

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

3. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Start by asking a question in the chat panel
2. Explore the generated concepts in the graph view
3. Click on nodes to see more information about each concept
4. Continue the conversation to expand your knowledge network

## Future Enhancements

- Export/import of knowledge graphs
- Collaborative concept mapping
- Integration with additional learning resources
- Mobile-optimized interface

## License

[MIT](LICENSE)
