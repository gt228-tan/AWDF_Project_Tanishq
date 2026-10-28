import request from "supertest";
import app from "../server/server.js";

describe("Tasks API Unit Tests", () => {
  test("GET /tasks returns 200", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(200);
  });
});
