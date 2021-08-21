import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;
let token: string;

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
  });

  it("Should be able to deposit", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 150,
        description: "deposit"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const balance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      });
    
    expect(response.status).toBe(201);
    expect(balance.body.balance).toBe(150);
  });

  it("Should be able to withdraw", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "withdraw"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const balance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      });
    
    expect(response.status).toBe(201);
    expect(balance.body.balance).toBe(100);
  });

  it("Should not be able to withdraw with insufficient funds", async () => {
     const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "withdraw"
      })
      .set({
        Authorization: `Bearer ${token}`
      });
    
    expect(response.status).toBe(400);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});