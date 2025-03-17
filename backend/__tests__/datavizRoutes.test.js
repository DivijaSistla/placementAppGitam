const request = require("supertest");
const app = require("../index"); // Ensure this points to your Express app
const { pool } = require("../config/db");

describe("Data Visualization API Endpoints", () => {

    let server;

    beforeAll(() => {
        server = app.listen(4000, () => console.log("Test server running on port 4000"));
    });

    afterAll(async () => {
        if (pool) {
            await pool.end(); // Close the database connection pool
        }
        await new Promise((resolve) => server.close(resolve)); // Properly close the server
    });

  test("GET /api/dataviz/company-rounds should return all company rounds", async () => {
    const response = await request(app).get("/api/dataviz/company-rounds");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); 

  });

  test("GET /api/dataviz/student-hiring should return all student hiring data", async () => {
    const response = await request(app).get("/api/dataviz/student-hiring");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("GET /api/dataviz/gender-wise-data should return gender-wise data for a specific company", async () => {
    const response = await request(app).get("/api/dataviz/gender-wise-data").query({ company: "VIAPLUS" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("no_of_male_students");
    expect(response.body).toHaveProperty("no_of_female_students");
  });

  test("GET /api/dataviz/distinct-companies should return a list of distinct companies", async () => {
    const response = await request(app).get("/api/dataviz/distinct-companies");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("GET /api/dataviz/question-count-by-subject/:company should return question count grouped by subject", async () => {
    const response = await request(app).get("/api/dataviz/question-count-by-subject/VIAPLUS");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty("course");
      expect(response.body[0]).toHaveProperty("question_count");
    }
  });

  // Test round-type endpoints
  const roundTypes = [
    "aptitude",
    "technical",
    "managerial",
    "technical-hr",
    "group-discussion",
    "online-coding",
    "written-coding",
  ];

  roundTypes.forEach((round) => {
    test(`GET /api/dataviz/rounds/${round} should return companies with ${round} rounds`, async () => {
      const response = await request(app).get(`/api/dataviz/rounds/${round}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  test("GET /api/dataviz/average-salaries should return average salaries per company", async () => {
    const response = await request(app).get("/api/dataviz/average-salaries");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("GET /api/dataviz/all-salaries should return all salary details per company", async () => {
    const response = await request(app).get("/api/dataviz/all-salaries");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
