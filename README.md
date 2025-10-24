# 🎟️ Event Management Backend

A **scalable backend system** for managing events — built with **Node.js**, **Express**, and **MongoDB**.  
Includes **user authentication (JWT)**, **role-based access control** (Admin / Organizer / User), and **event registration with seat-locking**.

> 🚀 *Redis-based caching & queues have been removed in this version for simplicity.*

---

## 📁 Project Structure

```
event-management-backend/
├── src/
│   ├── config/           # DB connection, configs
│   ├── controllers/      # Business logic
│   ├── middlewares/      # Auth, RBAC, error handling
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── services/         # Background queue (stubbed)
│   └── utils/            # Logger, helpers
├── .env                  # Environment variables (ignored by Git)
├── .gitignore
├── package.json
└── server.js             # Entry point
```

---

## 🧰 Tech Stack

- **Node.js + Express.js**
- **MongoDB** (Mongoose ODM)
- **JWT Authentication**
- **Bcrypt** (Password hashing)
- **Helmet + Rate Limiter** (Security)
- **Pino Logger**

> ⚠️ Redis-based caching & queues have been **removed in this version**.

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/event-management-backend.git
cd event-management-backend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Create a `.env` File
Copy from `.env.example` and add your credentials:

```env
PORT=4000
MONGO_URI=mongodb+srv://<your-db-user>:<your-password>@cluster0.mongodb.net/
JWT_SECRET=secretkey......
```

### 4️⃣ Start the Server
```bash
npm run dev
```

Server runs at 👉 **http://localhost:4000**

---

## 🔐 Authentication & Roles

| Role | Description |
|------|--------------|
| **Admin** | Full access to all events |
| **Organizer** | Can create, edit, and delete their own events |
| **User** | Can browse, register, or unregister for events |

---

## 🧩 API Endpoints

### 🔸 Auth Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/api/auth/signup` | Register a new user |
| **POST** | `/api/auth/login` | Login and get JWT token |

**Signup Body Example:**
```json
{
  "name": "Rahul",
  "email": "rahul@gmail.com",
  "password": "rahul123",
  "role": "organizer"
}
```

---

### 🔸 Event Routes
| Method | Endpoint | Description | Role |
|--------|-----------|-------------|------|
| **GET** | `/api/events` | List all events (with search, filter, sort) | Public |
| **GET** | `/api/events/:id` | Get single event details | Public |
| **POST** | `/api/events` | Create new event | Admin / Organizer |
| **PUT** | `/api/events/:id` | Edit event | Admin / Organizer |
| **DELETE** | `/api/events/:id` | Delete event | Admin / Organizer |
| **POST** | `/api/events/:id/register` | Register for event | Authenticated |
| **POST** | `/api/events/:id/unregister` | Cancel registration | Authenticated |

---

### 🔸 Analytics Routes
| Method | Endpoint | Description | Role |
|--------|-----------|-------------|------|
| **GET** | `/api/analytics` | Get stats (total users, events, popular events) | Admin |

---

## 🧾 Example Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "671cd...",
    "name": "Rahul",
    "email": "rahul@gmail.com",
    "role": "admin"
  }
}
```

---

## 🛡️ Security Features

- ✅ JWT Authentication  
- ✅ Role-based Access Control (RBAC)  
- ✅ Password Hashing with **bcrypt**  
- ✅ Rate Limiting (100 requests/hour)  
- ✅ **Helmet** for secure HTTP headers  
- ✅ Centralized Error Handling  

---

## 🧠 Seat Locking (Anti-Overbooking)

Each registration uses an **atomic MongoDB update**:

```js
findOneAndUpdate(
  { _id: eventId, seatsLeft: { $gt: 0 } },
  { $inc: { seatsLeft: -1 } }
);
```

✅ Prevents multiple users from overbooking the same seat.

---

## 🧩 Example `.gitignore`

```
node_modules/
.env
logs/
.vscode/
.DS_Store
```

---

### 💫 Author
**Rahul Kumar**  
Full Stack Developer (MERN) | Passionate about scalable backend systems 🚀  
