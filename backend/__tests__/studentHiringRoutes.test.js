const request = require('supertest');
const app = require('../index'); // Import the Express app
const pool = require('../config/db'); // Import database connection
const jwt = require('jsonwebtoken');

// 🛠️ Generate a test admin token
const adminToken = jwt.sign({ user_id: 1, role: 'admin' }, process.env.JWT_SECRET || 'testsecret');

let studentHiringId;

beforeAll(async () => {
    await pool.query("DELETE FROM student_hiring WHERE company = 'Amazon';");

});

// Close database connections after all tests
afterAll(async () => {
    await pool.end();
});

describe('Student Hiring API Tests', () => {

    //  Test: Add a new student hiring record
    it('should add a new student hiring record', async () => {
        const response = await request(app)
            .post('/api/admin/student-hiring')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'Amazon',
                no_of_students_hired: 10,
                no_of_male_students: 6,
                no_of_female_students: 4
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.company).toBe('Amazon');

        studentHiringId = response.body.id; // Save the ID for later tests
    });

    // Test: Reject if total students do not match male + female students
    it('should reject invalid student count', async () => {
        const response = await request(app)
            .post('/api/admin/student-hiring')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'Microsoft',
                no_of_students_hired: 10,
                no_of_male_students: 5,
                no_of_female_students: 3 // Does not sum to 10
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Total students hired must equal the sum of male and female students.');
    });

    // Test: Reject duplicate company name
    it('should reject duplicate company name', async () => {
        const response = await request(app)
            .post('/api/admin/student-hiring')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'Amazon', // Already added in the first test
                no_of_students_hired: 8,
                no_of_male_students: 4,
                no_of_female_students: 4
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Company name must be unique.');
    });

    // Test: Edit an existing student hiring record
    it('should edit an existing student hiring record', async () => {
        const response = await request(app)
            .put(`/api/admin/student-hiring/${studentHiringId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'Amazon Updated',
                no_of_students_hired: 12,
                no_of_male_students: 7,
                no_of_female_students: 5
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.company).toBe('Amazon Updated');
    });

    // Test: Reject editing record if total students don’t match male + female
    it('should reject edit with mismatched student count', async () => {
        const response = await request(app)
            .put(`/api/admin/student-hiring/${studentHiringId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                company: 'Amazon Updated',
                no_of_students_hired: 10,
                no_of_male_students: 5,
                no_of_female_students: 2 // Incorrect sum
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Total students hired must equal the sum of male and female students.');
    });

    // Test: Fetch all student hiring records (pagination + filtering)
    it('should fetch all student hiring records with pagination', async () => {
        const response = await request(app)
            .get('/api/admin/student-hiring?page=1&limit=5')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.studentHiring)).toBe(true);
        expect(typeof response.body.total).toBe('string'); // Count is returned as a string
    });

    // Test: Fetch distinct company names
    it('should fetch distinct company names', async () => {
        const response = await request(app)
            .get('/api/admin/distinctcompanies')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.includes('Amazon Updated')).toBe(true);
    });

    // Test: Delete a student hiring record
    it('should delete a student hiring record', async () => {
        const response = await request(app)
            .delete(`/api/admin/student-hiring/${studentHiringId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Student hiring record deleted successfully.');
    });

    // Test: Deleting non-existing student hiring record should still return success
    it('should return success when deleting a non-existing student hiring record', async () => {
        const response = await request(app)
            .delete('/api/admin/student-hiring/9999')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Student hiring record deleted successfully.');
    });

});
