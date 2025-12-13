# DevDesk

DevDesk is an open-source, developer-focused ticketing and DevOps automation tool designed for small to mid-sized dev teams.

## Features

- 🎫 **Ticket Management**: Create, track, and manage development tickets
- 📁 **Project Organization**: Organize tickets by projects
- 💬 **Comments & Collaboration**: Add comments and track ticket activity
- 👥 **User Profiles**: Manage user profiles and roles
- 🔐 **Authentication**: Secure login with email/password or GitHub OAuth
- 🐙 **GitHub Integration**: Link repositories and sync with GitHub issues
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rohitd3v/DevDesk.git
   cd DevDesk
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Supabase and GitHub credentials
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + GitHub OAuth
- **GitHub Integration**: Octokit REST API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
