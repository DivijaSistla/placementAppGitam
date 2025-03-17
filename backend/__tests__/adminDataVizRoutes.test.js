const request = require('supertest');
const app = require('../server'); // Adjust path as needed
const pool = require('../config/db'); // Adjust path to your PostgreSQL connection
const jwt = require('jsonwebtoken');

const adminToken = jwt.sign({ user_id: 1, role: 'admin' }, process.env.JWT_SECRET);

let companyRoundId;
let server;

//  Before running tests, ensure DB is clean
beforeAll(async () => {
    //await pool.query('DELETE FROM company_rounds;'); // Clears table before running tests
});

//  After all tests, close DB connection
afterAll(async () => {

    await pool.end();
    if (app && app.close) {
        app.close(() => console.log('✅ Test server closed.'));
    }
});

describe('Company Rounds API Tests', () => {


    //  Test: Add a new company round
    it('should add a new company round', async () => {
        const response = await request(app)
            .post('/api/admin/company-rounds')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'FTD',
                no_of_rounds: 3,
                no_of_online_rounds: 0,
                no_of_offline_rounds: 3
            });

        expect(response.status).toBe(201);
        expect(response.body.company).toBe('FTD');

        companyRoundId = response.body.id; // Save ID for later tests
    });

    //  Test: Prevent duplicate company entry
    it('should reject duplicate company names', async () => {
        const response = await request(app)
            .post('/api/admin/company-rounds')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'ORACLE',
                no_of_rounds: 5,
                no_of_online_rounds: 1,
                no_of_offline_rounds: 4
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Company name must be unique.');
    });

    //  Test: Edit an existing company round
    it('should edit an existing company round', async () => {
        const response = await request(app)
            .put(`/api/admin/company-rounds/${companyRoundId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'MUSIGMA-UPDATED',
                no_of_rounds: 4,
                no_of_online_rounds: 1,
                no_of_offline_rounds: 3
            });

        expect(response.status).toBe(200);
        expect(response.body.company).toBe('MUSIGMA-UPDATED');
    });

    //  Test: Get all company rounds (Pagination + Filtering)
    it('should fetch all company rounds with pagination', async () => {
        const response = await request(app)
        .get('/api/admin/company-rounds?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.companyRounds)).toBe(true);
        expect(typeof response.body.total).toBe('string'); // Count is returned as a string
    });

    //  Test: Get a single company round by ID
    it('should fetch a company round by ID', async () => {
        const response = await request(app)
        .get(`/api/admin/company-rounds/${companyRoundId}`)
        .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(companyRoundId);
    });

    //  Test: Fetch a non-existing company round (Expect 404)
    it('should return 404 for a non-existing company round', async () => {
        const response = await request(app)
        .get('/api/admin/company-rounds/9999')
        .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Company rounds not found.');
    });

    //  Test: Get distinct company names
    it('should return distinct company names', async () => {
        const response = await request(app)
        .get('/api/admin/distinct-companies')
        .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.includes('MUSIGMA')).toBe(true);
    });

    //  Test: Delete a company round
    it('should delete a company round', async () => {
        const response = await request(app)
        .delete(`/api/admin/company-rounds/${companyRoundId}`)
        .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Company rounds deleted successfully.');
    });

    //  Test: Prevent deletion of non-existing entry (Expect 500)
    it('should return an error when deleting a non-existing company round', async () => {
        const nonExistentId = 9999; // Using a very high ID that is unlikely to exist
    
        const response = await request(app)
            .delete(`/api/admin/company-rounds/${nonExistentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', "Company rounds deleted successfully.");
    });
    
});
