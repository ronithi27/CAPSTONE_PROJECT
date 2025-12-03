# PINGUP - Social Networking Application

A modern full-stack social networking web application built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB. PINGUP allows users to connect with others, share posts and stories, and communicate through real-time messages.

---

## 🌟 Features

- **Authentication** - Secure login/signup with Clerk (Google Sign-In)
- **User Profiles** - Customizable profiles with profile pictures, cover photos, and bio
- **Posts** - Create, like, comment, and share posts with image support
- **Stories** - Share 24-hour stories with text, images, or videos
- **Messaging** - Real-time chat with other users
- **Connections** - Follow/unfollow users, view followers and following
- **Discover** - Find and connect with new users
- **Notifications** - Get notified about likes, comments, follows, and messages
- **Image Uploads** - Cloudinary integration for media storage

---

## 📁 Project Structure

```
PINGUP/
├── client/                 # React Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # API layer (axios, endpoints)
│   │   │   ├── axios.js    # Axios instance with interceptors
│   │   │   └── index.js    # API endpoint functions
│   │   ├── asset/          # Images, icons, and dummy data
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Loading.jsx
│   │   │   ├── MenuItems.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── StoriesBar.jsx
│   │   │   ├── StoryModel.jsx
│   │   │   ├── StoryViewer.jsx
│   │   │   ├── UserCard.jsx
│   │   │   ├── RecentMessages.jsx
│   │   │   └── ...
│   │   ├── context/        # React Context for global state
│   │   │   └── AppContext.jsx
│   │   ├── pages/          # Page components (routes)
│   │   │   ├── Login.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── ChatBox.jsx
│   │   │   ├── Connections.jsx
│   │   │   ├── Discover.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── CreatePost.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # Node.js Backend
    ├── configs/
    │   ├── db.js           # MongoDB connection
    │   └── cloudinary.js   # Cloudinary configuration
    ├── controllers/        # Route handlers
    │   ├── userController.js
    │   ├── postController.js
    │   ├── storyController.js
    │   ├── messageController.js
    │   ├── connectionController.js
    │   └── notificationController.js
    ├── middlewares/
    │   ├── authMiddleware.js
    │   └── uploadMiddleware.js
    ├── models/             # Mongoose schemas
    │   ├── User.js
    │   ├── Post.js
    │   ├── Story.js
    │   ├── Message.js
    │   └── Notification.js
    ├── routes/             # API routes
    ├── server.js           # Entry point
    ├── package.json
    └── .env
```

---

## 🛠 Tech Stack

### Frontend

| Technology           | Purpose                         |
| -------------------- | ------------------------------- |
| **React 19**         | UI Library                      |
| **Vite 7**           | Build tool & dev server         |
| **Tailwind CSS 4**   | Utility-first CSS framework     |
| **React Router DOM** | Client-side routing             |
| **Clerk**            | Authentication (Google Sign-In) |
| **Axios**            | HTTP client                     |
| **Lucide React**     | Icon library                    |
| **React Hot Toast**  | Toast notifications             |
| **Moment.js**        | Date formatting                 |

### Backend

| Technology     | Purpose               |
| -------------- | --------------------- |
| **Node.js**    | Runtime environment   |
| **Express.js** | Web framework         |
| **MongoDB**    | Database              |
| **Mongoose**   | ODM for MongoDB       |
| **Cloudinary** | Image/video storage   |
| **Multer**     | File upload handling  |
| **dotenv**     | Environment variables |

---

## 🔐 Authentication Flow

The app uses **Clerk** for authentication:

```jsx
// App.jsx - Conditional rendering based on auth state
const { user } = useUser();

<Route path='/' element={ !user ? <Login/> : <Layout/> }>
```

- **Not logged in** → Shows `Login` page with Clerk's `<SignIn />` component
- **Logged in** → Shows `Layout` with nested routes
- **User sync** → On first login, user data is synced to MongoDB

---

## 🗺 Routing Structure

```
/                   → Feed (Home page) - requires auth
/messages           → Messages list
/messages/:userId   → Individual chat (ChatBox)
/connections        → User connections (followers/following)
/discover           → Discover new users
/profile            → Current user profile
/profile/:profileId → Other user's profile
/create-post        → Create new post
```

---

## � API Endpoints

### Users

| Method | Endpoint                     | Description            |
| ------ | ---------------------------- | ---------------------- |
| POST   | `/api/users/sync`            | Sync user from Clerk   |
| GET    | `/api/users/me`              | Get current user       |
| GET    | `/api/users/profile/:userId` | Get user profile       |
| PUT    | `/api/users/profile`         | Update profile         |
| PUT    | `/api/users/profile/picture` | Update profile picture |
| PUT    | `/api/users/profile/cover`   | Update cover photo     |
| GET    | `/api/users/suggestions`     | Get user suggestions   |
| GET    | `/api/users/search`          | Search users           |

### Posts

| Method | Endpoint                     | Description      |
| ------ | ---------------------------- | ---------------- |
| POST   | `/api/posts`                 | Create post      |
| GET    | `/api/posts/feed`            | Get feed posts   |
| GET    | `/api/posts/all`             | Get all posts    |
| GET    | `/api/posts/:postId`         | Get single post  |
| POST   | `/api/posts/:postId/like`    | Like/unlike post |
| POST   | `/api/posts/:postId/comment` | Add comment      |
| DELETE | `/api/posts/:postId`         | Delete post      |

### Stories

| Method | Endpoint                | Description      |
| ------ | ----------------------- | ---------------- |
| POST   | `/api/stories`          | Create story     |
| GET    | `/api/stories`          | Get stories feed |
| DELETE | `/api/stories/:storyId` | Delete story     |

### Messages

| Method | Endpoint                     | Description       |
| ------ | ---------------------------- | ----------------- |
| GET    | `/api/messages`              | Get conversations |
| GET    | `/api/messages/:userId`      | Get conversation  |
| POST   | `/api/messages/:userId`      | Send message      |
| PUT    | `/api/messages/:userId/read` | Mark as read      |

### Connections

| Method | Endpoint                             | Description         |
| ------ | ------------------------------------ | ------------------- |
| POST   | `/api/connections/follow/:userId`    | Follow user         |
| POST   | `/api/connections/unfollow/:userId`  | Unfollow user       |
| GET    | `/api/connections/followers/:userId` | Get followers       |
| GET    | `/api/connections/following/:userId` | Get following       |
| GET    | `/api/connections/status/:userId`    | Check follow status |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Clerk account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pingup.git
cd pingup

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

**Backend (`server/.env`):**

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/pingup
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (`client/.env`):**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_API_URL=http://localhost:4000/api
```

### Running the Application

```bash
# Terminal 1 - Start backend
cd server
npm run server

# Terminal 2 - Start frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

---

## 📝 Available Scripts

### Frontend

| Command           | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start development server (localhost:5173) |
| `npm run build`   | Build for production                      |
| `npm run preview` | Preview production build                  |
| `npm run lint`    | Run ESLint                                |

### Backend

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `npm run server` | Start with nodemon (auto-reload) |
| `npm start`      | Start production server          |

---

## 🔄 Component Hierarchy

```
App
├── Login (when not authenticated)
│   └── SignIn (Clerk)
│
└── Layout (when authenticated)
    ├── Sidebar
    │   ├── Logo
    │   ├── MenuItems
    │   ├── Create Post Button
    │   └── User Info (from AppContext)
    │
    └── Outlet (renders current route)
        ├── Feed
        │   ├── StoriesBar
        │   │   ├── Create Story
        │   │   └── Story Cards
        │   ├── PostCard (×n)
        │   └── RecentMessages
        ├── Messages
        │   └── User List
        ├── ChatBox
        │   └── Message Bubbles
        ├── Connections
        │   └── UserCard (×n)
        ├── Discover
        │   └── UserCard (×n)
        ├── Profile
        │   ├── Cover Photo
        │   ├── Profile Info
        │   └── User Posts
        └── CreatePost
```

---

## 🎨 Key Features Implementation

### Post Card

- Like/unlike with optimistic updates
- Share functionality (native share or clipboard)
- Delete option for post owner (3-dot menu)
- Hashtag highlighting

### Story Feature

- Create text/image/video stories
- Auto-progress timer (10 seconds)
- Delete option for story owner
- Background color selection for text stories

### Messaging

- Real-time conversations
- Message alignment (sent = right, received = left)
- Image sharing support
- Unread message indicators

### Follow/Unfollow

- Instant UI feedback
- Follow status check on component mount
- Button changes: "Follow" ↔ "Unfollow"

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React + Node.js + MongoDB**
