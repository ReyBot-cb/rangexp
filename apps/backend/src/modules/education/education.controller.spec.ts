import { Test, TestingModule } from "@nestjs/testing";
import { EducationController } from "./education.controller";
import { EducationService } from "./education.service";

describe("EducationController", () => {
  let controller: EducationController;
  let educationService: jest.Mocked<EducationService>;

  const mockEducationService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    getAllUserProgress: jest.fn(),
    getUserProgress: jest.fn(),
    markAsCompleted: jest.fn(),
    submitQuiz: jest.fn(),
    seedModules: jest.fn(),
  };

  const mockModule = {
    id: "module-1",
    title: "Understanding Glucose",
    description: "Learn the basics of blood glucose",
    content: "Module content here...",
    order: 1,
    estimatedMinutes: 15,
    xpReward: 50,
  };

  const mockProgress = {
    moduleId: "module-1",
    userId: "user-1",
    completed: false,
    progress: 50,
    quizScore: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationController],
      providers: [
        { provide: EducationService, useValue: mockEducationService },
      ],
    }).compile();

    controller = module.get<EducationController>(EducationController);
    educationService = module.get(EducationService);

    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all modules", async () => {
      const query = {};
      const modules = [mockModule];

      mockEducationService.findAll.mockResolvedValue(modules);

      const result = await controller.findAll(query);

      expect(result).toEqual(modules);
      expect(mockEducationService.findAll).toHaveBeenCalledWith(query);
    });

    it("should filter modules by level", async () => {
      const query = { level: 1 };

      mockEducationService.findAll.mockResolvedValue([mockModule]);

      await controller.findAll(query);

      expect(mockEducationService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe("findById", () => {
    it("should return a specific module", async () => {
      mockEducationService.findById.mockResolvedValue(mockModule);

      const result = await controller.findById("module-1");

      expect(result).toEqual(mockModule);
      expect(mockEducationService.findById).toHaveBeenCalledWith("module-1");
    });
  });

  describe("getAllProgress", () => {
    it("should return all user progress", async () => {
      const req = { user: { id: "user-1" } };
      const allProgress = [mockProgress];

      mockEducationService.getAllUserProgress.mockResolvedValue(allProgress);

      const result = await controller.getAllProgress(req);

      expect(result).toEqual(allProgress);
      expect(mockEducationService.getAllUserProgress).toHaveBeenCalledWith("user-1");
    });
  });

  describe("getModuleProgress", () => {
    it("should return user progress for a specific module", async () => {
      const req = { user: { id: "user-1" } };

      mockEducationService.getUserProgress.mockResolvedValue(mockProgress);

      const result = await controller.getModuleProgress(req, "module-1");

      expect(result).toEqual(mockProgress);
      expect(mockEducationService.getUserProgress).toHaveBeenCalledWith("user-1", "module-1");
    });
  });

  describe("markAsCompleted", () => {
    it("should mark a module as completed", async () => {
      const req = { user: { id: "user-1" } };
      const dto = { score: 100 };
      const expectedResult = {
        ...mockProgress,
        completed: true,
        completedAt: "2024-01-15T10:00:00Z",
        xpEarned: 50,
      };

      mockEducationService.markAsCompleted.mockResolvedValue(expectedResult);

      const result = await controller.markAsCompleted(req, "module-1", dto);

      expect(result).toEqual(expectedResult);
      expect(mockEducationService.markAsCompleted).toHaveBeenCalledWith(
        "user-1",
        "module-1",
        dto
      );
    });

    it("should mark as completed without score", async () => {
      const req = { user: { id: "user-1" } };
      const dto = {};
      const expectedResult = {
        ...mockProgress,
        completed: true,
      };

      mockEducationService.markAsCompleted.mockResolvedValue(expectedResult);

      const result = await controller.markAsCompleted(req, "module-1", dto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe("submitQuiz", () => {
    it("should submit quiz answers and return result", async () => {
      const req = { user: { id: "user-1" } };
      const dto = {
        answers: { q1: "a", q2: "c" },
      };
      const expectedResult = {
        score: 80,
        passed: true,
        correctAnswers: 4,
        totalQuestions: 5,
        xpEarned: 25,
      };

      mockEducationService.submitQuiz.mockResolvedValue(expectedResult);

      const result = await controller.submitQuiz(req, "module-1", dto);

      expect(result).toEqual(expectedResult);
      expect(mockEducationService.submitQuiz).toHaveBeenCalledWith(
        "user-1",
        "module-1",
        dto
      );
    });

    it("should return failed result for low score", async () => {
      const req = { user: { id: "user-1" } };
      const dto = { answers: { q1: "b" } };
      const expectedResult = {
        score: 40,
        passed: false,
        correctAnswers: 2,
        totalQuestions: 5,
        xpEarned: 0,
      };

      mockEducationService.submitQuiz.mockResolvedValue(expectedResult);

      const result = await controller.submitQuiz(req, "module-1", dto);

      expect(result.passed).toBe(false);
      expect(result.xpEarned).toBe(0);
    });
  });

  describe("seedModules", () => {
    it("should seed education modules", async () => {
      const expectedResult = {
        message: "Education modules seeded successfully",
        count: 10,
      };

      mockEducationService.seedModules.mockResolvedValue(expectedResult);

      const result = await controller.seedModules();

      expect(result).toEqual(expectedResult);
      expect(mockEducationService.seedModules).toHaveBeenCalled();
    });
  });
});
