import mongoose from "mongoose";
import request from "supertest";
import app from "../../app.js";
import User from "../../models/User.js";
import "dotenv/config";

const { DB_HOST } = process.env;

describe("test /users/login router", () => {
  let server = null;
  beforeAll(async () => {
    await mongoose.connect(DB_HOST);
    server = app.listen(3000);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  test("test /users/login with correctData", async () => {
    const loginData = {
      email: "coolboy@mail.com",
      password: "password",
    };
    const { body, statusCode } = await request(app)
      .post("/users/login")
      .send(loginData);

    expect(statusCode).toBe(200);
    expect(body.user.email).toBe(loginData.email);

    const user = await User.findOne({ email: loginData.email });
    expect(body.token).toBe(user.token);
    expect(body.user.subscription).toBe(user.subscription);
  }, 30000);
});