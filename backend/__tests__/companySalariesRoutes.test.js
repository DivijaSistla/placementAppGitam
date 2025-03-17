const request = require("supertest");
const app = require("../index"); // Adjust the path
const pool = require("../config/db"); // Import database connection
const jwt = require("jsonwebtoken");

// Generate a test admin token
const adminToken = jwt.sign({ user_id: 1, role: "admin" }, process.env.JWT_SECRET);

let companySalaryId; // To store created record ID

describe("Company Salaries API Tests", () => {
    beforeAll(async () => {
        console.log("🟢 Running Company Salaries API Tests...");
    });

    afterAll(async () => {
        console.log("🛑 Closing Database Connection...");
        await pool.end(); // ✅ Close DB connection properly
    });

    // ✅ Test: Add a new company salary record
    it("should add a new company salary record", async () => {
        const response = await request(app)
            .post("/api/admin/company-salaries")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                company: "CODESolution",
                roles: "Software Engineer",
                salaries: "850000"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.company).toBe("CODESolution");

        companySalaryId = response.body.id; // ✅ Store ID for later use
        console.log("📢 Created Company Salary ID:", companySalaryId);
    });

    // ❌ Test: Reject a record with missing roles/salaries
    it("should reject a company salary record with missing roles/salaries", async () => {
        const response = await request(app)
            .post("/api/admin/company-salaries")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                company: "Google",
                roles: "", // Missing roles
                salaries: "3500000"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Roles and salaries are required.");
    });

    // ❌ Test: Reject mismatched roles & salaries count
    it("should reject a record where roles & salaries count don't match", async () => {
        const response = await request(app)
            .post("/api/admin/company-salaries")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                company: "Facebook",
                roles: "Software Engineer/Manager",
                salaries: "3000000" // Mismatch
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Roles and salaries must have the same number of entries.");
    });

    // ❌ Test: Reject duplicate company name
    it("should reject duplicate company name", async () => {
        const response = await request(app)
            .post("/api/admin/company-salaries")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                company: "CODESolution", // Already added in the first test
                roles: "Data Scientist",
                salaries: "3500000"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Company name must be unique.");
    });

    // ✅ Test: Edit an existing company salary record
    it("should edit an existing company salary record", async () => {
        const response = await request(app)
            .put(`/api/admin/company-salaries/${companySalaryId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                company: "CODESolution Updated",
                roles: "Software Engineer/Senior Engineer",
                salaries: "2600000/4500000"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.company).toBe("CODESolution Updated");
    });

    // ❌ Test: Reject edit if roles & salaries mismatch
    it("should reject edit if roles & salaries count don't match", async () => {
        const response = await request(app)
            .put(`/api/admin/company-salaries/${companySalaryId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                company: "CODESolution Updated",
                roles: "Software Engineer/Senior Engineer",
                salaries: "2600000" // Mismatch
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Roles and salaries must have the same number of entries.");
    });

    // ✅ Test: Fetch all company salaries with pagination
    it("should fetch all company salaries with pagination", async () => {
        const response = await request(app)
            .get("/api/admin/company-salaries?page=1&limit=5")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.companySalaries)).toBe(true);
    });

    // ✅ Test: Fetch distinct company names
    it("should fetch distinct company names", async () => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // ✅ Small delay for DB consistency

        const response = await request(app)
            .get("/api/admin/company-salaries/distinct-companies")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.includes("CODESolution Updated")).toBe(true);
    });

    // ✅ Test: Delete a company salary record
    it("should delete a company salary record", async () => {
        const response = await request(app)
            .delete(`/api/admin/company-salaries/${companySalaryId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Record deleted successfully.");
    });

    // ✅ Test: Return success when deleting a non-existing company salary record
    it("should return success when deleting a non-existing company salary record", async () => {
        const response = await request(app)
            .delete("/api/admin/company-salaries/9789")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Record deleted successfully.");
    });
});
