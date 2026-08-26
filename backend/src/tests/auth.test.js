process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

describe('Authentication API Tests', () => {
    
    // 1. Start the fake DB before running tests
    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        process.env.MONGO_URI = mongoServer.getUri(); // Hijack the DB connection string
        
        app = require('../../server'); 
        
        // Connect Mongoose to the fake memory database
        await mongoose.connect(process.env.MONGO_URI);
    });

    // 2. Stop the fake DB after tests are done
    after(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // 3. Wipe the database clean after EVERY test for a fresh start
    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    });

    // --- THE TESTS ---
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
    };

    it('should successfully register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('name', testUser.name);
        expect(res.body).to.have.property('email', testUser.email);
        expect(res.body).to.have.property('token'); 
    });

    it('should reject registration if email already exists', async () => {
        // Register the user first
        await request(app).post('/api/auth/register').send(testUser);
        
        // Attempt to register the exact same user again
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        // Expect a failure status code (usually 400 or 500 depending on your error handler)
        expect(res.status).to.be.oneOf([400, 500]); 
        expect(res.body).to.have.property('status', 'error');
    });

    it('should successfully login an existing user', async () => {
        await request(app).post('/api/auth/register').send(testUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('token');
    });

    it('should reject login with incorrect password', async () => {
        await request(app).post('/api/auth/register').send(testUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'WrongPassword!' });

        expect(res.status).to.equal(401);
    });
});