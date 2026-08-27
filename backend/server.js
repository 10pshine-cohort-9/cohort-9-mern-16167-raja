// --- IMPORTS ---
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // <-- NEW: Added JWT import
const pinoHttp = require('pino-http');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const noteRoutes = require('./src/routes/noteRoutes');

// --- ENV VALIDATION ---
if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRE) {
    console.error('FATAL ERROR: JWT_SECRET or JWT_EXPIRE is missing in environment variables.');
    process.exit(1);
}

// --- APP & SERVER INITIALIZATION ---
/** @type {import('express').Application} */
const app = express();
const server = http.createServer(app);

// --- SOCKET.IO CONFIGURATION ---
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// NEW: Authenticate Socket.IO connections before allowing them to join a room
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error('Authentication error: Missing token'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Attach the decoded payload
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
});

io.on('connection', (socket) => {
    // SECURE: Join room using the verified token ID, ignoring client-supplied data
    if (socket.user && socket.user.id) {
        socket.join(socket.user.id.toString());
        socket.emit('connected');
    }

    socket.on('disconnect', () => {
        // Disconnection handled automatically
    });
});

// --- MIDDLEWARE ---
// Inject Socket.IO instance into req object
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(pinoHttp());
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Notes API is fully operational'
    });
});

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
    if (req.log) {
        req.log.error(err);
    } else {
        console.error(err);
    }

    if (res.headersSent) {
        return next(err);
    }

    let statusCode = parseInt(err.statusCode || err.status, 10);
    if (isNaN(statusCode) || statusCode < 400 || statusCode > 599) {
        statusCode = 500;
    }

    const message = statusCode >= 500 
        ? 'Internal Server Error' 
        : (err.message || 'Request failed');

    res.status(statusCode).json({
        status: 'error',
        message: message
    });
});

// --- SERVER STARTUP ---
let PORT = parseInt(process.env.PORT, 10);
if (isNaN(PORT) || PORT < 0 || PORT > 65535) {
    PORT = 5000;
}

// 1. NEW: Wrap the database connection in this IF statement so it doesn't run during tests
if (process.env.NODE_ENV !== 'test') {
    connectDB().then(() => {
        server.listen(PORT, () => {
            console.log(`Server successfully started on port ${server.address().port}`);
        });
    }).catch((error) => {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    });
}

// 2. NEW: Export the app so Supertest can interact with it
module.exports = app;