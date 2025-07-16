require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // ✅ נדרש בשביל Socket.IO
const { Server } = require('socket.io'); // ✅ ייבוא socket.io

// יצוא ראוטים
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const messageRoutes = require('./routes/messageRoutes');
 

const app = express();
const server = http.createServer(app); // ❗ זה מחליף את app.listen
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 📡 Socket.IO events
io.on('connection', (socket) => {
  console.log('🟢 New socket connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`📥 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', (data) => {
    const { roomId, message } = data;
    socket.to(roomId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

app.use(express.json());
app.use(cors());

// 🌐 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// 🌍 Routes
app.get('/', (req, res) => {
  res.send('Welcome to QuickFix API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes); 

// 🚀 Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});
