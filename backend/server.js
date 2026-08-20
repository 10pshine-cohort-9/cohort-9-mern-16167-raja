require('dotenv').config();
const express = require('express');
const pinoHttp = require('pino-http');
const connectDB = require('./src/config/db');

const app = express();

app.use(pinoHttp());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Notes API is fully operational'
    });
});

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

let PORT = parseInt(process.env.PORT, 10);
if (isNaN(PORT) || PORT < 0 || PORT > 65535) {
    PORT = 5000;
}

connectDB(); 

const server = app.listen(PORT, () => {
    console.log(`Server successfully started on port ${server.address().port}`);
});