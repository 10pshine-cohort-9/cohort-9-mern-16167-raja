const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** @type {import('express').RequestHandler} */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                const error = new Error('Not authorized, user not found');
                error.statusCode = 401;
                throw error;
            }

            req.user = user;
            return next();
        } catch (error) {
            const err = new Error('Not authorized, token failed');
            err.statusCode = 401;
            return next(err);
        }
    }

    if (!token) {
        const error = new Error('Not authorized, no token');
        error.statusCode = 401;
        return next(error);
    }
};

module.exports = { protect };