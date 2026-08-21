const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            const error = new Error('User already exists');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.create({
            name,
            email: normalizedEmail,
            password
        }).catch((err) => {
            if (err.code === 11000) {
                const duplicateError = new Error('User already exists');
                duplicateError.statusCode = 400;
                throw duplicateError;
            }
            throw err;
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser
};