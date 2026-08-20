require('dotenv').config();
const express = require('express');
const pinoHttp = require('pino-http');

const app = express();

app.use(express.json()); 
app.use(pinoHttp()); 

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Notes API is fully operational'
    });
});

app.use((err, req, res, next) => {
    req.log.error(err);
    
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server successfully started on port ${PORT}`);
});