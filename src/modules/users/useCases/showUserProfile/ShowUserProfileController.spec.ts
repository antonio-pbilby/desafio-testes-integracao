
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;
let token: string;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    await request(app)
      .post("/api/v1/users")
      .send({
        name: "user",
        email: "email@email.com",
        password: "1234"
      });
    
    const sessionResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "email@email.com",
        password: "1234"
      });
    
    token = sessionResponse.body.token;
  });
  
  it("Should be able to show a user's profile", async() => {

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});