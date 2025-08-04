# QuickFix 🛠️

QuickFix is an on-demand service platform connecting clients with local service providers in real time.

## 📦 Features

- ✅ User registration and login (client & provider)
- 📄 Client can request services from a catalog
- 🔎 Providers receive real-time matching requests
- 💬 Built-in chat between client and provider (with typing status)
- ⭐ Clients can rate providers after job completion
- 🟢 Providers can toggle online/offline status

## 🔐 Tech Stack

- **Frontend**: React, React Router, Axios, Toastify
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Real-Time**: Socket.IO
- **Auth**: JWT with middleware protection

## 🚀 To Run Locally

```bash
# Backend
cd backend
npm install
node server.js

# Frontend
cd client
npm install
npm start
