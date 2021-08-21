import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll( async () => {
    connection = await createConnection();

    await connection.dropDatabase();

    await connection.runMigrations();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "user",
        email: "email@email.com",
        password: "1234"
      });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a duplicate user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "user",
        email: "email@email.com",
        password: "1234"
      });

    expect(response.status).toBe(400);
  });

  

  afterAll( async () => {
    await connection.dropDatabase();
    await connection.close();
  })
});