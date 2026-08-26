process.env.NODE_ENV = 'test';
const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

describe('Authentication API Tests', () => {
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
            const collections = mongoose.connection.collections;
            for (const key in collections) {
                await collections[key].deleteMany();
            }
        } catch (error) { throw error; }
    });

    it('should successfully register a new user', async () => {
        try {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123!'
                });
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('token');
            expect(res.body).to.have.property('_id');
            expect(res.body.email).to.equal('test@example.com');
        } catch (error) { throw error; }
    });

    it('should reject registration if email already exists', async () => {
        try {
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'First User',
                    email: 'duplicate@example.com',
                    password: 'Password123!'
                });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Second User',
                    email: 'duplicate@example.com',
                    password: 'Password123!'
                });

            expect(res.status).to.equal(400); // FIX: Strictly require 400 Bad Request
            expect(res.body).to.have.property('status', 'error');
        } catch (error) { throw error; }
    });

    it('should successfully login an existing user', async () => {
        try {
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Login Tester',
                    email: 'login@example.com',
                    password: 'Password123!'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'Password123!'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');
            expect(res.body.email).to.equal('login@example.com');
        } catch (error) { throw error; }
    });

    it('should reject login with incorrect password', async () => {
        try {
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Bad Pass Tester',
                    email: 'badpass@example.com',
                    password: 'Password123!'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'badpass@example.com',
                    password: 'WrongPassword!'
                });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('message', 'Invalid email or password');
        } catch (error) { throw error; }
    });
});