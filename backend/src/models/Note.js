const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User' 
        },
        title: {
            type: String,
            required: [true, 'Please add a note title'],
            trim: true,
            maxlength: [150, 'Title cannot exceed 150 characters']
        },
        content: {
            type: String,
            required: [true, 'Please add some content to your note'] 
        }
    },
    {
        timestamps: true 
    }
);

module.exports = mongoose.model('Note', noteSchema);