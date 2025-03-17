const request = require('supertest');
const app = require('../index'); // Ensure this points to your Express app
const pool = require('../config/db');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

console.log(`🧪 Running tests in NODE_ENV=${process.env.NODE_ENV}, using DB=${process.env.TEST_DB_NAME || process.env.DB_NAME}`);

describe('Curriculum Routes Tests', () => {
  let token;

  beforeAll(async () => {
    await pool.query("DELETE FROM curriculum_analysis"); // Clear old data
    await pool.query("DELETE FROM users");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS curriculum_analysis (
        cur_id SERIAL PRIMARY KEY,
        curriculum TEXT,
        syllabus_analysis TEXT,
        faculty_attention TEXT,
        course_id VARCHAR NOT NULL,
        subject_name VARCHAR NOT NULL
      );
    `);
    
    // Insert test data
    await pool.query(`
      INSERT INTO curriculum_analysis (curriculum, syllabus_analysis, faculty_attention, course_id, subject_name)
      VALUES 
      ('UNIT 1 Introduction to Web Application Designing Introduction: Building a Web Application, Components – Client Side, Server-side Components, 2 tier, n-tier architectures, Networks, Protocols. MVC Pattern. HTML5: Basic syntax, HTML document structure, text formatting, images, lists, links, tables, forms, frames. Cascading Style Sheets (CSS3): Levels of style sheets, style specification formats, selector forms, font properties, list properties, colour properties, alignment of text, background images, The Box Model.', 'Understand how a web application works, the network protocols used, architecture etc. Use all HTML, CSS properties taught in class. Work with the latest versions. Try to create front-end of any existing popular website using your knowladge. In CSS, work on responsiveness, floats and position properties, flexbox, CSS Grid, animations, Bootstrap etc.', 'Give the task to create a simpler clone of any popular website', 'CSEN3071', 'WEB APPLICATION DEVELOPMENT AND SOFTWARE FRAMEWORKS'),
      ('UNIT 2 Software development phases and processes Software development and processes – RAD, RUP, Agile: Scrum, Prototyping Development phases of Software in relation to Processes What to develop? – Requirements gathering and Analysis, Types- functional, non-functional, system, User Interface, quality requirements and putting together– UML usecases, scenarios.', 'Focus on using tools like Jira, Kanban etc. Try creating documentation for any sample project that follows Agile lifecycle. Learn to create UML diagrams for the sample project since it will help in planning and defining functionalities in future for a software engineer role.', 'Kindly encourage students to try and think in all possible ways and directions to gather requirements from all stakeholders and hence get clarity on what to develop with the help of a sample project. Encourage students to classify these requirements and draw UML diagrams. Using plantUML or any other tool to do so should be fine.', 'CSEN1131', 'SOFTWARE ENGINEERING');
    `);
    
    // Create a test user
    const existingUser = await pool.query("SELECT * FROM users WHERE username = 'testuser'");
    let testUser;
    if (existingUser.rows.length === 0) {
      testUser = await User.create('testuser', 'hashedpassword', 'student');
    } else {
      testUser = existingUser.rows[0];
    }

    token = jwt.sign(
      { userId: testUser.user_id, username: testUser.username, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await pool.query('DELETE FROM curriculum_analysis;');
    await pool.query('DELETE FROM users;');
    await pool.end();
  });

  test('should require authentication to access curriculum analyses', async () => {
    const res = await request(app).get('/api/curriculum/curriculum-analyses');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Access denied');
  });

  test('should return all curriculum analyses', async () => {
    const res = await request(app)
      .get('/api/curriculum/curriculum-analyses')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('should return curriculum analyses filtered by subject', async () => {
    const res = await request(app)
      .get('/api/curriculum/curriculum-analyses?subject_name=SOFTWARE ENGINEERING')
      .set('Authorization', `Bearer ${token}`);
    console.log("Response body:", res.body);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].subject_name).toBe('SOFTWARE ENGINEERING');
  });

  test('should return distinct subjects', async () => {
    const res = await request(app)
      .get('/api/curriculum/distinct-subjects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toContain('SOFTWARE ENGINEERING');
    expect(res.body).toContain('WEB APPLICATION DEVELOPMENT AND SOFTWARE FRAMEWORKS');
  });
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("DB_NAME:", process.env.DB_NAME);
  //console.log(app._router.stack.filter(r => r.route).map(r => r.route.path));
});
