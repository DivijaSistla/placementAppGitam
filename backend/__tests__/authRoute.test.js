const request = require('supertest');
const app = require('../index'); // Ensure this points to your Express app
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let token;

beforeAll(async () => {
  // Ensure users table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR NOT NULL UNIQUE,
      password VARCHAR NOT NULL,
      role VARCHAR NOT NULL
    );
  `);
});

// afterEach(async () => {
//   // Cleanup: Delete all users after each test
//   await pool.query('DELETE FROM users;');
// });

afterAll(async () => {
  await pool.end(); // Close database connection
});

describe('Auth Routes Tests', () => {
  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpassword', role: 'student' });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    token = res.body.token; // Save token for further tests
  });

  test('should not allow non-student roles to register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'adminuser', password: 'securepassword', role: 'admin' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid role. Only students can register.');
  });

  test('should login a registered user', async () => {
    // First, register the user
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpassword', role: 'student' });

    // Then, try to log in
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token; // Save token for further tests
  });

  test('should not login with incorrect password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpassword', role: 'student' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid password');
  });

  test('should get current user details', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpassword', role: 'student' });
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });
    
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('testuser');
  });

  test('should not allow access to /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Access denied');
  });
});
