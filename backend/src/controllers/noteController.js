const Note = require('../models/Note');

const getNotes = async (req, res, next) => {
    try {
        const notes = await Note.find({ user: req.user._id });
        res.status(200).json(notes);
    } catch (error) {
        next(error);
    }
};

const createNote = async (req, res, next) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            const error = new Error('Please provide both title and content');
            error.statusCode = 400;
            throw error;
        }

        const note = await Note.create({
            user: req.user._id,
            title,
            content
        });

        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

const updateNote = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            const error = new Error('Note not found');
            error.statusCode = 404;
            throw error;
        }

        if (note.user.toString() !== req.user._id.toString()) {
            const error = new Error('Not authorized to modify this note');
            error.statusCode = 401;
            throw error;
        }

        note.title = title || note.title;
        note.content = content || note.content;
        
        const updatedNote = await note.save();
        res.status(200).json(updatedNote);
    } catch (error) {
        next(error);
    }
};

const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            const error = new Error('Note not found');
            error.statusCode = 404;
            throw error;
        }

        if (note.user.toString() !== req.user._id.toString()) {
            const error = new Error('Not authorized to delete this note');
            error.statusCode = 401;
            throw error;
        }

        await note.deleteOne();
        res.status(200).json({ message: 'Note removed successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote
};