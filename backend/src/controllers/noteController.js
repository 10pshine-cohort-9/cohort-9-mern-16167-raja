const Note = require('../models/Note');

/** @type {import('express').RequestHandler} */
const getNotes = async (req, res, next) => {
    try {
        // FIX: Added .sort({ createdAt: -1 }) to fetch newest notes first
        const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        next(error);
    }
};

/** @type {import('express').RequestHandler} */
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

        // NEW: Broadcast creation to the user's private room
        req.io.to(req.user._id.toString()).emit('noteCreated', note);

        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

/** @type {import('express').RequestHandler} */
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

        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
        
        const updatedNote = await note.save();

        // NEW: Broadcast update to the user's private room
        req.io.to(req.user._id.toString()).emit('noteUpdated', updatedNote);

        res.status(200).json(updatedNote);
    } catch (error) {
        next(error);
    }
};

/** @type {import('express').RequestHandler} */
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

        // NEW: Broadcast deletion to the user's private room
        req.io.to(req.user._id.toString()).emit('noteDeleted', req.params.id);

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