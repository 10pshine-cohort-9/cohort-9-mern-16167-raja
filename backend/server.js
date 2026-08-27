// --- IMPORTS ---
require('dotenv').config();
const express = require('express');
const pinoHttp = require('pino-http');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const noteRoutes = require('./src/routes/noteRoutes');

// --- ENV VALIDATION ---
if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRE) {
    console.error('FATAL ERROR: JWT_SECRET or JWT_EXPIRE is missing in environment variables.');
    process.exit(1);
}

// --- APP INITIALIZATION ---
/** @type {import('express').Application} */
const app = express();

// --- MIDDLEWARE ---
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

connectDB().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Server successfully started on port ${server.address().port}`);
    });
}).catch((error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
});