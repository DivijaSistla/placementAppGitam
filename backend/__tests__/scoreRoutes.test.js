const request = require('supertest');
const app = require('../index');
const pool = require('../config/db'); // Adjust path as needed
const jwt = require('jsonwebtoken');

console.log(`🧪 Running tests in NODE_ENV=${process.env.NODE_ENV}, using DB=${process.env.TEST_DB_NAME || process.env.DB_NAME}`);

let authToken;
const testUser = { userId: 100101, username: 'testuser', role: 'student' };

beforeAll(async () => {
  // Generate a test auth token
  authToken = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Insert test user into database
  await pool.query(`INSERT INTO users (user_id, username, password, role) VALUES (100101, 'testuser', 'hashedpassword', 'student') ON CONFLICT DO NOTHING;`);

  // Insert sample scores for the test user
  await pool.query(`INSERT INTO scores (score_id, user_id, course_code, company, score, total_questions, timestamp) VALUES
    (1002, 100101, 'CSEN2061', 'ACCENTURE', 8, 10, NOW()),
    (1003, 100102, 'CSEN1111', 'ORACLE', 7, 10, NOW()) ON CONFLICT DO NOTHING;`);
});

describe('Score Routes API', () => {
  test('POST /api/scores - Save a new score', async () => {
    const res = await request(app)
      .post('/api/scores')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        courseCode: 'CSEN1111',
        company: 'PEGA',
        score: 9,
        totalQuestions: 10
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('score_id');
  });

  test('GET /api/scores - Retrieve last 10 scores', async () => {
    const res = await request(app)
      .get('/api/scores')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/scores/metrics - Get aggregated metrics', async () => {
    const res = await request(app)
      .get('/api/scores/metrics')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('average_score');
    expect(res.body[0]).toHaveProperty('highest_score');
    expect(res.body[0]).toHaveProperty('total_attempts');
  });

  test('DELETE /api/scores/clear - Clear all scores and metrics', async () => {
    const res = await request(app)
      .delete('/api/scores/clear')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('All scores and metrics cleared successfully.');
  });
});

afterAll(async () => {
  // Clean up test data
  await pool.query('DELETE FROM scores WHERE user_id = 100101;');
  await pool.query('DELETE FROM users WHERE user_id = 100102;');
  await pool.end();
});
