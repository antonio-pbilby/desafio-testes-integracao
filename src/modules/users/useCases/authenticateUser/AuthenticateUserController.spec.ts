import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll( async () => {
    connection = await createConnection();

    await connection.dropDatabase();

    await connection.runMigrations();
  });
  
  it("Should be able to authenticate a valid user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "user",
        email: "email@email.com",
        password: "1234"
      });
      
      const response = await request(app)
        .post("/api/v1/sessions")
        .send({
            email: "email@email.com",
            password: "1234"
        
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate a non-existent user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "none@email.com",
        password: "1234"
      });
    
    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate a user with invalid password", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "user",
        email: "email2@email.com",
        password: "1234"
      });
      
      const response = await request(app)
        .post("/api/v1/sessions")
        .send({
            email: "email2@email.com",
            password: "123"
        
      });

    expect(response.status).toBe(401);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});