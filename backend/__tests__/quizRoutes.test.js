const request = require('supertest');
const app = require('../index'); // Ensure this points to your Express app
const pool = require('../config/db');

console.log(`🧪 Running tests in NODE_ENV=${process.env.NODE_ENV}, using DB=${process.env.TEST_DB_NAME || process.env.DB_NAME}`);

describe('Quiz Routes API', () => {
  afterAll(async () => {
    await pool.end(); // Close the DB connection after tests
  });

  test('GET /api/quiz/distinct - should fetch distinct courses and companies', async () => {
    const res = await request(app).get('/api/quiz/distinct');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('courses');
    expect(res.body).toHaveProperty('companies');
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(Array.isArray(res.body.companies)).toBe(true);
  });

  test('GET /api/quiz/questions - should return filtered questions', async () => {
    const res = await request(app).get('/api/quiz/questions?course=OS&company=ACCENTURE&limit=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/quiz/questions/all - should return paginated questions', async () => {
    const res = await request(app).get('/api/quiz/questions/all?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('questions');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.questions)).toBe(true);
  });

  test('POST /api/quiz/submit - should submit quiz and calculate score', async () => {
    const quizData = {
      answers: [
        { question_id: 1, selectedOption: 'OptionA' },
        { question_id: 2, selectedOption: 'OptionB' }
      ],
      questionIds: [1, 2]
    };
    
    const res = await request(app).post('/api/quiz/submit').send(quizData);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('score');
    expect(res.body).toHaveProperty('total');
  });
});
