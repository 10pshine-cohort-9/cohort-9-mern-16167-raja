// Force the test environment
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const app = require('../../server'); // Imports your exported Express app

describe('Health Check API', () => {
    it('should return a 200 OK status and success message', async () => {
        const res = await request(app).get('/api/health');
        
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('status', 'success');
        expect(res.body).to.have.property('message', 'Notes API is fully operational');
    });
});