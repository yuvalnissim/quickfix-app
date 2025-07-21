require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ הפצה של io לשימוש בקבצים אחרים
module.exports.io = io;

// ✅ ניהול מפת משתמשים מחוברים
const userSocketMap = {};

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`📥 ${socket.id} joined room ${roomId}`);

    // אם זה userId (ולא requestId), נשמור מיפוי
    if (!roomId.includes('-')) {
      userSocketMap[roomId] = socket.id;
    }
  });

  socket.on('sendMessage', ({ roomId, message }) => {
    socket.to(roomId).emit('receiveMessage', message);

    // התראה ישירה למשתמש אם מחובר
    const targetSocket = userSocketMap[message.receiverId];
    if (targetSocket) {
      io.to(targetSocket).emit('receiveMessage', message);
    }
  });

  socket.on('typing', ({ roomId, senderId }) => {
    socket.to(roomId).emit('userTyping', { senderId });
  });

  socket.on('stopTyping', ({ roomId, senderId }) => {
    socket.to(roomId).emit('userStopTyping', { senderId });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);

    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

app.use(express.json());
app.use(cors());

// ✅ חיבור למסד נתונים
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

app.get('/', (req, res) => {
  res.send('Welcome to QuickFix API!');
});

// ✅ רישום כל הראוטים
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});
