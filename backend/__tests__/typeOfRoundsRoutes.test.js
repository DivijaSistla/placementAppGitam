const request = require('supertest');
const app = require('../index'); // Import the Express app
const pool = require('../config/db'); // Import database connection
const jwt = require('jsonwebtoken');

//  Generate a test admin token
const adminToken = jwt.sign({ user_id: 1, role: 'admin' }, process.env.JWT_SECRET || 'testsecret');


let typeOfRoundsId; // Variable to store created record ID

beforeAll(async () => {
    await pool.query("DELETE FROM typeofrounds WHERE company = 'Amazon';"); // ✅ Clear Amazon records before tests
    await pool.query("SELECT setval('typeofrounds_id_seq', (SELECT COALESCE(MAX(id), 0) FROM typeofrounds) + 1);");

});

// Close database connections after all tests
afterAll(async () => {
    await pool.end();
    if (app && app.close) {
        app.close(() => console.log('✅ Test server closed.'));
    }
});

describe('Type of Rounds API Tests', () => {

    //  Test: Add a new type of rounds record
    it('should add a new type of rounds record', async () => {
        const response = await request(app)
            .post('/api/admin/typeofrounds')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'Amazon',
                aptitude_round: 2,
                technical_round: 3,
                managerial_round: 1,
                technical_hr_round: 1,
                group_discussion: 1,
                online_coding_round: 2,
                written_coding_round: 1
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.company).toBe('Amazon');

        typeOfRoundsId = response.body.id; // Save ID for later tests
    });
    // Test: Reject duplicate company name
    it('should reject duplicate company name', async () => {
        const response = await request(app)
            .post('/api/admin/typeofrounds')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'Amazon', // Already added in the first test
                aptitude_round: 1,
                technical_round: 2,
                managerial_round: 1,
                technical_hr_round: 1,
                group_discussion: 0,
                online_coding_round: 1,
                written_coding_round: 1
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Company name must be unique.');
    });

    //  Test: Edit an existing type of rounds record
    it('should edit an existing type of rounds record', async () => {
        const response = await request(app)
            .put(`/api/admin/typeofrounds/${typeOfRoundsId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'Amazon Updated',
                aptitude_round: 3,
                technical_round: 4,
                managerial_round: 2,
                technical_hr_round: 1,
                group_discussion: 1,
                online_coding_round: 3,
                written_coding_round: 2
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.company).toBe('Amazon Updated');
    });

    
    //  Test: Fetch all type of rounds records (pagination + filtering)
    it('should fetch all type of rounds records with pagination', async () => {
        const response = await request(app)
            .get('/api/admin/typeofrounds?page=1&limit=5')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.typeofrounds)).toBe(true);
        expect(typeof response.body.total).toBe('string'); // Count is returned as a string
    });

    //  Test: Fetch distinct company names
    it('should fetch distinct company names', async () => {
        const response = await request(app)
            .get('/api/admin/typeofrounds/distinct-companies')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.includes('Amazon Updated')).toBe(true);
    });

    //  Test: Delete a type of rounds record
    it('should delete a type of rounds record', async () => {
        const response = await request(app)
            .delete(`/api/admin/typeofrounds/${typeOfRoundsId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Record deleted successfully.');
    });

    //  Test: Deleting non-existing record should still return success
    it('should return success when deleting a non-existing type of rounds record', async () => {
        const response = await request(app)
            .delete('/api/admin/typeofrounds/9999')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Record deleted successfully.');
    });

});
