const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketHandler = require('./sockets/socketHandler');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
// console.log('Server Starting ....');

connectDB();
// console.log('Database connection initiated.');

const app = express();
app.use(cors());
// console.log('CORS middleware applied.');

app.use(express.json());
// console.log('JSON middleware applied.');

app.use('/api/auth', authRoutes);
// console.log('Auth routes initialized.');

const server = http.createServer(app);
// console.log('HTTP server created.');

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
// console.log('Socket.IO server initialized.');

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socketHandler(io, socket);
});

const PORT = process.env.PORT || 5003;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));