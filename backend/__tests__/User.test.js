const pool = require('../config/db'); // Ensure testdb is used
const User = require('../models/User'); // Adjust path if needed

console.log(`🧪 Running tests in NODE_ENV=${process.env.NODE_ENV}, using DB=${process.env.TEST_DB_NAME || process.env.DB_NAME}`);


describe('User Model Tests', () => {

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'); // Clear table before each test
  });
        
  beforeAll(async () => {
    // Ensure the users table exists (Modify if needed)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR NOT NULL UNIQUE,
        password VARCHAR NOT NULL,
        role VARCHAR NOT NULL
      );
    `);
  });

  afterEach(async () => {
    // Cleanup: Delete all test users after each test
    await pool.query('DELETE FROM users;');
  });

  afterAll(async () => {
    // Close DB connection after all tests
    await pool.end();
  });

  test('should create a new user', async () => {
    const newUser = await User.create('testuser', 'hashedpassword', 'admin');
    expect(newUser).toHaveProperty('user_id');
    expect(newUser.username).toBe('testuser');
    expect(newUser.password).toBe('hashedpassword'); // Hash before storing if needed
    expect(newUser.role).toBe('admin');
  });

  test('should find a user by username', async () => {
    await User.create('testuser', 'hashedpassword', 'admin');
    const foundUser = await User.findByUsername('testuser');
    expect(foundUser).not.toBeNull();
    expect(foundUser.username).toBe('testuser');
  });

  test('should find a user by user_id', async () => {
    const newUser = await User.create('testuser', 'hashedpassword', 'admin');
    const foundUser = await User.findById(newUser.user_id);
    expect(foundUser).not.toBeNull();
    expect(foundUser.user_id).toBe(newUser.user_id);
  });
});
