process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let userToken; // We need to store the JWT to access protected routes

describe('Notes API CRUD Tests', () => {

    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        process.env.MONGO_URI = mongoServer.getUri();
        app = require('../../server');
        await mongoose.connect(process.env.MONGO_URI);
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // We only need to clear the Notes collection here, 
    // so our registered user stays logged in across tests.
    afterEach(async () => {
        await mongoose.connection.collections.notes?.deleteMany({});
    });

    // --- SETUP: Register a user to get a valid JWT ---
    beforeEach(async () => {
        // Only register if we don't already have a token
        if (!userToken) {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Note Tester',
                    email: 'notes@test.com',
                    password: 'Password123!'
                });
            userToken = res.body.token; // Save the token!
        }
    });

    // --- THE CRUD TESTS ---

    it('should prevent unauthorized access to notes (401 Error)', async () => {
        // Notice we are NOT sending the authorization header here
        const res = await request(app).get('/api/notes');
        
        expect(res.status).to.equal(401);
        expect(res.body.message).to.include('Not authorized');
    });

    it('should create a new note when authenticated', async () => {
        const newNote = {
            title: 'Test Note Title',
            content: '<p>Test content here</p>'
        };

        const res = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${userToken}`) // Attach the JWT
            .send(newNote);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('title', newNote.title);
        expect(res.body).to.have.property('content', newNote.content);
        expect(res.body).to.have.property('user'); // Should be linked to the user
    });

    it('should fetch all notes belonging to the authenticated user', async () => {
        // 1. Create a note first
        await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Fetch Me', content: 'Content' });

        // 2. Fetch all notes
        const res = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(1);
        expect(res.body[0]).to.have.property('title', 'Fetch Me');
    });

    it('should update an existing note', async () => {
        // 1. Create a note
        const createRes = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Old Title', content: 'Old Content' });

        const noteId = createRes.body._id;

        // 2. Update that specific note
        const updateRes = await request(app)
            .put(`/api/notes/${noteId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'New Title', content: 'New Content' });

        expect(updateRes.status).to.equal(200);
        expect(updateRes.body).to.have.property('title', 'New Title');
        expect(updateRes.body).to.have.property('content', 'New Content');
    });

    it('should delete an existing note', async () => {
        // 1. Create a note
        const createRes = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Delete Me', content: 'Delete Content' });

        const noteId = createRes.body._id;

        // 2. Delete it
        const deleteRes = await request(app)
            .delete(`/api/notes/${noteId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(deleteRes.status).to.equal(200);
        expect(deleteRes.body).to.have.property('message', 'Note removed successfully');

        // 3. Verify it's actually gone
        const fetchRes = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${userToken}`);
            
        expect(fetchRes.body).to.have.lengthOf(0);
    });
});