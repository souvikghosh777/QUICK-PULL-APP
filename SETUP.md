# TaskSync Setup Guide

## Prerequisites

Before setting up TaskSync, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd tasksync

# Install all dependencies (root, client, and server)
npm run install-all
```

### 2. Set up MongoDB

**Option A: Local MongoDB**
- Start MongoDB on your system
- The default connection string `mongodb://localhost:27017/tasksync` should work

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a new cluster
- Get your connection string
- Update the `MONGODB_URI` in `server/.env`

### 3. Configure Environment Variables

The server already has a `.env` file set up. Update if needed:

```bash
# In server/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tasksync
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. Start the Development Servers

```bash
# Start both client and server concurrently
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Individual Server Commands

If you prefer to run servers separately:

```bash
# Start only the backend server
npm run server

# Start only the frontend client
npm run client
```

## Project Structure Overview

```
tasksync/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React contexts
│   │   └── utils/          # Utility functions
│   └── public/
├── server/                 # Node.js backend
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── socket/             # Socket.io handlers
│   └── utils/              # Utility functions
└── package.json            # Root package.json
```

## Testing the Application

1. **Open your browser** to http://localhost:3000
2. **Create an account** using the signup form
3. **Create a board** for your project
4. **Add tasks** and start collaborating!

## Features to Test

### Authentication
- ✅ Sign up with name, email, and password
- ✅ Log in with existing credentials
- ✅ JWT token management

### Board Management
- ✅ Create new boards
- ✅ View all your boards
- ✅ Board statistics and progress

### Task Management
- ✅ Create tasks with title, description, priority
- ✅ Drag and drop tasks between columns
- ✅ Update task status and details
- ✅ Add comments to tasks
- ✅ Set due dates and priorities

### Real-time Features
- ✅ Live task updates
- ✅ Real-time collaboration indicators
- ✅ WebSocket connection status

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Make sure MongoDB is running
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

**2. Port Already in Use**
```bash
# If port 3000 or 5000 is occupied, update the ports:
# For frontend: Update package.json scripts
# For backend: Update PORT in server/.env
```

**3. WebSocket Connection Issues**
- Check if both servers are running
- Verify no firewall is blocking the connections
- Check browser console for errors

**4. JWT Token Issues**
- Clear browser localStorage
- Make sure JWT_SECRET is set in server/.env
- Check browser dev tools → Application → Local Storage

### Development Tips

**Hot Reloading**
- Frontend automatically reloads on changes
- Backend uses nodemon for auto-restart

**Database GUI**
- Use MongoDB Compass for visual database management
- Connection string: `mongodb://localhost:27017`

**API Testing**
- Backend provides health check: http://localhost:5000/health
- Use Postman or similar tools for API testing

## Production Deployment

### Environment Variables
Update the following for production:
```bash
NODE_ENV=production
JWT_SECRET=use-a-strong-random-secret
MONGODB_URI=your-production-mongodb-url
```

### Build for Production
```bash
# Build the React app
cd client
npm run build

# The build files will be in client/build/
```

## Next Steps

1. **Customize the UI** - Update colors, branding in Tailwind config
2. **Add Features** - File uploads, notifications, user profiles
3. **Deploy** - Use services like Heroku, Vercel, or Netlify
4. **Scale** - Add Redis for session management, load balancing

## Support

If you encounter any issues:
1. Check the console logs (browser and terminal)
2. Ensure all dependencies are installed correctly
3. Verify environment variables are set properly
4. Make sure MongoDB is running

Happy coding with TaskSync! 🚀