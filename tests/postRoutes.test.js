const request = require("supertest");
const app = require("../app"); // Adjust the path as necessary

describe("Post Routes", () => {
  let authToken;

  beforeAll(async () => {
    // Register and login to get the auth token
    const signupRes = await request(app).post("/api/users/auth/signup").send({
      email: "author@example.com",
      password: "password123",
    });

    const loginRes = await request(app).post("/api/users/auth/login").send({
      email: "author@example.com",
      password: "password123",
    });

    authToken = loginRes.body.token;
  });

  it("should create a new post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "New Post Title",
        content: "This is the content of the new post.",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("post");
    expect(res.body.post.title).toBe("New Post Title");
  });

  it("should not create a post without authentication", async () => {
    const res = await request(app).post("/api/posts").send({
      title: "Unauthorized Post",
      content: "This post should not be created.",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });

  it("should get a single post by ID", async () => {
    const postRes = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Post to Retrieve",
        content: "Content of the post to retrieve.",
      });

    const postId = postRes.body.post._id;

    const res = await request(app)
      .get(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("post");
    expect(res.body.post._id).toBe(postId);
  });

  it("should update an existing post", async () => {
    const postRes = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Post to Update",
        content: "Content of the post to update.",
      });

    const postId = postRes.body.post._id;

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Updated Post Title",
        content: "Updated content of the post.",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("post");
    expect(res.body.post.title).toBe("Updated Post Title");
  });

  it("should delete an existing post", async () => {
    const postRes = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Post to Delete",
        content: "Content of the post to delete.",
      });

    const postId = postRes.body.post._id;

    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Post deleted successfully");
  });
});
