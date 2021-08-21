import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;
let token: string;
let statementId: string;

describe("Create statement Controller", () => {
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

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 150,
        description: "deposit"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    statementId = deposit.body.id;
  });

  it("Should be able to deposit", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer ${token}`
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});