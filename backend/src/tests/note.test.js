process.env.NODE_ENV = 'test';
const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let userToken;

describe('Notes API CRUD Tests', () => {
    before(async () => {
        try {
            mongoServer = await MongoMemoryServer.create();
            process.env.MONGO_URI = mongoServer.getUri();
            app = require('../../server');
            await mongoose.connect(process.env.MONGO_URI);
        } catch (error) { throw error; }
    });

    after(async () => {
        try {
            await mongoose.disconnect();
            await mongoServer.stop();
        } catch (error) { throw error; }
    });

    afterEach(async () => {
        try {
            await mongoose.connection.collections.notes?.deleteMany({});
        } catch (error) { throw error; }
    });

    beforeEach(async () => {
        try {
            if (!userToken) {
                const res = await request(app)
                    .post('/api/auth/register')
                    .send({
                        name: 'Note Tester',
                        email: 'notes@test.com',
                        password: 'Password123!'
                    });
                userToken = res.body.token;
            }
        } catch (error) { throw error; }
    });

    it('should prevent unauthorized access to notes (401 Error)', async () => {
        try {
            const res = await request(app).get('/api/notes');
            expect(res.status).to.equal(401);
            expect(res.body.message).to.include('Not authorized');
        } catch (error) { throw error; }
    });

    it('should create a new note when authenticated', async () => {
        try {
            const newNote = {
                title: 'Test Note Title',
                content: '<p>Test content here</p>'
            };

            const res = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newNote);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('title', newNote.title);
            expect(res.body).to.have.property('content', newNote.content);
            expect(res.body).to.have.property('user');
        } catch (error) { throw error; }
    });

    it('should fetch all notes belonging to the authenticated user', async () => {
        try {
            await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Fetch Me', content: 'Content' });

            const res = await request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0]).to.have.property('title', 'Fetch Me');
        } catch (error) { throw error; }
    });

    it('should update an existing note', async () => {
        try {
            const createRes = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Old Title', content: 'Old Content' });

            const noteId = createRes.body._id;

            const updateRes = await request(app)
                .put(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'New Title', content: 'New Content' });

            expect(updateRes.status).to.equal(200);
            expect(updateRes.body).to.have.property('title', 'New Title');
            expect(updateRes.body).to.have.property('content', 'New Content');
        } catch (error) { throw error; }
    });

    it('should delete an existing note', async () => {
        try {
            const createRes = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Delete Me', content: 'Delete Content' });

            const noteId = createRes.body._id;

            const deleteRes = await request(app)
                .delete(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(deleteRes.status).to.equal(200);
            expect(deleteRes.body).to.have.property('message', 'Note removed successfully');

            const fetchRes = await request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${userToken}`);
                
            expect(fetchRes.body).to.have.lengthOf(0);
        } catch (error) { throw error; }
    });
});