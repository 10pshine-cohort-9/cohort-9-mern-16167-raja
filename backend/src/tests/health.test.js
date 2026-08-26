process.env.NODE_ENV = 'test';
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../server');

describe('Health Check API', () => {
    it('should return a 200 OK status and success message', async () => {
        try {
            const res = await request(app).get('/api/health');
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'Server is healthy');
        } catch (error) {
            throw error;
        }
    });
});