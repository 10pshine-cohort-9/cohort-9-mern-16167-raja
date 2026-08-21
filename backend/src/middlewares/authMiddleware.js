const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select('-password');
            
            next();
        } catch (error) {
            const err = new Error('Not authorized, token failed');
            err.statusCode = 401;
            next(err);
        }
    }

    if (!token) {
        const error = new Error('Not authorized, no token');
        error.statusCode = 401;
        next(error);
    }
};

module.exports = { protect };