import { Test, TestingModule } from "@nestjs/testing";
import { EducationService } from "./education.service";
import { PrismaService } from "../../../prisma/prisma.service";

describe("EducationService", () => {
  let service: EducationService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    educationModule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    educationProgress: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EducationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EducationService>(EducationService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all modules filtered by level", async () => {
      mockPrisma.educationModule.findMany.mockResolvedValue([
        { id: "1", code: "BASIC_01", level: 1 },
        { id: "2", code: "INTERMEDIATE_01", level: 2 },
      ]);

      const result = await service.findAll({ level: 1 });

      expect(result).toHaveLength(2);
      expect(mockPrisma.educationModule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { level: 1 } }),
      );
    });

    it("should return all modules without filter", async () => {
      mockPrisma.educationModule.findMany.mockResolvedValue([
        { id: "1", code: "BASIC_01" },
      ]);

      await service.findAll({});

      expect(mockPrisma.educationModule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe("findById", () => {
    it("should throw NotFoundException if module not found", async () => {
      mockPrisma.educationModule.findUnique.mockResolvedValue(null);

      await expect(service.findById("non-existent")).rejects.toThrow(
        "Education module not found",
      );
    });

    it("should return module by id", async () => {
      mockPrisma.educationModule.findUnique.mockResolvedValue({
        id: "module-1",
        code: "BASIC_01",
        title: "Test Module",
      });

      const result = await service.findById("module-1");

      expect(result.id).toBe("module-1");
    });
  });

  describe("getUserProgress", () => {
    it("should return user progress for module", async () => {
      mockPrisma.educationProgress.findUnique.mockResolvedValue({
        id: "progress-1",
        userId: "user-1",
        moduleId: "module-1",
        completed: true,
        completedAt: new Date(),
        score: 100,
      });

      const result = await service.getUserProgress("user-1", "module-1");

      expect(result?.completed).toBe(true);
      expect(result?.score).toBe(100);
    });

    it("should return null if no progress", async () => {
      mockPrisma.educationProgress.findUnique.mockResolvedValue(null);

      const result = await service.getUserProgress("user-1", "module-1");

      expect(result).toBeNull();
    });
  });

  describe("markAsCompleted", () => {
    it("should create new progress if not exists", async () => {
      mockPrisma.educationModule.findUnique.mockResolvedValue({
        id: "module-1",
        code: "BASIC_01",
        title: "Test",
      });
      mockPrisma.educationProgress.findUnique.mockResolvedValue(null);
      mockPrisma.educationProgress.create.mockResolvedValue({
        id: "progress-1",
        userId: "user-1",
        moduleId: "module-1",
        completed: true,
        completedAt: new Date(),
        score: 100,
        module: { id: "module-1", code: "BASIC_01" },
      });

      const result = await service.markAsCompleted("user-1", "module-1", { score: 100 });

      expect(result.completed).toBe(true);
      expect(mockPrisma.educationProgress.create).toHaveBeenCalled();
    });

    it("should update existing progress", async () => {
      mockPrisma.educationModule.findUnique.mockResolvedValue({
        id: "module-1",
        code: "BASIC_01",
        title: "Test",
      });
      mockPrisma.educationProgress.findUnique.mockResolvedValue({
        id: "progress-1",
        userId: "user-1",
        moduleId: "module-1",
        completed: false,
      });
      mockPrisma.educationProgress.update.mockResolvedValue({
        id: "progress-1",
        userId: "user-1",
        moduleId: "module-1",
        completed: true,
        completedAt: new Date(),
        score: 100,
        module: { id: "module-1", code: "BASIC_01" },
      });

      const result = await service.markAsCompleted("user-1", "module-1", { score: 100 });

      expect(result.completed).toBe(true);
      expect(mockPrisma.educationProgress.update).toHaveBeenCalled();
    });
  });

  describe("seedModules", () => {
    it("should seed all education modules", async () => {
      mockPrisma.educationModule.upsert.mockResolvedValue({} as any);

      const result = await service.seedModules();

      expect(result.seeded).toBe(4); // 4 modules in seed data
    });
  });
});
