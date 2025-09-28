# TaskSync - Collaborative Task Management App

![TaskSync Logo](https://img.shields.io/badge/TaskSync-Collaborative%20Todo-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?logo=socket.io)

A modern, full-stack collaborative task management application built with the MERN stack. TaskSync allows teams to create, organize, and track tasks in real-time with an intuitive Kanban board interface.

## Features

- 🔐 **Authentication** - JWT-based user authentication
- 📋 **Task Boards** - Create and manage project boards
- ✅ **Task Management** - Add, assign, and update tasks
- 🔄 **Real-time Updates** - Live updates using WebSockets
- 📊 **Kanban Board** - Drag-and-drop task management
- 📈 **Progress Tracking** - Visual progress indicators

## Tech Stack

### Frontend
- React.js
- React Router
- Socket.io Client
- React Beautiful DnD (drag-and-drop)
- Chart.js (progress visualization)
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io (WebSockets)
- bcryptjs (password hashing)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   - Copy `server/.env.example` to `server/.env`
   - Add your MongoDB connection string and JWT secret

3. **Start development servers:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
tasksync/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS styles
│   └── public/
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── socket/             # Socket.io handlers
│   └── utils/              # Utility functions
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create user account
- `POST /auth/login` - User login

### Boards
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get specific board

### Tasks
- `POST /api/boards/:id/tasks` - Add task to board
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## WebSocket Events

- `join-board` - Join board for real-time updates
- `task-created` - New task added
- `task-updated` - Task status/assignment changed
- `task-deleted` - Task removed

## Development

### Frontend Development
```bash
cd client
npm start
```

### Backend Development
```bash
cd server
npm run dev
```

## Environment Variables

Create `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tasksync
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.