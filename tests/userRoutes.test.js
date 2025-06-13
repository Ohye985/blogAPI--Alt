const request = require("supertest");
const app = require("../app"); // Adjust the path as necessary

describe("User Authentication Routes", () => {
  it("should create a new user (signup)", async () => {
    const res = await request(app).post("/api/users/auth/signup").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should login an existing user", async () => {
    const res = await request(app).post("/api/users/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should get all posts by the authenticated user", async () => {
    const res = await request(app)
      .get("/api/users/author")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.posts)).toBe(true);
  });
});
