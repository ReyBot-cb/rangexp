import { Test, TestingModule } from "@nestjs/testing";
import { GlucoseService } from "./glucose.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("GlucoseService", () => {
  let service: GlucoseService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    glucoseReading: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlucoseService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GlucoseService>(GlucoseService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a glucose reading", async () => {
      const mockReading = {
        id: "reading-1",
        userId: "user-1",
        value: 120,
        unit: "MG_DL",
        note: "After lunch",
        recordedAt: new Date(),
        context: "AFTER_MEAL",
      };

      mockPrisma.glucoseReading.create.mockResolvedValue(mockReading);

      const result = await service.create("user-1", {
        value: 120,
        unit: "MG_DL" as any,
        note: "After lunch",
        context: "AFTER_MEAL" as any,
      });

      expect(result.value).toBe(120);
      expect(result.userId).toBe("user-1");
    });
  });

  describe("findAll", () => {
    it("should return paginated readings", async () => {
      const mockReadings = [
        { id: "1", value: 100, recordedAt: new Date() },
        { id: "2", value: 120, recordedAt: new Date() },
      ];

      mockPrisma.glucoseReading.findMany.mockResolvedValue(mockReadings);
      mockPrisma.glucoseReading.count.mockResolvedValue(2);

      const result = await service.findAll("user-1", { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it("should filter by date range", async () => {
      mockPrisma.glucoseReading.findMany.mockResolvedValue([]);
      mockPrisma.glucoseReading.count.mockResolvedValue(0);

      await service.findAll("user-1", {
        page: 1,
        limit: 20,
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(mockPrisma.glucoseReading.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            recordedAt: expect.objectContaining({
              gte: new Date("2024-01-01"),
              lte: new Date("2024-01-31"),
            }),
          }),
        }),
      );
    });
  });

  describe("findById", () => {
    it("should throw NotFoundException if reading not found", async () => {
      mockPrisma.glucoseReading.findUnique.mockResolvedValue(null);

      await expect(service.findById("user-1", "non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user does not own reading", async () => {
      mockPrisma.glucoseReading.findUnique.mockResolvedValue({
        id: "reading-1",
        userId: "other-user",
        value: 100,
      });

      await expect(service.findById("user-1", "reading-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should return reading if user owns it", async () => {
      mockPrisma.glucoseReading.findUnique.mockResolvedValue({
        id: "reading-1",
        userId: "user-1",
        value: 100,
      });

      const result = await service.findById("user-1", "reading-1");

      expect(result.id).toBe("reading-1");
    });
  });

  describe("getStats", () => {
    it("should return null stats if no readings", async () => {
      mockPrisma.glucoseReading.findMany.mockResolvedValue([]);

      const result = await this.service.getStats("user-1", 7);

      expect(result.average).toBeNull();
      expect(result.readingsCount).toBe(0);
    });

    it("should calculate correct stats", async () => {
      mockPrisma.glucoseReading.findMany.mockResolvedValue([
        { id: "1", value: 100, unit: "MG_DL", recordedAt: new Date() },
        { id: "2", value: 120, unit: "MG_DL", recordedAt: new Date() },
        { id: "3", value: 140, unit: "MG_DL", recordedAt: new Date() },
      ]);

      const result = await service.getStats("user-1", 7);

      expect(result.average).toBe(120);
      expect(result.min).toBe(100);
      expect(result.max).toBe(140);
      expect(result.readingsCount).toBe(3);
    });
  });

  describe("delete", () => {
    it("should delete a reading", async () => {
      mockPrisma.glucoseReading.findUnique.mockResolvedValue({
        id: "reading-1",
        userId: "user-1",
        value: 100,
      });
      mockPrisma.glucoseReading.delete.mockResolvedValue({} as any);

      const result = await service.delete("user-1", "reading-1");

      expect(result.message).toBe("Reading deleted successfully");
    });
  });
});
