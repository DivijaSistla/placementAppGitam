const pool = require('../config/db');
const Score = require('../models/Score');

describe('Score Model', () => {
  let testUserId = 101;
  let testCourseCode = 'CSEN1111';
  let testCompany = 'DELIVEROO';

  beforeAll(async () => {
    // Clear scores before running tests
    await Score.deleteAll(testUserId);
  });

  afterAll(async () => {
    // Cleanup after tests
    await Score.deleteAll(testUserId);
    await pool.end();
  });

  test('should create a new score', async () => {
    const newScore = await Score.create(testUserId, testCourseCode, testCompany, 80, 10);
    expect(newScore).toHaveProperty('score_id');
    expect(newScore.user_id).toBe(testUserId);
    expect(newScore.course_code).toBe(testCourseCode);
    expect(newScore.company).toBe(testCompany);
    expect(newScore.score).toBe(80);
    expect(newScore.total_questions).toBe(10);
  });

  test('should retrieve the last 10 scores', async () => {
    await Score.create(testUserId, testCourseCode, testCompany, 85, 10);
    const scores = await Score.getLast10(testUserId);
    expect(scores.length).toBeGreaterThan(0);
    expect(scores[0]).toHaveProperty('score_id');
  });

  test('should delete the oldest score if more than 10 exist', async () => {
    for (let i = 0; i < 12; i++) {
      await Score.create(testUserId, testCourseCode, testCompany, 70 + i, 10);
    }
    await Score.deleteOldest(testUserId);
    const scores = await Score.getLast10(testUserId);
    expect(scores.length).toBeLessThanOrEqual(10);
  });

  test('should delete all scores for a user', async () => {
    await Score.deleteAll(testUserId);
    const scores = await Score.getLast10(testUserId);
    expect(scores.length).toBe(0);
  });
});
