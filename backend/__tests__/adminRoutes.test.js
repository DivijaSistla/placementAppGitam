const request = require("supertest");
const app = require("../index"); // Adjust the path
const pool = require("../config/db"); // Import database connection
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { close } = require('../config/db');

// Generate a test admin token
const adminToken = jwt.sign({ user_id: 1, role: "admin" }, process.env.JWT_SECRET);

// Mocked test data
const testQuestion = {
  company: "KEYLOOP",
  course: "DATA STRUCTURES",
  pyq: "What is a binary tree?",
  concept: "Trees",
  course_code: "CSEN2001",
  option_a: "A data structure",
  option_b: "A type of loop",
  option_c: "A sorting algorithm",
  option_d: "None of the above",
  answer: "OptionA"
};
console.log(`🧪 Running tests in NODE_ENV=${process.env.NODE_ENV}, using DB=${process.env.TEST_DB_NAME || process.env.DB_NAME}`);

describe("Admin Routes", () => {
  let server;
    beforeAll(() => {
        server = app.listen(4000, () => console.log("Test server running on 4000"));
    });
  // TEST: Add a question
  test("POST /api/admin/questions - Add a question", async () => {
    const res = await request(app)
      .post("/api/admin/questions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(testQuestion);

    expect(res.statusCode).toBe(201);
    expect(res.body.course).toBe("DATA STRUCTURES");
  });

  //  TEST: Get all questions
  test("GET /api/admin/questions - Get all questions", async () => {
    const res = await request(app)
      .get("/api/admin/questions?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.questions)).toBe(true);
  });

  //  TEST: Get a single question
  test("GET /api/admin/questions/:id - Get a question by ID", async () => {
    const inserted = await pool.query("SELECT question_id FROM questions LIMIT 1");
    const questionId = inserted.rows[0].question_id;

    const res = await request(app)
      .get(`/api/admin/questions/${questionId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.question_id).toBe(questionId);
  });

  //  TEST: Update a question
  test("PUT /api/admin/questions/:id - Update a question", async () => {
    const inserted = await pool.query("SELECT question_id FROM questions LIMIT 1");
    const questionId = inserted.rows[0].question_id;

    const res = await request(app)
      .put(`/api/admin/questions/${questionId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...testQuestion, pyq: "Updated question text" });

    expect(res.statusCode).toBe(200);
    expect(res.body.pyq).toBe("Updated question text");
  });

  // TEST: Delete a question
  test("DELETE /api/admin/questions/:id - Delete a question", async () => {
    const inserted = await pool.query("SELECT question_id FROM questions LIMIT 1");
    const questionId = inserted.rows[0].question_id;

    const res = await request(app)
      .delete(`/api/admin/questions/${questionId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Question deleted successfully.");
  });

  //  TEST: Get distinct companies
  test("GET /api/admin/distinct/companies - Get distinct companies", async () => {
    const res = await request(app)
      .get("/api/admin/distinct/companies")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // TEST: Get distinct courses
  test("GET /api/admin/distinct/courses - Get distinct courses", async () => {
    const res = await request(app)
      .get("/api/admin/distinct/courses")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  //  TEST: Get all users
  test("GET /api/admin/users - Get all users", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // TEST: Get analytics
  test("GET /api/admin/analytics - Get analytics data", async () => {
    const res = await request(app)
      .get("/api/admin/analytics")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("totalQuestions");
    expect(res.body).toHaveProperty("totalUsers");
    expect(res.body).toHaveProperty("totalAttempts");
  });

  // TEST: Upload questions via Excel
  test("POST /api/admin/upload-questions - Upload questions file", async () => {
    const res = await request(app)
      .post("/api/admin/upload-questions")
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("file", "uploads/sample-questions.xlsx");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Questions uploaded successfully.");
  });

  // TEST: Download sample Excel sheet
  test("GET /api/admin/download-sample-sheet - Download sample Excel sheet", async () => {
    const res = await request(app)
      .get("/api/admin/download-sample-sheet")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  });

  // TEST: Download instructions file
  test("GET /api/admin/download-instructions - Download instructions file", async () => {
    const res = await request(app)
      .get("/api/admin/download-instructions")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("text/plain; charset=UTF-8");
  });

  // afterAll(() => {
  //   server.close();
  // });

  const db = require("../config/db");

  afterAll(async () => {
    await pool.end();  // Close database connection
    server.close();    // Close Express server

  });
  
});
