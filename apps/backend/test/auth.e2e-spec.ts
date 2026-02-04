import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Auth E2E Tests", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: "TestPassword123!",
    firstName: "Test",
    lastName: "User",
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.email).toBe(testUser.email);
    });

    it("should reject duplicate email", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(testUser)
        .expect(409);
    });

    it("should reject invalid email format", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ ...testUser, email: "invalid-email" })
        .expect(400);
    });

    it("should reject short password", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({ ...testUser, email: "new@example.com", password: "123" })
        .expect(400);
    });
  });

  describe("POST /auth/login", () => {
    it("should login with valid credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should return user data with lastStreakDate", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.user).toHaveProperty("lastStreakDate");
      expect(response.body.user).toHaveProperty("xp");
      expect(response.body.user).toHaveProperty("streak");
      expect(response.body.user).toHaveProperty("level");
    });

    it("should return user gamification data", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(typeof response.body.user.xp).toBe("number");
      expect(typeof response.body.user.streak).toBe("number");
      expect(typeof response.body.user.level).toBe("number");
      expect(response.body.user.xp).toBeGreaterThanOrEqual(0);
      expect(response.body.user.streak).toBeGreaterThanOrEqual(0);
      expect(response.body.user.level).toBeGreaterThanOrEqual(1);
    });

    it("should reject invalid password", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        })
        .expect(401);
    });

    it("should reject non-existent user", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "somepassword",
        })
        .expect(401);
    });
  });

  describe("GET /auth/profile", () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      accessToken = response.body.accessToken;
    });

    it("should return user profile with lastStreakDate", async () => {
      const response = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("lastStreakDate");
      expect(response.body).toHaveProperty("xp");
      expect(response.body).toHaveProperty("streak");
      expect(response.body).toHaveProperty("level");
      expect(response.body).toHaveProperty("glucoseUnit");
      expect(response.body).toHaveProperty("isPremium");
    });

    it("should return lastStreakDate as date string or null", async () => {
      const response = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      const lastStreakDate = response.body.lastStreakDate;
      if (lastStreakDate !== null) {
        // Should be in YYYY-MM-DD format
        expect(lastStreakDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it("should reject unauthenticated request", async () => {
      await request(app.getHttpServer())
        .get("/auth/profile")
        .expect(401);
    });
  });
});
