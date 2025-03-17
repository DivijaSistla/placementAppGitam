const pool = require('../config/db');
const AggregatedMetric = require('../models/AggregatedMetric');

console.log(`🧪 Running tests in NODE_ENV=${process.env.NODE_ENV}, using DB=${process.env.TEST_DB_NAME || process.env.DB_NAME}`);


describe('AggregatedMetric Model Tests', () => {
  const userId = 1;
  const courseCode = 'CSEN2021';
  const company = 'TCS';

  beforeAll(async () => {
    await pool.query('DELETE FROM aggregated_metrics'); // Ensure a clean slate
  });

  test('should insert new aggregated metrics if they do not exist', async () => {
    await AggregatedMetric.update(userId, courseCode, company, 6);
    const result = await AggregatedMetric.getByUser(userId);
    
    expect(result.length).toBe(1);
    expect(result[0].average_score).toBe(6);
    expect(result[0].highest_score).toBe(6);
    expect(result[0].total_attempts).toBe(1);
  });

  test('should update existing aggregated metrics', async () => {
    await AggregatedMetric.update(userId, courseCode, company, 4);
    const result = await AggregatedMetric.getByUser(userId);
    
    expect(result.length).toBe(1);
    expect(result[0].highest_score).toBe(6);
    expect(result[0].total_attempts).toBe(2);
    expect(result[0].average_score).toBeCloseTo(5, 1); // (6+4)/2
  });

  test('should fetch aggregated metrics for a user', async () => {
    const result = await AggregatedMetric.getByUser(userId);
    
    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe(userId);
    expect(result[0].course_code).toBe(courseCode);
    expect(result[0].company).toBe(company);
  });

  test('should delete all aggregated metrics for a user', async () => {
    await AggregatedMetric.deleteAll(userId);
    const result = await AggregatedMetric.getByUser(userId);
    
    expect(result).toHaveLength(0);
  });

  afterAll(async () => {
    await pool.end(); // Close PostgreSQL connection
  });
});
