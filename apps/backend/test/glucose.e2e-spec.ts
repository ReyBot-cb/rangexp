import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Glucose E2E Tests", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let createdReadingId: string;

  const testUser = {
    email: `glucose-test-${Date.now()}@example.com`,
    password: "TestPassword123!",
    firstName: "Glucose",
    lastName: "Test",
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

    // Register test user and get token
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send(testUser);

    accessToken = response.body.accessToken;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    // Clean up: delete user (cascades to readings)
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await app.close();
  });

  describe("POST /glucose", () => {
    it("should create a glucose reading", async () => {
      const response = await request(app.getHttpServer())
        .post("/glucose")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          value: 120,
          unit: "MG_DL",
          context: "FASTING",
          note: "Morning reading",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.value).toBe(120);
      expect(response.body.unit).toBe("MG_DL");
      expect(response.body.context).toBe("FASTING");
      expect(response.body.userId).toBe(userId);

      createdReadingId = response.body.id;
    });

    it("should reject value below minimum (20)", async () => {
      await request(app.getHttpServer())
        .post("/glucose")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ value: 10 })
        .expect(400);
    });

    it("should reject value above maximum (600)", async () => {
      await request(app.getHttpServer())
        .post("/glucose")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ value: 700 })
        .expect(400);
    });

    it("should reject invalid unit", async () => {
      await request(app.getHttpServer())
        .post("/glucose")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ value: 120, unit: "INVALID_UNIT" })
        .expect(400);
    });

    it("should reject invalid context", async () => {
      await request(app.getHttpServer())
        .post("/glucose")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ value: 120, context: "INVALID_CONTEXT" })
        .expect(400);
    });

    it("should reject request without auth token", async () => {
      await request(app.getHttpServer())
        .post("/glucose")
        .send({ value: 120 })
        .expect(401);
    });

    it("should create reading with custom recordedAt date", async () => {
      const customDate = "2024-01-15T12:00:00.000Z";
      const response = await request(app.getHttpServer())
        .post("/glucose")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          value: 110,
          recordedAt: customDate,
        })
        .expect(201);

      expect(new Date(response.body.recordedAt).toISOString()).toBe(customDate);
    });
  });

  describe("GET /glucose", () => {
    it("should list glucose readings with pagination", async () => {
      const response = await request(app.getHttpServer())
        .get("/glucose")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("meta");
      expect(response.body.meta).toHaveProperty("total");
      expect(response.body.meta).toHaveProperty("page", 1);
      expect(response.body.meta).toHaveProperty("limit", 20);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should apply pagination parameters", async () => {
      const response = await request(app.getHttpServer())
        .get("/glucose?page=1&limit=5")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it("should filter by date range", async () => {
      const startDate = "2024-01-01";
      const endDate = "2024-12-31";

      const response = await request(app.getHttpServer())
        .get(`/glucose?startDate=${startDate}&endDate=${endDate}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
    });

    it("should reject request without auth token", async () => {
      await request(app.getHttpServer()).get("/glucose").expect(401);
    });
  });

  describe("GET /glucose/stats", () => {
    it("should return glucose statistics", async () => {
      const response = await request(app.getHttpServer())
        .get("/glucose/stats")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("period");
      expect(response.body).toHaveProperty("readingsCount");
    });

    it("should accept custom days parameter", async () => {
      const response = await request(app.getHttpServer())
        .get("/glucose/stats?days=30")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.period).toBe("30 days");
    });
  });

  describe("GET /glucose/latest", () => {
    it("should return latest readings", async () => {
      const response = await request(app.getHttpServer())
        .get("/glucose/latest")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const response = await request(app.getHttpServer())
        .get("/glucose/latest?limit=3")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(3);
    });
  });

  describe("GET /glucose/:id", () => {
    it("should return a specific reading", async () => {
      const response = await request(app.getHttpServer())
        .get(`/glucose/${createdReadingId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdReadingId);
      expect(response.body.value).toBe(120);
    });

    it("should return 404 for non-existent reading", async () => {
      await request(app.getHttpServer())
        .get("/glucose/nonexistent-id-12345")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe("PATCH /glucose/:id", () => {
    it("should update a glucose reading", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/glucose/${createdReadingId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          value: 130,
          note: "Updated note",
        })
        .expect(200);

      expect(response.body.value).toBe(130);
      expect(response.body.note).toBe("Updated note");
    });

    it("should reject invalid value on update", async () => {
      await request(app.getHttpServer())
        .patch(`/glucose/${createdReadingId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ value: 10 })
        .expect(400);
    });

    it("should return 404 for non-existent reading", async () => {
      await request(app.getHttpServer())
        .patch("/glucose/nonexistent-id-12345")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ value: 100 })
        .expect(404);
    });
  });

  describe("DELETE /glucose/:id", () => {
    let readingToDelete: string;

    beforeAll(async () => {
      // Create a reading to delete
      const response = await request(app.getHttpServer())
        .post("/glucose")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ value: 100 });
      readingToDelete = response.body.id;
    });

    it("should delete a glucose reading", async () => {
      await request(app.getHttpServer())
        .delete(`/glucose/${readingToDelete}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/glucose/${readingToDelete}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });

    it("should return 404 for non-existent reading", async () => {
      await request(app.getHttpServer())
        .delete("/glucose/nonexistent-id-12345")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
