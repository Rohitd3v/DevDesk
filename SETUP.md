# DevDesk Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- GitHub account (for OAuth integration)

## 1. Database Setup (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and anon key
3. Run the SQL migration in Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of backend/migrations/001_github_integration.sql
   ```

## 2. GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: DevDesk Local
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://localhost:3000/api/v1/auth/github/callback`
4. Save the Client ID and Client Secret

## 3. Backend Configuration

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Edit `backend/.env` with your actual values:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   SESSION_SECRET=your-unique-session-secret
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

## 4. Frontend Configuration

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

4. The default values in `.env.local` should work for local development

5. Start the frontend server:
   ```bash
   npm run dev
   ```

## 5. Access the Application

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## 6. Test the Setup

1. Open http://localhost:3001
2. Try creating an account or logging in
3. Test GitHub OAuth by clicking "Continue with GitHub"
4. Create a project and try linking a GitHub repository

## Environment Variables Reference

### Backend (.env)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon/public key
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
- `SESSION_SECRET`: Random string for session encryption
- `PORT`: Backend server port (default: 3000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3001)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3000/api/v1)
- `NEXT_PUBLIC_BACKEND_URL`: Backend base URL (default: http://localhost:3000)

## Troubleshooting

### Common Issues

1. **GitHub OAuth not working**
   - Check that your callback URL is exactly: `http://localhost:3000/api/v1/auth/github/callback`
   - Verify your GitHub Client ID and Secret are correct

2. **Database connection issues**
   - Verify your Supabase URL and key are correct
   - Make sure you've run the database migration

3. **CORS errors**
   - Check that `FRONTEND_URL` in backend .env matches your frontend URL

4. **Session issues**
   - Make sure `SESSION_SECRET` is set and is a long, random string

### Getting Help

If you encounter issues:
1. Check the browser console for frontend errors
2. Check the backend terminal for server errors
3. Verify all environment variables are set correctly
4. Make sure both servers are running on the correct ports