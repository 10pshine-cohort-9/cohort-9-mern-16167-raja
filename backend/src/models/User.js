const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Please provide an email address'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema);